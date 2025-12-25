import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message, Card, Breadcrumb, Spin } from 'antd';
import { HomeOutlined, TeamOutlined } from '@ant-design/icons';
import RoleForm from './RoleForm';
import roleService from '../../services/roleService';

const EditRole = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [roleData, setRoleData] = useState(null);

  useEffect(() => {
    loadRoleData();
  }, [id]);

  const loadRoleData = async () => {
    try {
      const data = await roleService.getRoleById(id);
      setRoleData(data);
    } catch (error) {
      console.error('Error al cargar rol:', error);
      message.error('Error al cargar el rol');
      navigate('/roles');
    } finally {
      setLoadingData(false);
    }
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await roleService.updateRole(id, values);
      message.success('Rol actualizado exitosamente');
      navigate('/roles');
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      message.error(error.response?.data?.message || 'Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Cargando rol..." />
      </div>
    );
  }

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
        <Breadcrumb.Item>Editar Rol</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <h1 style={{ marginBottom: 8 }}>Editar Rol</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Modifica los permisos y características del rol
        </p>

        <RoleForm 
          form={form}
          initialData={roleData}
          onFinish={handleFinish}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default EditRole;