import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, Button, Input, Modal, Table, Spinner, Alert } from '../components/UI';
import api from '../services/api';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', active: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      showAlert('Error al cargar clientes', 'error');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) {
        await api.updateCustomer(selected.id, formData);
        showAlert('Cliente actualizado', 'success');
      } else {
        await api.createCustomer(formData);
        showAlert('Cliente creado', 'success');
      }
      loadData();
      closeModal();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  };

  const openModal = (item = null) => {
    setSelected(item);
    setFormData(item ? { name: item.name, email: item.email, phone: item.phone, address: item.address, active: item.active } : { name: '', email: '', phone: '', address: '', active: true });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSelected(null); };
  const showAlert = (message, type) => { setAlert({ message, type }); setTimeout(() => setAlert(null), 5000); };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.message}</Alert>}
      <Card title="Gestión de Clientes" action={<Button variant="primary" icon={Plus} onClick={() => openModal()}>Nuevo Cliente</Button>}>
        <Table headers={['Nombre', 'Email', 'Teléfono', 'Dirección', 'Estado', 'Acciones']}>
          {customers.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-dark-800">
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{item.name}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.email}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.phone}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.address}</td>
              <td className="px-6 py-4"><span className={`badge ${item.active ? 'badge-success' : 'badge-danger'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></td>
              <td className="px-6 py-4"><Button variant="ghost" size="sm" icon={Edit} onClick={() => openModal(item)} /></td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal isOpen={showModal} onClose={closeModal} title={selected ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} required />
          <Input label="Teléfono" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} />
          <Input label="Dirección" value={formData.address} onChange={(val) => setFormData({ ...formData, address: val })} />
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="primary">{selected ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role_id: '', active: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([api.getUsers(), api.getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
      setLoading(false);
    } catch (error) {
      showAlert('Error al cargar usuarios', 'error');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) {
        await api.updateUser(selected.id, formData);
        showAlert('Usuario actualizado', 'success');
      } else {
        await api.createUser(formData);
        showAlert('Usuario creado', 'success');
      }
      loadData();
      closeModal();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  };

  const openModal = (item = null) => {
    setSelected(item);
    setFormData(item ? { name: item.name, email: item.email, password: '', role_id: item.role_id, active: item.active } : { name: '', email: '', password: '', role_id: '', active: true });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSelected(null); };
  const showAlert = (message, type) => { setAlert({ message, type }); setTimeout(() => setAlert(null), 5000); };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.message}</Alert>}
      <Card title="Gestión de Usuarios" action={<Button variant="primary" icon={Plus} onClick={() => openModal()}>Nuevo Usuario</Button>}>
        <Table headers={['Nombre', 'Email', 'Rol', 'Estado', 'Acciones']}>
          {users.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-dark-800">
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{item.name}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.email}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.role?.name || 'N/A'}</td>
              <td className="px-6 py-4"><span className={`badge ${item.active ? 'badge-success' : 'badge-danger'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></td>
              <td className="px-6 py-4"><Button variant="ghost" size="sm" icon={Edit} onClick={() => openModal(item)} /></td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal isOpen={showModal} onClose={closeModal} title={selected ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} required />
          {!selected && <Input label="Contraseña" type="password" value={formData.password} onChange={(val) => setFormData({ ...formData, password: val })} required />}
          <select value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} className="input-field" required>
            <option value="">Seleccionar rol...</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="primary">{selected ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getRoles();
      setRoles(data);
      setLoading(false);
    } catch (error) {
      showAlert('Error al cargar roles', 'error');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) {
        await api.updateRole(selected.id, formData);
        showAlert('Rol actualizado', 'success');
      } else {
        await api.createRole({ ...formData, permissions: [] });
        showAlert('Rol creado', 'success');
      }
      loadData();
      closeModal();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  };

  const openModal = (item = null) => {
    setSelected(item);
    setFormData(item ? { name: item.name, description: item.description } : { name: '', description: '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSelected(null); };
  const showAlert = (message, type) => { setAlert({ message, type }); setTimeout(() => setAlert(null), 5000); };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.message}</Alert>}
      <Card title="Gestión de Roles" action={<Button variant="primary" icon={Plus} onClick={() => openModal()}>Nuevo Rol</Button>}>
        <Table headers={['Nombre', 'Descripción', 'Acciones']}>
          {roles.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-dark-800">
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{item.name}</td>
              <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.description}</td>
              <td className="px-6 py-4"><Button variant="ghost" size="sm" icon={Edit} onClick={() => openModal(item)} /></td>
            </tr>
          ))}
        </Table>
      </Card>
      <Modal isOpen={showModal} onClose={closeModal} title={selected ? 'Editar Rol' : 'Nuevo Rol'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} required />
          <Input label="Descripción" value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} />
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="primary">{selected ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
