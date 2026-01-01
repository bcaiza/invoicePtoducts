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
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import rawMaterialService from '../../services/rawMaterialService';

const { Search } = Input;

const RawMaterialList = () => {
  const navigate = useNavigate();
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadRawMaterials();
  }, [searchText]);

  const loadRawMaterials = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const data = await rawMaterialService.getRawMaterials({
        page,
        limit,
        search: searchText
      });

      setRawMaterials(data.data || []);
      setPagination({
        current: data.pagination.current_page,
        pageSize: data.pagination.per_page,
        total: data.pagination.total
      });
    } catch (error) {
      message.error('Error al cargar materias primas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    loadRawMaterials(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 400,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      width: 150,
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (date) => new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          size="small"
          type="primary"
          onClick={() => navigate(`/raw-materials/edit/${record.id}`)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Gestión de Materias Primas</h1>

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Search
              placeholder="Buscar materia prima"
              allowClear
              size="large"
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => {
                if (!e.target.value) setSearchText('');
              }}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/raw-materials/new')}
              >
                Nueva Materia Prima
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={rawMaterials}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default RawMaterialList;