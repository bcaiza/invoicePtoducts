import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Popconfirm, 
  message,
  Breadcrumb,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  HomeOutlined,
  TeamOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import roleService from '../../services/roleService';

const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      message.error('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await roleService.deleteRole(id);
      message.success('Rol eliminado exitosamente');
      loadRoles();
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      message.error('Error al eliminar el rol');
    }
  };

  const columns = [
    {
      title: 'Nombre del Rol',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <span style={{ color: '#999' }}>Sin descripción</span>
    },
    {
      title: 'Permisos',
      key: 'permissions',
      render: (_, record) => {
        const permissions = record.permissions || []; // ✅ Cambiar a minúscula
        const displayPermissions = permissions.slice(0, 3);
        const remaining = permissions.length - 3;

        return (
          <Space size={[0, 8]} wrap>
            {displayPermissions.map(perm => (
              <Tag key={perm.id} color="blue">
                {perm.module}
              </Tag>
            ))}
            {remaining > 0 && (
              <Tooltip title={permissions.slice(3).map(p => p.module).join(', ')}>
                <Tag color="default">+{remaining} más</Tag>
              </Tooltip>
            )}
            {permissions.length === 0 && (
              <span style={{ color: '#999' }}>Sin permisos</span>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('es-ES')
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/editRole/${record.id}`)}
            />
          </Tooltip>
          {/*<Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar este rol?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>*/}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <TeamOutlined />
          <span>Roles</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <TeamOutlined />
            <span>Gestión de Roles</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/newRole')}
          >
            Crear Rol
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} roles`
          }}
        />
      </Card>
    </div>
  );
};

export default RoleList;