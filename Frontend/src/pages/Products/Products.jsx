import React, { useState, useEffect } from 'react';
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
  Switch,
  InputNumber,
  Form
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const { Search } = Input;

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState(null);
  
  // Estados para el modal de ajuste de stock
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockOperation, setStockOperation] = useState('add'); // 'add' o 'subtract'
  const [stockForm] = Form.useForm();

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [searchText]);

  const loadProducts = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const data = await productService.getProducts({
        page,
        limit,
        search: searchText
      });

      setProducts(data.data || []);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total
      });
    } catch (error) {
      message.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await productService.getProductStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleTableChange = (newPagination) => {
    loadProducts(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este producto?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await productService.deleteProduct(id);
          message.success('Producto eliminado correctamente');
          loadProducts(pagination.current, pagination.pageSize);
          loadStats();
        } catch (error) {
          message.error(error.response?.data?.message || 'Error al eliminar producto');
        }
      }
    });
  };

  const handleToggleStatus = async (id) => {
    try {
      await productService.toggleProductStatus(id);
      message.success('Estado actualizado correctamente');
      loadProducts(pagination.current, pagination.pageSize);
      loadStats();
    } catch (error) {
      message.error('Error al actualizar estado');
    }
  };

  // ← NUEVA FUNCIÓN: Abrir modal para ajustar stock
  const handleOpenStockModal = (product, operation) => {
    setSelectedProduct(product);
    setStockOperation(operation);
    stockForm.resetFields();
    setStockModalVisible(true);
  };

  // ← NUEVA FUNCIÓN: Cerrar modal
  const handleCloseStockModal = () => {
    setStockModalVisible(false);
    setSelectedProduct(null);
    stockForm.resetFields();
  };

  // ← NUEVA FUNCIÓN: Ajustar stock
  const handleAdjustStock = async (values) => {
    try {
      const quantity = values.quantity;
      const newStock = stockOperation === 'add' 
        ? selectedProduct.stock + quantity 
        : selectedProduct.stock - quantity;

      if (newStock < 0) {
        message.error('El stock no puede ser negativo');
        return;
      }

      await productService.updateProduct(selectedProduct.id, { stock: newStock });
      
      const operationText = stockOperation === 'add' ? 'agregado' : 'restado';
      message.success(`Stock ${operationText} correctamente`);
      
      handleCloseStockModal();
      loadProducts(pagination.current, pagination.pageSize);
      loadStats();
    } catch (error) {
      message.error('Error al ajustar stock');
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Precio (PVP)',
      dataIndex: 'pvp',
      key: 'pvp',
      width: 120,
      render: (price) => `$${parseFloat(price).toFixed(2)}`
    },
    {
      title: 'Peso (kg)',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (weight) => weight ? `${parseFloat(weight).toFixed(2)} kg` : 'N/A'
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock) => (
        <Tag color={stock === 0 ? 'red' : stock < 10 ? 'orange' : 'green'}>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="Activo"
          unCheckedChildren="Inactivo"
        />
      )
    },
    {
      title: 'Ajustar Stock', // ← NUEVA COLUMNA
      key: 'stock_adjust',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<PlusCircleOutlined />}
            size="small"
            type="primary"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleOpenStockModal(record, 'add')}
            title="Agregar stock"
          />
          <Button
            icon={<MinusCircleOutlined />}
            size="small"
            danger
            onClick={() => handleOpenStockModal(record, 'subtract')}
            title="Restar stock"
          />
        </Space>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            onClick={() => navigate(`/editProduct/${record.id}`)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Gestión de Productos</h1>

      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Productos"
                value={stats.total}
                prefix={<span style={{ fontSize: '16px' }}>📦</span>}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Activos"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Stock Bajo"
                value={stats.low_stock}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sin Stock"
                value={stats.out_of_stock}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Search
              placeholder="Buscar producto por nombre"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => {
                if (!e.target.value) setSearchText('');
              }}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/newProduct')}
            >
              Nuevo Producto
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            {stockOperation === 'add' ? (
              <PlusCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            ) : (
              <MinusCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            )}
            <span>
              {stockOperation === 'add' ? 'Agregar Stock' : 'Restar Stock'}
            </span>
          </Space>
        }
        open={stockModalVisible}
        onCancel={handleCloseStockModal}
        onOk={() => stockForm.submit()}
        okText={stockOperation === 'add' ? 'Agregar' : 'Restar'}
        okButtonProps={{ 
          style: stockOperation === 'add' 
            ? { backgroundColor: '#52c41a', borderColor: '#52c41a' }
            : {} 
        }}
        cancelText="Cancelar"
      >
        {selectedProduct && (
          <Form
            form={stockForm}
            layout="vertical"
            onFinish={handleAdjustStock}
          >
            <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f0f5ff' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <strong>Producto:</strong>
                  <div>{selectedProduct.name}</div>
                </Col>
                <Col span={12}>
                  <strong>Stock Actual:</strong>
                  <div>
                    <Tag color={
                      selectedProduct.stock === 0 ? 'red' : 
                      selectedProduct.stock < 10 ? 'orange' : 'green'
                    }>
                      {selectedProduct.stock} unidades
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            <Form.Item
              name="quantity"
              label={`Cantidad a ${stockOperation === 'add' ? 'agregar' : 'restar'}`}
              rules={[
                { required: true, message: 'Ingrese la cantidad' },
                { 
                  validator: (_, value) => {
                    if (stockOperation === 'subtract' && value > selectedProduct.stock) {
                      return Promise.reject('No puedes restar más del stock disponible');
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={1}
                max={stockOperation === 'subtract' ? selectedProduct.stock : undefined}
                style={{ width: '100%' }}
                placeholder="Ingrese cantidad"
                size="large"
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate
            >
              {({ getFieldValue }) => {
                const quantity = getFieldValue('quantity') || 0;
                const newStock = stockOperation === 'add' 
                  ? selectedProduct.stock + quantity 
                  : selectedProduct.stock - quantity;

                return quantity > 0 ? (
                  <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                    <Row>
                      <Col span={24}>
                        <strong>Nuevo stock será:</strong>
                        <div style={{ fontSize: '20px', color: '#52c41a', marginTop: '8px' }}>
                          {newStock} unidades
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ) : null;
              }}
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;