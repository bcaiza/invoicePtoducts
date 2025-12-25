import React, { useState, useEffect } from 'react';
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
  SearchOutlined,
  StopOutlined,
  CheckCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Option } = Select;

const Customer = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    active: '',
    identification_type: '',
    search: ''
  });
  const [stats, setStats] = useState(null);

  const loadCustomers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const data = await customerService.getCustomers({
        page,
        limit,
        ...filters
      });
      
      setCustomers(data.data);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total
      });
    } catch (error) {
      message.error('Error al cargar clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await customerService.getCustomerStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [filters]);

  const handleTableChange = (newPagination) => {
    loadCustomers(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id, customer) => {
    if (customer.identification_type === 'final_consumer') {
      message.error('No se puede eliminar el consumidor final');
      return;
    }

    Modal.confirm({
      title: '¿Estás seguro de eliminar este cliente?',
      content: `Cliente: ${customer.name}`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: async () => {
        try {
          await customerService.deleteCustomer(id);
          message.success('Cliente eliminado correctamente');
          loadCustomers(pagination.current, pagination.pageSize);
          loadStats();
        } catch (error) {
          message.error(error.response?.data?.message || 'Error al eliminar cliente');
        }
      }
    });
  };

  const handleToggleStatus = async (id, customer) => {
    if (customer.identification_type === 'final_consumer' && customer.active) {
      message.error('No se puede desactivar el consumidor final');
      return;
    }

    try {
      await customerService.toggleCustomerStatus(id);
      message.success('Estado actualizado correctamente');
      loadCustomers(pagination.current, pagination.pageSize);
      loadStats();
    } catch (error) {
      message.error('Error al actualizar estado');
    }
  };

  const getIdentificationTypeLabel = (type) => {
    const types = {
      document_id: 'Cédula',
      ruc: 'RUC',
      passport: 'Pasaporte',
      final_consumer: 'Consumidor Final'
    };
    return types[type] || type;
  };

  const getIdentificationTypeColor = (type) => {
    const colors = {
      document_id: 'blue',
      ruc: 'green',
      passport: 'orange',
      final_consumer: 'purple'
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (name, record) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <strong>{name}</strong>
          {record.identification_type === 'final_consumer' && (
            <Tag color="purple">CF</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Tipo ID',
      dataIndex: 'identification_type',
      key: 'identification_type',
      width: 140,
      render: (type) => (
        <Tag color={getIdentificationTypeColor(type)}>
          {getIdentificationTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Identificación',
      dataIndex: 'identification',
      key: 'identification',
      width: 150,
      render: (identification) => (
        <Space>
          <IdcardOutlined />
          {identification}
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) => email ? (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ) : '-'
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone) => phone ? (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ) : '-'
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
      render: (address) => address || '-'
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active) => (
        <Tag 
          color={active ? 'green' : 'red'} 
          icon={active ? <CheckCircleOutlined /> : <StopOutlined />}
        >
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            onClick={() => navigate(`/editCustomer/${record.id}`)}
            disabled={record.identification_type === 'final_consumer'}
          />
          <Button
            icon={record.active ? <StopOutlined /> : <CheckCircleOutlined />}
            size="small"
            onClick={() => handleToggleStatus(record.id, record)}
          >
            {record.active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id, record)}
            disabled={record.identification_type === 'final_consumer'}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Gestión de Clientes</h1>

      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Total Clientes" 
                value={stats.total} 
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
                title="Inactivos" 
                value={stats.inactive}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Tipos" 
                value={stats.by_type?.length || 0}
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
                placeholder="Buscar por nombre, ID o email"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
                size="large"
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filtrar por tipo de ID"
                style={{ width: '100%' }}
                value={filters.identification_type || undefined}
                onChange={(value) => setFilters({ ...filters, identification_type: value })}
                allowClear
                size="large"
              >
                <Option value="document_id">Cédula</Option>
                <Option value="ruc">RUC</Option>
                <Option value="passport">Pasaporte</Option>
                <Option value="final_consumer">Consumidor Final</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="Filtrar por estado"
                style={{ width: '100%' }}
                value={filters.active || undefined}
                onChange={(value) => setFilters({ ...filters, active: value })}
                allowClear
                size="large"
              >
                <Option value="true">Activo</Option>
                <Option value="false">Inactivo</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/newCustomer')}
                size="large"
                block
              >
                Nuevo Cliente
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default Customer;