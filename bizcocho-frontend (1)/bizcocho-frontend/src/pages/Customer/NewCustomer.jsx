import React, { useState } from 'react';
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
  Switch
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
import { useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';

const { Option } = Select;
const { TextArea } = Input;

const NewCustomer = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const customerData = {
        identification_type: values.identification_type,
        identification: values.identification,
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null
      };

      await customerService.createCustomer(customerData);
      message.success('Cliente creado exitosamente');
      navigate('/customers');
    } catch (error) {
      message.error(error.response?.data?.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Nuevo Cliente"
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
          initialValues={{
            identification_type: 'document_id'
          }}
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

          <Card
            size="small"
            style={{ backgroundColor: '#f0f5ff', marginBottom: '24px' }}
          >
            <p style={{ margin: 0, fontSize: '13px' }}>
              <strong>Nota:</strong> El cliente estará activo por defecto y podrá 
              ser seleccionado en facturas inmediatamente después de crearlo.
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
                Guardar Cliente
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default NewCustomer;