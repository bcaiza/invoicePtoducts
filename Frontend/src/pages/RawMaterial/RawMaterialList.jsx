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
  Modal,
  Form,
  InputNumber,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PlusCircleOutlined,
  WarningOutlined
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
  const [stockModal, setStockModal] = useState({
    visible: false,
    rawMaterial: null
  });
  const [form] = Form.useForm();

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

  const showStockModal = (record) => {
    setStockModal({ visible: true, rawMaterial: record });
    form.setFieldsValue({ operation: 'add', quantity: 0 });
  };

  const handleUpdateStock = async (values) => {
    try {
      await rawMaterialService.updateStock(stockModal.rawMaterial.id, values);
      message.success('Stock actualizado correctamente');
      setStockModal({ visible: false, rawMaterial: null });
      form.resetFields();
      loadRawMaterials(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al actualizar stock');
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
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 150,
      render: (stock, record) => {
        const isLowStock = parseFloat(stock) <= parseFloat(record.min_stock);
        return (
          <Space>
            <Tag color={isLowStock ? 'red' : 'green'} icon={isLowStock && <WarningOutlined />}>
              {parseFloat(stock).toFixed(2)} {record.unit_of_measure}
            </Tag>
            <Button
              icon={<PlusCircleOutlined />}
              size="small"
              type="dashed"
              onClick={() => showStockModal(record)}
            >
              Añadir
            </Button>
          </Space>
        );
      }
    },
    {
      title: 'Stock Mínimo',
      dataIndex: 'min_stock',
      key: 'min_stock',
      width: 120,
      render: (minStock, record) => 
        `${parseFloat(minStock).toFixed(2)} ${record.unit_of_measure}`
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      width: 120,
      render: (cost) => `$${parseFloat(cost).toFixed(2)}`
    },
    {
      title: 'Unidad',
      dataIndex: 'unit_of_measure',
      key: 'unit_of_measure',
      width: 100
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
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
                type="default"
                onClick={() => navigate('/raw-materials/low-stock')}
              >
                Ver Stock Bajo
              </Button>
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
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={`Actualizar Stock - ${stockModal.rawMaterial?.name}`}
        open={stockModal.visible}
        onCancel={() => {
          setStockModal({ visible: false, rawMaterial: null });
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateStock} layout="vertical">
          <Form.Item label="Stock actual">
            <strong>
              {parseFloat(stockModal.rawMaterial?.stock || 0).toFixed(2)}{' '}
              {stockModal.rawMaterial?.unit_of_measure}
            </strong>
          </Form.Item>

          <Form.Item
            name="operation"
            label="Operación"
            rules={[{ required: true, message: 'Seleccione una operación' }]}
          >
            <Select>
              <Select.Option value="add">Añadir</Select.Option>
              <Select.Option value="subtract">Restar</Select.Option>
              <Select.Option value="set">Establecer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Cantidad"
            rules={[{ required: true, message: 'Ingrese la cantidad' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setStockModal({ visible: false, rawMaterial: null });
                form.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                Actualizar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RawMaterialList;