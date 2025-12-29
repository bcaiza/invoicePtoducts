import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Card,
  Tag,
  Space,
  DatePicker,
  Row,
  Col
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import productionService from '../../services/productionService';

const { RangePicker } = DatePicker;

const ProductionList = () => {
  const navigate = useNavigate();
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    loadProductions();
  }, [dateRange]);

  const loadProductions = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const params = { page, limit };
      
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const data = await productionService.getProductions(params);

      setProductions(data.data || []);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total
      });
    } catch (error) {
      console.error('Error loading productions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    loadProductions(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'production_date',
      key: 'production_date',
      width: 180,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Producto',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <strong>{record.product?.name}</strong>
      )
    },
    {
      title: 'Esperado',
      dataIndex: 'expected_quantity',
      key: 'expected_quantity',
      width: 100,
      align: 'center'
    },
    {
      title: 'Producido',
      dataIndex: 'produced_quantity',
      key: 'produced_quantity',
      width: 100,
      align: 'center',
      render: (qty, record) => {
        const isLess = qty < record.expected_quantity;
        return (
          <Tag color={isLess ? 'orange' : 'green'}>
            {qty}
          </Tag>
        );
      }
    },
    {
      title: 'Eficiencia',
      key: 'efficiency',
      width: 120,
      render: (_, record) => {
        const efficiency = (record.produced_quantity / record.expected_quantity) * 100;
        return `${efficiency.toFixed(1)}%`;
      }
    },
    {
      title: 'Usuario',
      key: 'user',
      width: 200,
      render: (_, record) => record.user?.name || 'Sistema'
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          completed: 'green',
          pending: 'orange',
          cancelled: 'red'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Historial de Producción</h1>

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              onChange={setDateRange}
              placeholder={['Fecha inicio', 'Fecha fin']}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/productions/new')}
            >
              Nueva Producción
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={productions}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default ProductionList;