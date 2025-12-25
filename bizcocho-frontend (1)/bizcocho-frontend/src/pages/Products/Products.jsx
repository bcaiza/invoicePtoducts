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
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined
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
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ProductList;