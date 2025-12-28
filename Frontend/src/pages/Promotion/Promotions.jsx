import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  message,
  Space,
  Card,
  Tag,
  Popconfirm,
  Row,
  Col,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  PercentageOutlined,
  DollarOutlined
} from '@ant-design/icons';
import promotionService from '../../services/promotionService';
import productService from '../../services/productService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Promotions = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    loadPromotions();
    loadProducts();
  }, []);

  const loadPromotions = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize
      };

      const response = await promotionService.getAll(params);
      setPromotions(response.data);
      setPagination({
        ...pagination,
        current: response.pagination.page,
        total: response.pagination.total
      });
    } catch (error) {
      message.error('Error al cargar promociones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000, active: true });
      setProducts(response.data || []);
    } catch (error) {
      message.error('Error al cargar productos');
    }
  };

  const handleTableChange = (newPagination) => {
    loadPromotions(newPagination.current);
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        name: record.name,
        description: record.description,
        product_id: record.product_id,
        promotion_type: record.promotion_type,
        buy_quantity: record.buy_quantity,
        get_quantity: record.get_quantity,
        discount_percentage: record.discount_percentage,
        discount_amount: record.discount_amount,
        min_quantity: record.min_quantity,
        date_range: record.start_date && record.end_date 
          ? [dayjs(record.start_date), dayjs(record.end_date)]
          : null,
        active: record.active
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const promotionData = {
        name: values.name,
        description: values.description,
        product_id: values.product_id,
        promotion_type: values.promotion_type,
        active: values.active !== undefined ? values.active : true
      };

      // Campos según tipo de promoción
      if (values.promotion_type === 'buy_x_get_y') {
        promotionData.buy_quantity = values.buy_quantity;
        promotionData.get_quantity = values.get_quantity;
      } else if (values.promotion_type === 'percentage_discount') {
        promotionData.discount_percentage = values.discount_percentage;
        promotionData.min_quantity = values.min_quantity || 1;
      } else if (values.promotion_type === 'fixed_discount') {
        promotionData.discount_amount = values.discount_amount;
        promotionData.min_quantity = values.min_quantity || 1;
      }

      // Fechas
      if (values.date_range && values.date_range.length === 2) {
        promotionData.start_date = values.date_range[0].toISOString();
        promotionData.end_date = values.date_range[1].toISOString();
      }

      if (editingId) {
        await promotionService.update(editingId, promotionData);
        message.success('Promoción actualizada exitosamente');
      } else {
        await promotionService.create(promotionData);
        message.success('Promoción creada exitosamente');
      }
      handleCloseModal();
      loadPromotions(pagination.current);
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await promotionService.delete(id);
      message.success('Promoción eliminada exitosamente');
      loadPromotions(pagination.current);
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const getPromotionTypeIcon = (type) => {
    switch (type) {
      case 'buy_x_get_y':
        return <GiftOutlined />;
      case 'percentage_discount':
        return <PercentageOutlined />;
      case 'fixed_discount':
        return <DollarOutlined />;
      default:
        return null;
    }
  };

  const getPromotionTypeLabel = (type) => {
    switch (type) {
      case 'buy_x_get_y':
        return 'Compra X Lleva Y';
      case 'percentage_discount':
        return 'Descuento %';
      case 'fixed_discount':
        return 'Descuento Fijo';
      default:
        return type;
    }
  };

  const getPromotionDescription = (record) => {
    switch (record.promotion_type) {
      case 'buy_x_get_y':
        return `Compra ${record.buy_quantity} lleva ${record.buy_quantity + record.get_quantity}`;
      case 'percentage_discount':
        return `${record.discount_percentage}% de descuento (min: ${record.min_quantity})`;
      case 'fixed_discount':
        return `$${record.discount_amount} de descuento (min: ${record.min_quantity})`;
      default:
        return '-';
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: '20%'
    },
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'product_name',
      width: '18%'
    },
    {
      title: 'Tipo',
      dataIndex: 'promotion_type',
      key: 'promotion_type',
      width: '15%',
      render: (type) => (
        <Tag icon={getPromotionTypeIcon(type)} color="blue">
          {getPromotionTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Detalle',
      key: 'detail',
      width: '20%',
      render: (_, record) => getPromotionDescription(record)
    },
    {
      title: 'Vigencia',
      key: 'validity',
      width: '12%',
      render: (_, record) => {
        if (!record.start_date && !record.end_date) {
          return <Tag color="green">Permanente</Tag>;
        }
        
        const now = new Date();
        const start = record.start_date ? new Date(record.start_date) : null;
        const end = record.end_date ? new Date(record.end_date) : null;
        
        if (start && now < start) {
          return <Tag color="orange">Programada</Tag>;
        }
        if (end && now > end) {
          return <Tag color="red">Vencida</Tag>;
        }
        return <Tag color="green">Vigente</Tag>;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      width: '8%',
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: '12%',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar esta promoción?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Promociones"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Nueva Promoción
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingId ? 'Editar Promoción' : 'Nueva Promoción'}
        open={modalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            active: true,
            promotion_type: 'buy_x_get_y',
            min_quantity: 1
          }}
        >
          <Alert
            message="Tipos de Promoción"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li><strong>Compra X Lleva Y:</strong> Por ejemplo "Compra 5 lleva 6"</li>
                <li><strong>Descuento %:</strong> Descuento porcentual al comprar cantidad mínima</li>
                <li><strong>Descuento Fijo:</strong> Descuento en monto fijo al comprar cantidad mínima</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre de la Promoción"
                rules={[{ required: true, message: 'El nombre es requerido' }]}
              >
                <Input placeholder="Ej: Promo Bizcochos 5x6" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="product_id"
                label="Producto"
                rules={[{ required: true, message: 'Seleccione un producto' }]}
              >
                <Select
                  showSearch
                  placeholder="Seleccionar producto"
                  optionFilterProp="children"
                >
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción (opcional)"
          >
            <TextArea rows={2} placeholder="Describe los términos de la promoción" />
          </Form.Item>

          <Form.Item
            name="promotion_type"
            label="Tipo de Promoción"
            rules={[{ required: true, message: 'Seleccione un tipo' }]}
          >
            <Select placeholder="Seleccionar tipo">
              <Option value="buy_x_get_y">
                <GiftOutlined /> Compra X Lleva Y
              </Option>
              <Option value="percentage_discount">
                <PercentageOutlined /> Descuento Porcentual
              </Option>
              <Option value="fixed_discount">
                <DollarOutlined /> Descuento Fijo
              </Option>
            </Select>
          </Form.Item>

          {/* Campos según tipo de promoción */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.promotion_type !== currentValues.promotion_type
            }
          >
            {({ getFieldValue }) => {
              const promotionType = getFieldValue('promotion_type');

              if (promotionType === 'buy_x_get_y') {
                return (
                  <>
                    <Alert
                      message="Ejemplo: Compra 5 lleva 6"
                      description="El cliente paga 5 unidades pero recibe 6 (5 + 1 gratis)"
                      type="success"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="buy_quantity"
                          label="Cantidad a Comprar"
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="5"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="get_quantity"
                          label="Cantidad Gratis"
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="1"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }

              if (promotionType === 'percentage_discount') {
                return (
                  <>
                    <Alert
                      message="Ejemplo: 10% de descuento comprando 3 o más"
                      type="success"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="discount_percentage"
                          label="Porcentaje de Descuento"
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <InputNumber
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                            placeholder="10"
                            suffix="%"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="min_quantity"
                          label="Cantidad Mínima"
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="3"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }

              if (promotionType === 'fixed_discount') {
                return (
                  <>
                    <Alert
                      message="Ejemplo: $2 de descuento comprando 5 o más"
                      type="success"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="discount_amount"
                          label="Monto de Descuento"
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="2.00"
                            prefix="$"
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="min_quantity"
                          label="Cantidad Mínima"
                          rules={[{ required: true, message: 'Requerido' }]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="5"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }

              return null;
            }}
          </Form.Item>

          <Form.Item
            name="date_range"
            label="Vigencia (opcional)"
            tooltip="Si no especificas fechas, la promoción será permanente"
          >
            <RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={['Fecha inicio', 'Fecha fin']}
            />
          </Form.Item>

          <Form.Item
            name="active"
            label="¿Activar promoción?"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Promotions;