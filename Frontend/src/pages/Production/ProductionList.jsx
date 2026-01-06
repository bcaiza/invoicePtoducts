import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  message,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  InputNumber,
  Form,
  Select,
  Alert,
  Divider,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Package, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import productionService from "../../services/productionService";
import productService from "../../services/productService";
import recipeService from "../../services/recipeService";
import moment from "moment";

const { Search } = Input;
const { TextArea } = Input;

const ProductionList = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    in_process: 0,
    completed: 0,
    cancelled: 0,
  });

  // Productos para el modal de crear
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipe, setRecipe] = useState([]);
  const [recipeExpectedQty, setRecipeExpectedQty] = useState(null);

  // Modal Crear
  const [createModal, setCreateModal] = useState(false);
  const [createForm] = Form.useForm();

  // Modal Editar
  const [editModal, setEditModal] = useState({
    visible: false,
    production: null,
  });
  const [editForm] = Form.useForm();

  // Modal Completar
  const [completeModal, setCompleteModal] = useState({
    visible: false,
    production: null,
  });
  const [completeForm] = Form.useForm();

  useEffect(() => {
    loadProductions();
    loadStats();
  }, [statusFilter]);

  const loadProductions = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        status: statusFilter || undefined,
      };

      const data = await productionService.getProductions(params);

      setProductions(data.data || []);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total,
      });
    } catch (error) {
      message.error("Error al cargar producciones");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await productionService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getProducts({
        limit: 1000,
        active: true,
      });
      setProducts(data.data || []);
    } catch (error) {
      message.error("Error al cargar productos");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleTableChange = (newPagination) => {
    loadProductions(newPagination.current, newPagination.pageSize);
  };

  // ==================== MODAL CREAR ====================
  const showCreateModal = () => {
    setCreateModal(true);
    loadProducts();
    createForm.resetFields();
    setSelectedProduct(null);
    setRecipe([]);
    setRecipeExpectedQty(null);
  };

  const handleProductChange = async (productId) => {
    try {
      const product = products.find((p) => p.id === productId);
      setSelectedProduct(product);

      // Cargar receta del producto
      const recipeData = await recipeService.getProductRecipe(productId);

      if (recipeData.recipes && recipeData.recipes.length > 0) {
        setRecipe(recipeData.recipes);
        setRecipeExpectedQty(recipeData.expected_quantity);

        // Pre-llenar el formulario con la cantidad esperada de la receta
        createForm.setFieldsValue({
          expected_quantity: recipeData.expected_quantity || 1,
        });
      } else {
        setRecipe([]);
        setRecipeExpectedQty(null);
        message.warning("Este producto no tiene receta configurada");
      }
    } catch (error) {
      console.error("Error al cargar receta:", error);
      setRecipe([]);
      setRecipeExpectedQty(null);
    }
  };

  const handleCreate = async (values) => {
    if (recipe.length === 0) {
      message.error(
        "El producto seleccionado no tiene receta. Configure una receta antes de producir."
      );
      return;
    }

    try {
      await productionService.createProduction(values);
      message.success("Producción creada correctamente");
      setCreateModal(false);
      createForm.resetFields();
      setSelectedProduct(null);
      setRecipe([]);
      setRecipeExpectedQty(null);
      loadProductions();
      loadStats();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Error al crear producción"
      );
    }
  };

  const showEditModal = (production) => {
    setEditModal({
      visible: true,
      production,
    });
    editForm.setFieldsValue({
      expected_quantity: parseFloat(production.expected_quantity), 
      notes: production.notes,
    });
  };

  const handleEdit = async (values) => {
    try {
      await productionService.updateProduction(editModal.production.id, values);
      message.success("Producción actualizada correctamente");
      setEditModal({ visible: false, production: null });
      editForm.resetFields();
      loadProductions();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Error al actualizar producción"
      );
    }
  };

  const showCompleteModal = (production) => {
  setCompleteModal({
    visible: true,
    production,
  });
  completeForm.setFieldsValue({
    produced_quantity: parseFloat(production.expected_quantity), 
  });
};
  const handleComplete = async (values) => {
    try {
      await productionService.completeProduction(
        completeModal.production.id,
        values
      );
      message.success(
        "Producción finalizada correctamente. Stock actualizado."
      );
      setCompleteModal({ visible: false, production: null });
      completeForm.resetFields();
      loadProductions();
      loadStats();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Error al finalizar producción"
      );
    }
  };

  // ==================== CANCELAR ====================
  const handleCancel = (productionId) => {
    Modal.confirm({
      title: "¿Cancelar producción?",
      icon: <ExclamationCircleOutlined />,
      content: "¿Está seguro de cancelar esta producción?",
      okText: "Sí, cancelar",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await productionService.cancelProduction(productionId);
          message.success("Producción cancelada");
          loadProductions();
          loadStats();
        } catch (error) {
          message.error(error.response?.data?.message || "Error al cancelar");
        }
      },
    });
  };

  // ==================== ELIMINAR ====================
  const handleDelete = (productionId) => {
    Modal.confirm({
      title: "¿Eliminar producción?",
      icon: <ExclamationCircleOutlined />,
      content: "¿Está seguro de eliminar esta producción?",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await productionService.deleteProduction(productionId);
          message.success("Producción eliminada");
          loadProductions();
          loadStats();
        } catch (error) {
          message.error(error.response?.data?.message || "Error al eliminar");
        }
      },
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      in_process: {
        color: "processing",
        text: "En Proceso",
        icon: <Clock size={14} />,
      },
      completed: {
        color: "success",
        text: "Finalizado",
        icon: <CheckCircle2 size={14} />,
      },
      cancelled: {
        color: "error",
        text: "Cancelado",
        icon: <AlertCircle size={14} />,
      },
    };
    return configs[status] || configs.in_process;
  };

  const columns = [
    {
      title: "Producto",
      dataIndex: ["product", "name"],
      key: "product",
      width: 200,
      render: (text) => (
        <div className="font-semibold text-slate-800 dark:text-slate-100">
          {text}
        </div>
      ),
    },
    {
      title: "Cantidad Esperada",
      dataIndex: "expected_quantity",
      key: "expected_quantity",
      width: 140,
      align: "center",
      render: (qty) => (
        <Tag color="blue" className="font-medium rounded-lg">
          {parseFloat(qty).toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Cantidad Producida",
      dataIndex: "produced_quantity",
      key: "produced_quantity",
      width: 150,
      align: "center",
      render: (qty) =>
        qty ? (
          <Tag color="green" className="font-medium rounded-lg">
            {parseFloat(qty).toFixed(2)}
          </Tag>
        ) : (
          <Tag color="default" className="rounded-lg">
            Pendiente
          </Tag>
        ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} className="rounded-lg" icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Fecha",
      dataIndex: "production_date",
      key: "production_date",
      width: 150,
      render: (date) => (
        <span className="text-slate-600 dark:text-slate-400">
          {moment(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: "Notas",
      dataIndex: "notes",
      key: "notes",
      width: 200,
      ellipsis: true,
      render: (notes) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {notes || "-"}
        </span>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          {record.status === "in_process" && (
            <>
              <Button
                type="default"
                size="small"
                icon={<EditOutlined />}
                className="rounded-lg"
                onClick={() => showEditModal(record)}
              >
                Editar
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                className="rounded-lg"
                onClick={() => showCompleteModal(record)}
              >
                Finalizar
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                className="rounded-lg"
                onClick={() => handleCancel(record.id)}
              >
                Cancelar
              </Button>
            </>
          )}
          {record.status !== "completed" && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="rounded-lg"
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const recipeColumns = [
    {
      title: "Materia Prima",
      dataIndex: "notes",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="text-sm font-semibold">{text}</div>
          {record.rawMaterial?.description && (
            <div className="text-xs text-slate-500">
              {record.rawMaterial.name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Notas",
      dataIndex: "notes",
      key: "notes",
      render: (notes) => (
        <span className="text-xs text-slate-600">{notes || "-"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
            <Statistic
              title={
                <span className="text-slate-600 dark:text-slate-400">
                  Total
                </span>
              }
              value={stats.total}
              valueStyle={{ color: "#1890ff" }}
              prefix={<Package size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
            <Statistic
              title={
                <span className="text-slate-600 dark:text-slate-400">
                  En Proceso
                </span>
              }
              value={stats.in_process}
              valueStyle={{ color: "#faad14" }}
              prefix={<Clock size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
            <Statistic
              title={
                <span className="text-slate-600 dark:text-slate-400">
                  Finalizados
                </span>
              }
              value={stats.completed}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircle2 size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
            <Statistic
              title={
                <span className="text-slate-600 dark:text-slate-400">
                  Cancelados
                </span>
              }
              value={stats.cancelled}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<AlertCircle size={20} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros y acciones */}
      <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={16}>
            <Space className="w-full" direction="vertical">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Filtrar por estado:
              </span>
              <Space.Compact className="w-full">
                <Button
                  type={statusFilter === "" ? "primary" : "default"}
                  onClick={() => setStatusFilter("")}
                  className="rounded-l-lg"
                >
                  Todos
                </Button>
                <Button
                  type={statusFilter === "in_process" ? "primary" : "default"}
                  onClick={() => setStatusFilter("in_process")}
                >
                  En Proceso
                </Button>
                <Button
                  type={statusFilter === "completed" ? "primary" : "default"}
                  onClick={() => setStatusFilter("completed")}
                >
                  Finalizados
                </Button>
                <Button
                  type={statusFilter === "cancelled" ? "primary" : "default"}
                  onClick={() => setStatusFilter("cancelled")}
                  className="rounded-r-lg"
                >
                  Cancelados
                </Button>
              </Space.Compact>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8} className="mt-4 sm:mt-0">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="w-full rounded-lg"
              onClick={showCreateModal}
            >
              Nueva Producción
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla */}
      <Card className="rounded-xl border-slate-200 dark:border-dark-800 dark:bg-dark-900">
        <Table
          columns={columns}
          dataSource={productions}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} producciones`,
            className: "px-4",
          }}
          onChange={handleTableChange}
          className="overflow-x-auto"
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* ==================== MODAL CREAR PRODUCCIÓN ==================== */}
      <Modal
        title="Nueva Producción"
        open={createModal}
        onCancel={() => {
          setCreateModal(false);
          createForm.resetFields();
          setSelectedProduct(null);
          setRecipe([]);
          setRecipeExpectedQty(null);
        }}
        footer={null}
        width={700}
        className="rounded-xl"
      >
        <Alert
          message="Información"
          description="Registre una nueva orden de producción. Al finalizar, se sumará automáticamente al stock del producto."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-4 rounded-lg"
        />

        <Form
          form={createForm}
          onFinish={handleCreate}
          layout="vertical"
          initialValues={{ expected_quantity: 1 }}
        >
          <Form.Item
            name="product_id"
            label={
              <span className="text-slate-700 dark:text-slate-300">
                Producto a Fabricar
              </span>
            }
            rules={[{ required: true, message: "Seleccione un producto" }]}
          >
            <Select
              showSearch
              placeholder="Seleccione el producto"
              size="large"
              className="rounded-lg"
              loading={loadingProducts}
              onChange={handleProductChange}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="expected_quantity"
            label={
              <span className="text-slate-700 dark:text-slate-300">
                Cantidad esperada
              </span>
            }
            rules={[
              { required: true, message: "Ingrese la cantidad" },
              { type: "number", min: 0.01, message: "Debe ser mayor a 0" },
            ]}
          >
            <InputNumber
              min={0.01}
              step={0.01}
              placeholder="0.00"
              size="large"
              className="w-full rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label={
              <span className="text-slate-700 dark:text-slate-300">
                Notas (Opcional)
              </span>
            }
          >
            <TextArea
              rows={2}
              placeholder="Observaciones o notas"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          {/* Información del producto seleccionado */}
          {selectedProduct && (
            <>
              <Divider className="text-slate-600 dark:text-slate-400">
                Información del Producto
              </Divider>

              <div className="p-3 mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <Space direction="vertical" className="w-full" size="small">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Nombre:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {selectedProduct.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Stock Actual:
                    </span>
                    <Tag color="green" className="font-medium rounded-lg">
                      {parseFloat(selectedProduct.stock || 0).toFixed(2)}
                    </Tag>
                  </div>
                  {selectedProduct.pvp && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Precio:
                      </span>
                      <span className="font-semibold text-green-600">
                        ${parseFloat(selectedProduct.pvp).toFixed(2)}
                      </span>
                    </div>
                  )}
                </Space>
              </div>

              {/* Receta */}
              {recipe.length > 0 ? (
                <>
                  <Divider className="text-slate-600 dark:text-slate-400">
                    <Space>
                      Receta del Producto
                      {recipeExpectedQty && (
                        <Tag color="purple" className="font-medium rounded-lg">
                          Cantidad a producir:{" "}
                          {parseFloat(recipeExpectedQty).toFixed(2)}
                        </Tag>
                      )}
                    </Space>
                  </Divider>
                  <Table
                    columns={recipeColumns}
                    dataSource={recipe}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="mb-3"
                  />
                  <Alert
                    message="Nota"
                    description="Esta receta es solo referencial. Las materias primas no se descontarán del inventario."
                    type="warning"
                    showIcon
                    className="rounded-lg"
                    size="small"
                  />
                </>
              ) : (
                <Alert
                  message="Sin Receta"
                  description="Este producto no tiene receta. Debe configurar una receta antes de crear la producción."
                  type="error"
                  showIcon
                  className="rounded-lg"
                />
              )}
            </>
          )}

          <div className="flex justify-end mt-4 space-x-2">
            <Button
              onClick={() => {
                setCreateModal(false);
                createForm.resetFields();
                setSelectedProduct(null);
                setRecipe([]);
                setRecipeExpectedQty(null);
              }}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              disabled={!selectedProduct || recipe.length === 0}
              className="rounded-lg"
            >
              Crear Producción
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ==================== MODAL EDITAR PRODUCCIÓN ==================== */}
      <Modal
        title="Editar Producción"
        open={editModal.visible}
        onCancel={() => {
          setEditModal({ visible: false, production: null });
          editForm.resetFields();
        }}
        footer={null}
        className="rounded-xl"
      >
        {editModal.production && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {editModal.production.product?.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Estado: En Proceso
              </p>
            </div>

            <Form form={editForm} onFinish={handleEdit} layout="vertical">
              <Form.Item
                name="expected_quantity"
                label={
                  <span className="text-slate-700 dark:text-slate-300">
                    Cantidad Esperada
                  </span>
                }
                rules={[
                  { required: true, message: "Ingrese la cantidad esperada" },
                  { type: "number", min: 0.01, message: "Debe ser mayor a 0" },
                ]}
              >
                <InputNumber
                  min={0.01}
                  step={0.01}
                  placeholder="0.00"
                  size="large"
                  className="w-full rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label={
                  <span className="text-slate-700 dark:text-slate-300">
                    Notas (Opcional)
                  </span>
                }
              >
                <TextArea
                  rows={3}
                  placeholder="Observaciones o notas"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  onClick={() => {
                    setEditModal({ visible: false, production: null });
                    editForm.resetFields();
                  }}
                  className="rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<EditOutlined />}
                  className="rounded-lg"
                >
                  Guardar Cambios
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL FINALIZAR PRODUCCIÓN ==================== */}
      <Modal
        title="Finalizar Producción"
        open={completeModal.visible}
        onCancel={() => {
          setCompleteModal({ visible: false, production: null });
          completeForm.resetFields();
        }}
        footer={null}
        className="rounded-xl"
      >
        {completeModal.production && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {completeModal.production.product?.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Cantidad esperada:{" "}
                {parseFloat(completeModal.production.expected_quantity).toFixed(
                  2
                )}
              </p>
            </div>

            <Form
              form={completeForm}
              onFinish={handleComplete}
              layout="vertical"
            >
              <Form.Item
                name="produced_quantity"
                label={
                  <span className="text-slate-700 dark:text-slate-300">
                    Cantidad Producida
                  </span>
                }
                rules={[
                  { required: true, message: "Ingrese la cantidad producida" },
                  { type: "number", min: 0.01, message: "Debe ser mayor a 0" },
                ]}
              >
                <InputNumber
                  min={0.01}
                  step={0.01}
                  placeholder="0.00"
                  size="large"
                  className="w-full rounded-lg"
                />
              </Form.Item>

              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Al finalizar, esta cantidad se sumará automáticamente al
                  stock del producto.
                </p>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  onClick={() => {
                    setCompleteModal({ visible: false, production: null });
                    completeForm.resetFields();
                  }}
                  className="rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckCircleOutlined />}
                  className="rounded-lg"
                >
                  Finalizar Producción
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductionList;
