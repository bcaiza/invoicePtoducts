import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Form,
  Select,
  InputNumber,
  message,
  Space,
  Modal,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import recipeService from '../../services/recipeService';
import rawMaterialService from '../../services/rawMaterialService';
import productService from '../../services/productService';

const ProductRecipe = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [product, setProduct] = useState(null);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [yieldQuantity, setYieldQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadProduct();
    loadRawMaterials();
    loadRecipe();
  }, [productId]);

  useEffect(() => {
    calculateTotalCost();
  }, [ingredients, rawMaterials]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      message.error('Error al cargar producto');
    }
  };

  const loadRawMaterials = async () => {
    try {
      const data = await rawMaterialService.getRawMaterials({ limit: 1000 });
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
          data.recipes.map((r) => ({
            id: r.id,
            raw_material_id: r.raw_material_id,
            quantity: parseFloat(r.quantity),
            rawMaterial: r.rawMaterial
          }))
        );
        setYieldQuantity(data.yield_quantity || 1);
      }
    } catch (error) {
      console.error('Error al cargar receta:', error);
    }
  };

  const calculateTotalCost = () => {
    const cost = ingredients.reduce((sum, ing) => {
      const rawMat = rawMaterials.find((rm) => rm.id === ing.raw_material_id);
      if (rawMat) {
        return sum + parseFloat(rawMat.unit_cost) * ing.quantity;
      }
      return sum;
    }, 0);
    setTotalCost(cost);
  };

  const handleAddIngredient = (values) => {
    const rawMat = rawMaterials.find((rm) => rm.id === values.raw_material_id);
    
    if (ingredients.find((i) => i.raw_material_id === values.raw_material_id)) {
      message.warning('Este ingrediente ya está en la receta');
      return;
    }

    setIngredients([
      ...ingredients,
      {
        raw_material_id: values.raw_material_id,
        quantity: values.quantity,
        rawMaterial: rawMat
      }
    ]);

    form.resetFields();
  };

  const handleRemoveIngredient = (raw_material_id) => {
    setIngredients(ingredients.filter((i) => i.raw_material_id !== raw_material_id));
  };

  const handleSaveRecipe = async () => {
    if (ingredients.length === 0) {
      message.warning('Debe agregar al menos un ingrediente');
      return;
    }

    if (yieldQuantity <= 0) {
      message.warning('La cantidad de producción debe ser mayor a 0');
      return;
    }

    Modal.confirm({
      title: '¿Guardar receta?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esto sobrescribirá la receta anterior si existe',
      okText: 'Sí, guardar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          setLoading(true);
          await recipeService.saveRecipe({
            product_id: productId,
            yield_quantity: yieldQuantity,
            ingredients: ingredients.map((i) => ({
              raw_material_id: i.raw_material_id,
              quantity: i.quantity
            }))
          });
          message.success('Receta guardada correctamente');
          navigate('/products');
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
          <strong>{record.rawMaterial?.name}</strong>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Stock: {parseFloat(record.rawMaterial?.stock || 0).toFixed(2)}{' '}
            {record.rawMaterial?.unit_of_measure}
          </div>
        </div>
      )
    },
    {
      title: 'Cantidad Necesaria',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) =>
        `${parseFloat(quantity).toFixed(2)} ${record.rawMaterial?.unit_of_measure}`
    },
    {
      title: 'Costo',
      key: 'cost',
      render: (_, record) => {
        const cost = parseFloat(record.rawMaterial?.unit_cost || 0) * record.quantity;
        return `$${cost.toFixed(2)}`;
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          size="small"
          danger
          onClick={() => handleRemoveIngredient(record.raw_material_id)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={`Receta de Producto: ${product?.name || ''}`}
        extra={
          <Button onClick={() => navigate('/products')}>
            Volver
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Cantidad de Producción"
                value={yieldQuantity}
                suffix="unidades"
              />
              <InputNumber
                min={1}
                value={yieldQuantity}
                onChange={(val) => setYieldQuantity(val)}
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Cantidad a producir"
              />
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                Cantidad de productos que se obtienen con esta receta
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Costo Total"
                value={totalCost.toFixed(2)}
                prefix="$"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Costo por Unidad"
                value={yieldQuantity > 0 ? (totalCost / yieldQuantity).toFixed(2) : '0.00'}
                prefix="$"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Divider>Agregar Ingrediente</Divider>

        <Form form={form} onFinish={handleAddIngredient} layout="inline">
          <Form.Item
            name="raw_material_id"
            rules={[{ required: true, message: 'Seleccione un ingrediente' }]}
            style={{ width: '40%' }}
          >
            <Select
              showSearch
              placeholder="Seleccione materia prima"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {rawMaterials.map((rm) => (
                <Select.Option key={rm.id} value={rm.id}>
                  {rm.name} ({rm.unit_of_measure})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            rules={[{ required: true, message: 'Ingrese cantidad' }]}
            style={{ width: '25%' }}
          >
            <InputNumber
              min={0.01}
              step={0.01}
              placeholder="Cantidad"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="dashed" htmlType="submit" icon={<PlusOutlined />}>
              Agregar
            </Button>
          </Form.Item>
        </Form>

        <Divider>Ingredientes de la Receta</Divider>

        <Table
          columns={columns}
          dataSource={ingredients}
          rowKey="raw_material_id"
          pagination={false}
          locale={{ emptyText: 'No hay ingredientes en la receta' }}
          style={{ marginBottom: '24px' }}
        />

        <Button
          type="primary"
          icon={<SaveOutlined />}
          size="large"
          block
          onClick={handleSaveRecipe}
          loading={loading}
          disabled={ingredients.length === 0}
        >
          Guardar Receta
        </Button>
      </Card>
    </div>
  );
};

export default ProductRecipe;