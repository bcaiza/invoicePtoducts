import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message, Card, Breadcrumb } from 'antd';
import { HomeOutlined, TeamOutlined } from '@ant-design/icons';
import RoleForm from './RoleForm';
import roleService from '../../services/roleService';

const CreateRole = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await roleService.createRole(values);
      message.success('Rol creado exitosamente');
      navigate('/roles');
    } catch (error) {
      console.error('Error al crear rol:', error);
      message.error(error.response?.data?.message || 'Error al crear el rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/roles">
          <TeamOutlined />
          <span>Roles</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Crear Rol</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <h1 style={{ marginBottom: 8 }}>Crear Nuevo Rol</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Define los permisos y características del nuevo rol
        </p>

        <RoleForm 
          form={form}
          onFinish={handleFinish}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CreateRole;