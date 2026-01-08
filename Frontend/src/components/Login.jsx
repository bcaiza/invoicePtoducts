import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);

    const result = await login(values.email, values.password);
    
    if (result.success) {
      navigate('/invoices', { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEzIDAgNiAyLjY4NyA2IDZzLTIuNjg3IDYtNiA2LTYtMi42ODctNi02IDIuNjg3LTYgNi02ek0wIDV2MTBoMTBWNUgwem01MCAxMHYxMGgxMFYxNUg1MHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Bizcocho</h1>
          <p className="text-lg text-white/90">Sistema de Ventas</p>
        </div>

        <Card className="shadow-2xl">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              label="Correo electrónico"
              name="email"
              rules={[
                { required: true, message: 'Por favor ingrese su correo' },
                { type: 'email', message: 'Ingrese un correo válido' }
              ]}
            >
              <Input 
                prefix={<Mail size={18} />}
                placeholder="ejemplo@bizcocho.com" 
              />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: 'Por favor ingrese su contraseña' }
              ]}
            >
              <Input.Password 
                prefix={<Lock size={18} />}
                placeholder="••••••••" 
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                icon={<LogIn size={18} />}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-sm text-center text-slate-600 dark:text-slate-400">
            <p>Usa las credenciales proporcionadas por tu administrador</p>
          </div>
        </Card>

        <div className="mt-8 text-sm text-center text-white">
          <p className="opacity-90">Bizcocho Sales System © 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
