import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Switch, Card, Space, Button } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import roleService from '../../services/roleService';

const { Option } = Select;

const UserForm = ({ form, initialData, onFinish, loading, isEdit = false }) => {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        email: initialData.email,
        role_id: initialData.role_id,
        active: initialData.active
      });
    }
  }, [initialData, form]);

  const loadRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      initialValues={{
        active: true
      }}
    >
      <Card title="Información Personal" style={{ marginBottom: 24 }}>
        <Form.Item
          label="Nombre Completo"
          name="name"
          rules={[
            { required: true, message: 'Por favor ingresa el nombre' },
            { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />}
            placeholder="Ej: Juan Pérez" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Correo Electrónico"
          name="email"
          rules={[
            { required: true, message: 'Por favor ingresa el correo' },
            { type: 'email', message: 'Ingresa un correo válido' }
          ]}
        >
          <Input 
            prefix={<MailOutlined />}
            placeholder="correo@ejemplo.com" 
            size="large"
          />
        </Form.Item>
      </Card>

      {!isEdit && (
        <Card title="Contraseña" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: 'Por favor ingresa la contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Mínimo 6 caracteres" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirmar Contraseña"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                }
              })
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Confirma la contraseña" 
              size="large"
            />
          </Form.Item>
        </Card>
      )}

      <Card title="Configuración de Cuenta">
        <Form.Item
          label="Rol"
          name="role_id"
          rules={[
            { required: true, message: 'Por favor selecciona un rol' }
          ]}
        >
          <Select
            placeholder="Selecciona un rol"
            size="large"
            loading={loadingRoles}
          >
            {roles.map(role => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Estado de la Cuenta"
          name="active"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Activo" 
            unCheckedChildren="Inactivo"
          />
        </Form.Item>
      </Card>

      <Form.Item style={{ marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
          </Button>
          <Button size="large" onClick={() => window.history.back()}>
            Cancelar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default UserForm;