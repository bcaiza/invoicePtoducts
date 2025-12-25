import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Select,
  Divider,
  Switch,
  Spin
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import customerService from '../../services/customerService';

const { Option } = Select;
const { TextArea } = Input;

const EditCustomer = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoadingData(true);
      const customer = await customerService.getCustomerById(id);
      
      if (customer.identification_type === 'final_consumer') {
        message.warning('No se puede editar el consumidor final');
        navigate('/customers');
        return;
      }

      form.setFieldsValue({
        identification_type: customer.identification_type,
        identification: customer.identification,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        active: customer.active
      });
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al cargar cliente');
      navigate('/customers');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const customerData = {
        identification_type: values.identification_type,
        identification: values.identification,
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        active: values.active !== undefined ? values.active : true
      };

      await customerService.updateCustomer(id, customerData);
      message.success('Cliente actualizado exitosamente');
      navigate('/customers');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al actualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Cargando cliente..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Editar Cliente"
        extra={
          <Button
            icon={<CloseOutlined />}
            onClick={() => navigate('/customers')}
          >
            Cancelar
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="identification_type"
                label="Tipo de Identificación"
                rules={[{ required: true, message: 'Seleccione el tipo de identificación' }]}
              >
                <Select size="large">
                  <Option value="document_id">Cédula</Option>
                  <Option value="ruc">RUC</Option>
                  <Option value="passport">Pasaporte</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="identification"
                label="Número de Identificación"
                rules={[
                  { required: true, message: 'El número de identificación es requerido' },
                  { min: 5, message: 'Debe tener al menos 5 caracteres' }
                ]}
              >
                <Input
                  placeholder="Ej: 1234567890"
                  size="large"
                  prefix={<IdcardOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="name"
                label="Nombre Completo"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                  { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                ]}
              >
                <Input
                  placeholder="Ej: Juan Pérez"
                  size="large"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="email"
                label="Correo Electrónico"
                rules={[
                  { type: 'email', message: 'Ingrese un correo válido' }
                ]}
              >
                <Input
                  placeholder="ejemplo@correo.com"
                  size="large"
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="phone"
                label="Teléfono"
              >
                <Input
                  placeholder="0987654321"
                  size="large"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="address"
                label="Dirección"
              >
                <TextArea
                  rows={3}
                  placeholder="Dirección completa del cliente"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row>
            <Col span={24}>
              <Form.Item
                name="active"
                label="Estado del Cliente"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                />
              </Form.Item>
            </Col>
          </Row>

          <Card
            size="small"
            style={{ backgroundColor: '#f0f5ff', marginBottom: '24px' }}
          >
            <p style={{ margin: 0, fontSize: '13px' }}>
              <strong>Nota:</strong> El cliente podrá ser seleccionado en facturas
              solo si está marcado como "Activo".
            </p>
          </Card>

          <Row justify="end">
            <Space>
              <Button
                size="large"
                onClick={() => navigate('/customers')}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                Actualizar Cliente
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EditCustomer;