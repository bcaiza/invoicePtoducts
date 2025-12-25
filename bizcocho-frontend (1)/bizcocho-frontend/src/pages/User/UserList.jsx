import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tag, 
  message,
  Breadcrumb,
  Tooltip,
  Avatar,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined,
  HomeOutlined,
  UserOutlined,
  MailOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import userService from '../../services/userService';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      message.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await userService.toggleUserStatus(id);
      message.success(`Usuario ${currentStatus ? 'desactivado' : 'activado'} exitosamente`);
      loadUsers();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      message.error('Error al cambiar el estado del usuario');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const columns = [
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {getInitials(record.name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Rol',
      dataIndex: 'Role',
      key: 'role',
      render: (role) => (
        role ? (
          <Tag color="blue" icon={<SafetyOutlined />}>
            {role.name}
          </Tag>
        ) : (
          <Tag color="default">Sin rol</Tag>
        )
      )
    },
    {
      title: 'Permisos',
      key: 'permissions',
      render: (_, record) => {
        const permissions = record.Role?.Permissions || [];
        const count = permissions.length;
        
        if (count === 0) {
          return <span style={{ color: '#999' }}>Sin permisos</span>;
        }

        return (
          <Tooltip 
            title={
              <div>
                {permissions.map(p => (
                  <div key={p.id}>{p.module}</div>
                ))}
              </div>
            }
          >
            <Tag color="purple">{count} módulo{count !== 1 ? 's' : ''}</Tag>
          </Tooltip>
        );
      }
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={() => handleToggleStatus(record.id, active)}
          checkedChildren="Activo"
          unCheckedChildren="Inactivo"
        />
      )
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Editar">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/editUser/${record.id}`)}
          />
        </Tooltip>
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
          <UserOutlined />
          <span>Usuarios</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Gestión de Usuarios</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/newUser')}
          >
            Crear Usuario
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usuario${total !== 1 ? 's' : ''}`
          }}
        />
      </Card>
    </div>
  );
};

export default UserList;