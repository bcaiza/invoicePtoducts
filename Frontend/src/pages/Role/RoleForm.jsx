import React, { useState, useEffect } from 'react';
import { Form, Input, Table, Switch, Card, Space, Button } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const MODULES = [
  { key: 'users', name: 'Usuarios' },
  { key: 'roles', name: 'Roles' },
  { key: 'customers', name: 'Clientes' },
  { key: 'products', name: 'Productos' },
  { key: 'invoices', name: 'Facturas' },
  { key: 'production', name: 'Producción' },
  { key: 'raw_materials', name: 'Materias Primas' },
  { key: 'recipes', name: 'Recetas' },
  { key: 'product_units', name: 'Unidades de Producto' },
  { key: 'promotions', name: 'Promociones' },
  { key: 'units', name: 'Unidades' },
  { key: 'reports', name: 'Reportes' },
  { key: 'audit', name: 'Auditoría' }
];

const RoleForm = ({ form, initialData, onFinish, loading }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        description: initialData.description
      });

      // Configurar permisos iniciales
      const initialPermissions = MODULES.map(module => {
        const existingPerm = initialData.Permissions?.find(p => p.module === module.key) ||
                            initialData.permissions?.find(p => p.module === module.key);
        
        return {
          module: module.key,
          name: module.name,
          can_view: existingPerm?.can_view || false,
          can_create: existingPerm?.can_create || false,
          can_edit: existingPerm?.can_edit || false,
          can_delete: existingPerm?.can_delete || false
        };
      });

      setPermissions(initialPermissions);
    } else {
      // Inicializar permisos vacíos para crear
      const emptyPermissions = MODULES.map(module => ({
        module: module.key,
        name: module.name,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false
      }));
      setPermissions(emptyPermissions);
    }
  }, [initialData, form]);

  const handlePermissionChange = (module, permission, value) => {
    setPermissions(prev => 
      prev.map(p => 
        p.module === module 
          ? { ...p, [permission]: value }
          : p
      )
    );
  };

  const handleToggleAll = (module) => {
    setPermissions(prev => {
      const current = prev.find(p => p.module === module);
      const hasAll = current.can_view && current.can_create && current.can_edit && current.can_delete;
      
      return prev.map(p => 
        p.module === module 
          ? {
              ...p,
              can_view: !hasAll,
              can_create: !hasAll,
              can_edit: !hasAll,
              can_delete: !hasAll
            }
          : p
      );
    });
  };

  const handleSubmit = (values) => {
    // Filtrar solo permisos activos
    const activePermissions = permissions
      .filter(p => p.can_view || p.can_create || p.can_edit || p.can_delete)
      .map(({ name, ...rest }) => rest); // Remover el campo 'name'

    onFinish({
      ...values,
      permissions: activePermissions
    });
  };

  const columns = [
    {
      title: 'Módulo',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Ver',
      dataIndex: 'can_view',
      key: 'can_view',
      align: 'center',
      width: '15%',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) => handlePermissionChange(record.module, 'can_view', checked)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      )
    },
    {
      title: 'Crear',
      dataIndex: 'can_create',
      key: 'can_create',
      align: 'center',
      width: '15%',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) => handlePermissionChange(record.module, 'can_create', checked)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      )
    },
    {
      title: 'Editar',
      dataIndex: 'can_edit',
      key: 'can_edit',
      align: 'center',
      width: '15%',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) => handlePermissionChange(record.module, 'can_edit', checked)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      )
    },
    {
      title: 'Eliminar',
      dataIndex: 'can_delete',
      key: 'can_delete',
      align: 'center',
      width: '15%',
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={(checked) => handlePermissionChange(record.module, 'can_delete', checked)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      )
    },
    {
      title: 'Todos',
      key: 'all',
      align: 'center',
      width: '15%',
      render: (_, record) => {
        const hasAll = record.can_view && record.can_create && record.can_edit && record.can_delete;
        return (
          <Button
            size="small"
            type={hasAll ? 'primary' : 'default'}
            onClick={() => handleToggleAll(record.module)}
          >
            {hasAll ? 'Quitar todos' : 'Marcar todos'}
          </Button>
        );
      }
    }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Card title="Información del Rol" style={{ marginBottom: 24 }}>
        <Form.Item
          label="Nombre del Rol"
          name="name"
          rules={[
            { required: true, message: 'Por favor ingresa el nombre del rol' },
            { min: 3, message: 'El nombre debe tener al menos 3 caracteres' }
          ]}
        >
          <Input 
            placeholder="Ej: Administrador, Vendedor, Cajero" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Descripción"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Descripción del rol (opcional)"
            size="large"
          />
        </Form.Item>
      </Card>

      <Card title="Permisos por Módulo">
        <Table
          columns={columns}
          dataSource={permissions}
          rowKey="module"
          pagination={false}
          bordered
        />
      </Card>

      <Form.Item style={{ marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            {loading ? 'Guardando...' : 'Guardar Rol'}
          </Button>
          <Button size="large" onClick={() => window.history.back()}>
            Cancelar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RoleForm;