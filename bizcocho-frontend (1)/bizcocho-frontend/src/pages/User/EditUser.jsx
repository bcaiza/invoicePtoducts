import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message, Card, Breadcrumb, Spin } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import UserForm from './UserForm';
import userService from '../../services/userService';

const EditUser = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      const data = await userService.getUserById(id);
      setUserData(data);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      message.error('Error al cargar el usuario');
      navigate('/users');
    } finally {
      setLoadingData(false);
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await userService.updateUser(id, values);
      message.success('Usuario actualizado exitosamente');
      navigate('/users');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      message.error(error.response?.data?.message || 'Error al actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Cargando usuario..." />
      </div>
    );
  }

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
        <Breadcrumb.Item>Editar Usuario</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <h1 style={{ marginBottom: 8 }}>Editar Usuario</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Modifica la información del usuario
        </p>

        <UserForm 
          form={form}
          initialData={userData}
          onFinish={handleFinish}
          loading={loading}
          isEdit={true}
        />
      </Card>
    </div>
  );
};

export default EditUser;