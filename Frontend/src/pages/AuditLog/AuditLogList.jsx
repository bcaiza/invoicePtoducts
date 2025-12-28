import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Typography,
  Descriptions,
  Modal
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import auditService from '../../services/auditService';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0
  });
  
  const [filters, setFilters] = useState({
    entity_type: null,
    action: null,
    start_date: null,
    end_date: null
  });

  const [detailModal, setDetailModal] = useState({
    visible: false,
    record: null
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      const data = await auditService.getAuditLogs({
        page,
        limit,
        ...filters
      });

      setLogs(data.data || []);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total
      });
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    loadLogs(newPagination.current, newPagination.pageSize);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (dates) => {
    setFilters(prev => ({
      ...prev,
      start_date: dates?.[0]?.format('YYYY-MM-DD'),
      end_date: dates?.[1]?.format('YYYY-MM-DD')
    }));
  };

  const clearFilters = () => {
    setFilters({
      entity_type: null,
      action: null,
      start_date: null,
      end_date: null
    });
  };

  const showDetail = (record) => {
    setDetailModal({ visible: true, record });
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
      STATUS_CHANGE: 'orange',
      STOCK_UPDATE: 'purple'
    };
    return colors[action] || 'default';
  };

  const getEntityColor = (type) => {
    const colors = {
      Product: 'cyan',
      Customer: 'magenta',
      User: 'geekblue',
      Invoice: 'gold'
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'Entidad',
      dataIndex: 'entity_type',
      key: 'entity_type',
      width: 120,
      render: (type) => (
        <Tag color={getEntityColor(type)}>{type}</Tag>
      )
    },
    {
      title: 'ID',
      dataIndex: 'entity_id',
      key: 'entity_id',
      width: 80
    },
    {
      title: 'Acción',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action.replace('_', ' ')}
        </Tag>
      )
    },
    {
      title: 'Usuario',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.user_email || 'Sistema'}
          </div>
          {record.user_id && (
            <div style={{ fontSize: '12px', color: '#888' }}>
              ID: {record.user_id}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 140
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => showDetail(record)}
        >
          Ver
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Auditoría del Sistema</Title>

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={5}>
            <Select
              placeholder="Tipo de entidad"
              allowClear
              style={{ width: '100%' }}
              value={filters.entity_type}
              onChange={(value) => handleFilterChange('entity_type', value)}
            >
              <Select.Option value="Product">Producto</Select.Option>
              <Select.Option value="Customer">Cliente</Select.Option>
              <Select.Option value="User">Usuario</Select.Option>
              <Select.Option value="Invoice">Factura</Select.Option>
            </Select>
          </Col>
          
          <Col span={5}>
            <Select
              placeholder="Acción"
              allowClear
              style={{ width: '100%' }}
              value={filters.action}
              onChange={(value) => handleFilterChange('action', value)}
            >
              <Select.Option value="CREATE">Crear</Select.Option>
              <Select.Option value="UPDATE">Actualizar</Select.Option>
              <Select.Option value="DELETE">Eliminar</Select.Option>
              <Select.Option value="STATUS_CHANGE">Cambio Estado</Select.Option>
              <Select.Option value="STOCK_UPDATE">Actualizar Stock</Select.Option>
            </Select>
          </Col>

          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              onChange={handleDateChange}
            />
          </Col>

          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={clearFilters}
              >
                Limpiar
              </Button>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => loadLogs()}
              >
                Recargar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Detalle de Auditoría"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, record: null })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, record: null })}>
            Cerrar
          </Button>
        ]}
        width={800}
      >
        {detailModal.record && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Fecha">
              {dayjs(detailModal.record.createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Entidad">
              <Tag color={getEntityColor(detailModal.record.entity_type)}>
                {detailModal.record.entity_type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="ID Entidad">
              {detailModal.record.entity_id}
            </Descriptions.Item>
            <Descriptions.Item label="Acción">
              <Tag color={getActionColor(detailModal.record.action)}>
                {detailModal.record.action.replace('_', ' ')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Usuario">
              {detailModal.record.user_email || 'Sistema'}
              {detailModal.record.user_id && ` (ID: ${detailModal.record.user_id})`}
            </Descriptions.Item>
            <Descriptions.Item label="IP">
              {detailModal.record.ip_address}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent">
              {detailModal.record.user_agent}
            </Descriptions.Item>
            {detailModal.record.changes && (
              <Descriptions.Item label="Cambios">
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {JSON.stringify(detailModal.record.changes, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogList;