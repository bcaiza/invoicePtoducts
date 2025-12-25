# Migración a Ant Design - Bizcocho Frontend

## 🎨 ¿Por qué Ant Design?

El proyecto ha sido migrado de componentes personalizados a **Ant Design**, una biblioteca de componentes React de nivel empresarial que ofrece:

✅ **Componentes profesionales** - Más de 50 componentes listos para usar  
✅ **Accesibilidad** - ARIA compliant y soporte para lectores de pantalla  
✅ **Tema personalizable** - Sistema de diseño flexible  
✅ **Responsive** - Diseño móvil incluido  
✅ **Internacionalización** - Soporte para español (esES)  
✅ **TypeScript** - Tipos incluidos  
✅ **Mantenimiento activo** - Actualizaciones regulares  

## 📦 Componentes Ant Design Utilizados

### Formularios
- `Form` - Formularios con validación
- `Input` - Campos de texto
- `Input.Password` - Campos de contraseña
- `Input.TextArea` - Áreas de texto
- `InputNumber` - Campos numéricos
- `Select` - Selectores desplegables
- `Form.List` - Listas dinámicas en formularios

### Datos
- `Table` - Tablas con paginación, ordenamiento y filtros
- `Descriptions` - Listas descriptivas
- `Tag` - Etiquetas de estado

### Feedback
- `message` - Mensajes de notificación
- `Modal` - Ventanas modales
- `Spin` - Indicadores de carga
- `Alert` - Mensajes de alerta

### Layout
- `Card` - Tarjetas contenedoras
- `Space` - Espaciado entre elementos
- `Button` - Botones con variantes

## 🎨 Tema Personalizado

El proyecto usa colores personalizados de Bizcocho en `src/theme/antd-theme.js`:

```javascript
// Colores principales
colorPrimary: '#f07f1e'  // Naranja Bizcocho
colorSuccess: '#10b981'   // Verde
colorWarning: '#f59e0b'   // Ámbar
colorError: '#ef4444'     // Rojo
```

### Modo Oscuro

El tema se adapta automáticamente según la preferencia del usuario:

```javascript
<ConfigProvider
  theme={isDark ? darkTheme : lightTheme}
  algorithm={isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm}
>
```

## 📝 Ejemplos de Uso

### Formulario Básico

```jsx
import { Form, Input, Button, message } from 'antd';

const MyForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Valores:', values);
    message.success('Guardado exitosamente');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        label="Nombre"
        name="name"
        rules={[{ required: true, message: 'Ingrese el nombre' }]}
      >
        <Input placeholder="Juan Pérez" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Guardar
        </Button>
      </Form.Item>
    </Form>
  );
};
```

### Tabla con Paginación

```jsx
import { Table } from 'antd';

const MyTable = ({ data }) => {
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showTotal: (total) => `Total ${total} items`,
      }}
    />
  );
};
```

### Modal con Formulario

```jsx
import { Modal, Form, Input } from 'antd';

const MyModal = ({ visible, onCancel, onOk }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    onOk(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Crear Registro"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
```

### Notificaciones

```jsx
import { message } from 'antd';

// Éxito
message.success('Operación exitosa');

// Error
message.error('Ocurrió un error');

// Advertencia
message.warning('Advertencia');

// Información
message.info('Información importante');

// Cargando
const hide = message.loading('Cargando...', 0);
// Llamar hide() para cerrar
```

## 🎯 Páginas Migradas

### ✅ Login
- Form con validación
- Input con íconos (Mail, Lock)
- Mensajes de error con Alert
- Button con estado de carga

### ✅ Invoices
- Table con columnas personalizadas
- Modal para crear/editar
- Form.List para productos dinámicos
- Select con búsqueda
- InputNumber para cantidades
- Descriptions para vista detallada
- Tags para estados

### ⏳ Pendientes de Migrar
- Dashboard
- Products
- Customers
- Users
- Roles
- Layout (sidebar y navbar)

## 📚 Recursos

- [Documentación Ant Design](https://ant.design/components/overview/)
- [Temas Personalizados](https://ant.design/docs/react/customize-theme)
- [Form API](https://ant.design/components/form/)
- [Table API](https://ant.design/components/table/)
- [Ejemplos Ant Design](https://ant.design/components/overview/)

## 🔧 Configuración

### ConfigProvider

Ubicado en `src/App.jsx`:

```jsx
<ConfigProvider
  locale={esES}              // Español
  theme={lightTheme}         // Tema personalizado
  algorithm={antdTheme.defaultAlgorithm}
>
  {/* Tu app */}
</ConfigProvider>
```

### Importar Estilos

En `src/index.css`:

```css
@import 'antd/dist/reset.css';
```

## 💡 Tips y Mejores Prácticas

### 1. Usar Form.useForm()
```jsx
const [form] = Form.useForm();
```
Esto te da acceso a métodos como `setFieldsValue`, `resetFields`, `validateFields`.

### 2. Validación de Formularios
```jsx
<Form.Item
  name="email"
  rules={[
    { required: true, message: 'Email requerido' },
    { type: 'email', message: 'Email inválido' }
  ]}
>
  <Input />
</Form.Item>
```

### 3. Form.List para Arrays Dinámicos
```jsx
<Form.List name="items">
  {(fields, { add, remove }) => (
    <>
      {fields.map(field => (
        <Form.Item {...field} name={[field.name, 'value']}>
          <Input />
        </Form.Item>
      ))}
      <Button onClick={() => add()}>Agregar</Button>
    </>
  )}
</Form.List>
```

### 4. Table con Render Personalizado
```jsx
{
  title: 'Estado',
  dataIndex: 'status',
  render: (status) => (
    <Tag color={status === 'active' ? 'success' : 'error'}>
      {status}
    </Tag>
  ),
}
```

### 5. Mensajes Globales
```jsx
// Configurar duración por defecto
message.config({
  duration: 3,
  maxCount: 3,
});
```

## 🚀 Próximos Pasos

1. Migrar Dashboard con Cards y Statistic
2. Migrar Products con Table
3. Migrar Customers con Table
4. Migrar Users con Table y Modal
5. Migrar Roles con Table y Permissions
6. Actualizar Layout con Menu de Ant Design

---

Documentación creada: Diciembre 2024
