import React, { useState, useEffect } from 'react';
import invoiceService from '../../services/invoiceService';
import customerService from '../../services/customerService';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Modal, 
  message, 
  Tag, 
  Space,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Option } = Select;

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    customer_id: '',
    search: ''
  });
  const [stats, setStats] = useState(null);

  const loadInvoices = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoices({
        page,
        limit,
        ...filters
      });
      
      setInvoices(data.data);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total
      });
    } catch (error) {
      message.error('Error al cargar facturas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async (searchTerm = '') => {
    try {
      setLoadingCustomers(true);
      const data = await customerService.getCustomers({
        page: 1,
        limit: 100,
        active: true,
        search: searchTerm
      });
      setCustomers(data.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await invoiceService.getInvoiceStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadStats();
    loadCustomers();
  }, [filters]);

  const handleTableChange = (newPagination) => {
    loadInvoices(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta factura?',
      content: 'Solo se pueden eliminar facturas pendientes',
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await invoiceService.deleteInvoice(id);
          message.success('Factura eliminada correctamente');
          loadInvoices(pagination.current, pagination.pageSize);
          loadStats();
        } catch (error) {
          message.error(error.response?.data?.message || 'Error al eliminar factura');
        }
      }
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await invoiceService.updateInvoiceStatus(id, newStatus);
      message.success('Estado actualizado correctamente');
      loadInvoices(pagination.current, pagination.pageSize);
      loadStats();
    } catch (error) {
      message.error('Error al actualizar estado');
    }
  };

  const handleCustomerSearch = (value) => {
    if (value) {
      loadCustomers(value);
    } else {
      loadCustomers();
    }
  };

  const columns = [
    {
      title: 'Número',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      fixed: 'left',
      width: 150
    },
    {
      title: 'Cliente',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 200
    },
    {
      title: 'Fecha',
      dataIndex: 'invoice_date',
      key: 'invoice_date',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (value) => `$${parseFloat(value).toFixed(2)}`
    },
    {
      title: 'Impuesto',
      dataIndex: 'tax',
      key: 'tax',
      width: 100,
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`
    },
    {
      title: 'Descuento',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (value) => <strong>${parseFloat(value).toFixed(2)}</strong>
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: '100%' }}
        >
          <Option value="pending">
            <Tag color="orange">Pendiente</Tag>
          </Option>
          <Option value="paid">
            <Tag color="green">Pagada</Tag>
          </Option>
          <Option value="cancelled">
            <Tag color="red">Cancelada</Tag>
          </Option>
        </Select>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {/* Ver detalle */}}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            disabled={record.status !== 'pending'}
            onClick={() => {/* Editar */}}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            disabled={record.status !== 'pending'}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Gestión de Facturas</h1>

      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Total Facturas" 
                value={stats.total} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Pendientes" 
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Pagadas" 
                value={stats.paid}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Total Ventas" 
                value={stats.total_sales}
                prefix="$"
                precision={2}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <Space style={{ width: '100%' }} direction="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="Buscar por número de factura"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filtrar por cliente"
                prefix={<UserOutlined />}
                style={{ width: '100%' }}
                value={filters.customer_id || undefined}
                onChange={(value) => setFilters({ ...filters, customer_id: value })}
                onSearch={handleCustomerSearch}
                showSearch
                allowClear
                loading={loadingCustomers}
                filterOption={false}
                notFoundContent={loadingCustomers ? 'Cargando...' : 'No hay clientes'}
              >
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.identification}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filtrar por estado"
                style={{ width: '100%' }}
                value={filters.status || undefined}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
              >
                <Option value="pending">Pendiente</Option>
                <Option value="paid">Pagada</Option>
                <Option value="cancelled">Cancelada</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => { navigate('/newInvoice'); }}
                block
              >
                Nueva Factura
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
};

export default InvoiceList;