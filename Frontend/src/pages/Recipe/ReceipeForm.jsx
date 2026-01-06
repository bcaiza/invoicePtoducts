import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Form,
  Select,
  Input,
  message,
  Space,
  Modal,
  Statistic,
  Row,
  Col,
  Divider,
  Alert,
  Tag,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import recipeService from '../../services/recipeService';
import rawMaterialService from '../../services/rawMaterialService';
import productService from '../../services/productService';

const { TextArea } = Input;

const RecipeForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [product, setProduct] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [expectedQuantity, setExpectedQuantity] = useState(1);

  useEffect(() => {
    loadData();
  }, [productId]);

  // Cargar todo en secuencia para evitar problemas de sincronización
  const loadData = async () => {
    await loadProduct();
    await loadRawMaterials();
  };

  // Cargar materias primas y luego la receta
  useEffect(() => {
    if (rawMaterials.length > 0) {
      loadRecipe();
    }
  }, [rawMaterials]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      message.error('Error al cargar producto');
      navigate('/recipes');
    }
  };

  const loadRawMaterials = async () => {
    try {
      const data = await rawMaterialService.getRawMaterials({ limit: 1000, active: true });
      setRawMaterials(data.data || []);
    } catch (error) {
      message.error('Error al cargar materias primas');
    }
  };

  const loadRecipe = async () => {
    try {
      const data = await recipeService.getProductRecipe(productId);
      if (data.recipes && data.recipes.length > 0) {
        setIngredients(
          data.recipes.map((r) => {
            // Buscar la materia prima en el array de rawMaterials
            const rawMat = rawMaterials.find((rm) => rm.id === r.raw_material_id);
            return {
              id: r.id,
              raw_material_id: r.raw_material_id,
              notes: r.notes,
              rawMaterial: rawMat || r.rawMaterial // Usar la encontrada o la que viene del servidor
            };
          })
        );
        // Cargar la cantidad esperada si existe
        if (data.expected_quantity) {
          setExpectedQuantity(data.expected_quantity);
        }
      }
    } catch (error) {
      console.error('Error al cargar receta:', error);
    }
  };

  const handleAddIngredient = (values) => {
    const rawMat = rawMaterials.find((rm) => rm.id === values.raw_material_id);
    
    if (ingredients.find((i) => i.raw_material_id === values.raw_material_id)) {
      message.warning('Este ingrediente ya está en la receta');
      return;
    }

    if (!rawMat) {
      message.error('Materia prima no encontrada');
      return;
    }

    setIngredients([
      ...ingredients,
      {
        raw_material_id: values.raw_material_id,
        notes: values.notes || null,
        rawMaterial: rawMat
      }
    ]);

    form.resetFields();
    message.success('Ingrediente agregado');
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient.raw_material_id);
    form.setFieldsValue({
      raw_material_id: ingredient.raw_material_id,
      notes: ingredient.notes
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateIngredient = (values) => {
    // Usar editingIngredient en lugar de values.raw_material_id
    // porque el campo está deshabilitado y no envía su valor
    const rawMat = rawMaterials.find((rm) => rm.id === editingIngredient);
    
    if (!rawMat) {
      message.error('Materia prima no encontrada');
      return;
    }

    setIngredients(
      ingredients.map((ing) =>
        ing.raw_material_id === editingIngredient
          ? {
              ...ing,
              notes: values.notes || null,
              rawMaterial: rawMat
            }
          : ing
      )
    );

    form.resetFields();
    setEditingIngredient(null);
    message.success('Ingrediente actualizado');
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setEditingIngredient(null);
    message.info('Edición cancelada');
  };

  const handleFormSubmit = (values) => {
    if (editingIngredient) {
      handleUpdateIngredient(values);
    } else {
      handleAddIngredient(values);
    }
  };

  const handleRemoveIngredient = (raw_material_id) => {
    Modal.confirm({
      title: '¿Eliminar ingrediente?',
      icon: <ExclamationCircleOutlined />,
      content: '¿Está seguro de eliminar este ingrediente de la receta?',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setIngredients(ingredients.filter((i) => i.raw_material_id !== raw_material_id));
        if (editingIngredient === raw_material_id) {
          form.resetFields();
          setEditingIngredient(null);
        }
        message.success('Ingrediente eliminado');
      }
    });
  };

  const handleSaveRecipe = async () => {
    if (ingredients.length === 0) {
      message.warning('Debe agregar al menos un ingrediente a la receta');
      return;
    }

    if (!expectedQuantity || expectedQuantity <= 0) {
      message.warning('La cantidad esperada debe ser mayor a 0');
      return;
    }

    Modal.confirm({
      title: '¿Guardar receta?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esto sobrescribirá la receta anterior si existe. ¿Desea continuar?',
      okText: 'Sí, guardar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          setLoading(true);
          await recipeService.saveRecipe({
            product_id: productId,
            expected_quantity: expectedQuantity,
            materials: ingredients.map((i) => ({
              raw_material_id: i.raw_material_id,
              notes: i.notes
            }))
          });
          message.success('Receta guardada correctamente');
          navigate('/recipes');
        } catch (error) {
          message.error(error.response?.data?.message || 'Error al guardar receta');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Ingrediente',
      key: 'ingredient',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {record.rawMaterial?.name || 'Cargando...'}
          </div>
          {record.rawMaterial?.description && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {record.rawMaterial.description}
            </div>
          )}
          {editingIngredient === record.raw_material_id && (
            <Tag color="orange" className="mt-2">Editando</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {notes || <span className="italic text-slate-400">Sin notas</span>}
        </div>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            type={editingIngredient === record.raw_material_id ? 'primary' : 'default'}
            className="rounded-lg"
            onClick={() => handleEditIngredient(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            className="rounded-lg"
            onClick={() => handleRemoveIngredient(record.raw_material_id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
        <div className="flex items-center justify-between mb-6">
          <Space size="large">
            <h2 className="m-0 text-2xl font-bold text-slate-800 dark:text-slate-100">
              Receta: {product?.name || 'Cargando...'}
            </h2>
            {product?.category && (
              <Tag color="purple" className="px-3 py-1 text-base rounded-lg">
                {product.category}
              </Tag>
            )}
          </Space>
          <Button 
            icon={<ArrowLeftOutlined />}
            size="large"
            className="rounded-lg"
            onClick={() => navigate('/recipes')}
          >
            Volver
          </Button>
        </div>

        {/* Estadísticas */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
              <Statistic
                title={<span className="text-slate-600 dark:text-slate-400">Total de Ingredientes</span>}
                value={ingredients.length}
                suffix="items"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
              <Statistic
                title={<span className="text-slate-600 dark:text-slate-400">Precio de Venta</span>}
                value={product?.price || 0}
                prefix="$"
                precision={2}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
              <Statistic
                title={<span className="text-slate-600 dark:text-slate-400">Productos Esperados</span>}
                value={expectedQuantity}
                suffix="unidades"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
              <Statistic
                title={<span className="text-slate-600 dark:text-slate-400">Estado</span>}
                value={product?.active ? 'Activo' : 'Inactivo'}
                valueStyle={{ color: product?.active ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Campo para editar cantidad esperada */}
        <Card className="mb-6 rounded-xl border-slate-200 dark:border-dark-700 dark:bg-dark-800">
          <Row gutter={16} align="middle">
            <Col xs={24} md={12}>
              <div>
                <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">
                  Cantidad de Productos Esperados
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Especifique cuántas unidades del producto se espera producir con esta receta
                </p>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="flex items-center gap-3 mt-4 md:mt-0 md:justify-end">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cantidad:
                </span>
                <InputNumber
                  min={1}
                  max={999999}
                  value={expectedQuantity}
                  onChange={(value) => setExpectedQuantity(value || 1)}
                  size="large"
                  className="w-full md:w-48"
                  suffix="unidades"
                  placeholder="Ingrese cantidad"
                />
              </div>
            </Col>
          </Row>
        </Card>

        {/* Alerta si no hay ingredientes */}
        {ingredients.length === 0 && (
          <Alert
            message="Esta receta aún no tiene ingredientes"
            description="Agregue al menos un ingrediente para poder guardar la receta."
            type="info"
            showIcon
            className="mb-6 rounded-lg"
          />
        )}

        {/* Alerta cuando está editando */}
        {editingIngredient && (
          <Alert
            message="Modo Edición Activo"
            description="Está editando un ingrediente. Modifique los valores y haga clic en 'Actualizar' o 'Cancelar'."
            type="warning"
            showIcon
            className="mb-6 rounded-lg"
            closable
            onClose={handleCancelEdit}
          />
        )}

        <Divider className="text-slate-600 dark:text-slate-400">
          {editingIngredient ? 'Editar Ingrediente' : 'Agregar Ingrediente'}
        </Divider>

        {/* Formulario */}
        <Form 
          form={form} 
          onFinish={handleFormSubmit} 
          layout="vertical"
        >
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item
                name="raw_material_id"
                label={<span className="text-slate-700 dark:text-slate-300">Materia Prima</span>}
                rules={[{ required: true, message: 'Seleccione un ingrediente' }]}
              >
                <Select
                  showSearch
                  placeholder="Seleccione materia prima"
                  optionFilterProp="children"
                  size="large"
                  className="rounded-lg"
                  disabled={editingIngredient !== null}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {rawMaterials.map((rm) => (
                    <Select.Option key={rm.id} value={rm.id}>
                      {rm.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <Form.Item
                name="notes"
                label={<span className="text-slate-700 dark:text-slate-300">Notas (opcional)</span>}
              >
                <TextArea
                  rows={1}
                  placeholder="Ej: 2 unidades, cocinar a fuego lento, etc."
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Space direction="vertical" className="w-full">
                  <Button 
                    type={editingIngredient ? 'primary' : 'dashed'}
                    htmlType="submit" 
                    icon={editingIngredient ? <SaveOutlined /> : <PlusOutlined />}
                    size="large"
                    block
                    className="rounded-lg"
                  >
                    {editingIngredient ? 'Actualizar' : 'Agregar'}
                  </Button>
                  {editingIngredient && (
                    <Button 
                      onClick={handleCancelEdit}
                      size="large"
                      block
                      className="rounded-lg"
                    >
                      Cancelar
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider className="text-slate-600 dark:text-slate-400">Ingredientes de la Receta</Divider>

        <Table
          columns={columns}
          dataSource={ingredients}
          rowKey="raw_material_id"
          pagination={false}
          locale={{ emptyText: 'No hay ingredientes en la receta' }}
          className="mb-6 overflow-x-auto"
          scroll={{ x: 800 }}
          rowClassName={(record) => 
            editingIngredient === record.raw_material_id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
          }
        />

        <Row gutter={16}>
          <Col span={24}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              block
              className="rounded-lg"
              onClick={handleSaveRecipe}
              loading={loading}
              disabled={ingredients.length === 0}
            >
              Guardar Receta
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RecipeForm;