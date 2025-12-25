import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, message, Card, Breadcrumb } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import UserForm from './UserForm';
import userService from '../../services/userService';

const CreateUser = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = values;
      
      await userService.createUser(userData);
      message.success('Usuario creado exitosamente');
      navigate('/users');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      message.error(error.response?.data?.message || 'Error al crear el usuario');
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
        <Breadcrumb.Item href="/users">
          <UserOutlined />
          <span>Usuarios</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Crear Usuario</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <h1 style={{ marginBottom: 8 }}>Crear Nuevo Usuario</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Completa la información para crear un nuevo usuario
        </p>

        <UserForm 
          form={form}
          onFinish={handleFinish}
          loading={loading}
          isEdit={false}
        />
      </Card>
    </div>
  );
};

export default CreateUser;