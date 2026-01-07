import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ROLE_CONFIGS } from '../types';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    const result = await login({ username, password });

    if (result.success) {
      // Redirigir al dashboard correspondiente
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    clearError();

    const result = await login({ username: demoUsername, password: demoPassword });

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-accent/10 flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Panel izquierdo - Información */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-bold text-secondary mb-4">
              Copilot Salud Andalucía
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Sistema de Análisis Sociosanitario de Málaga
            </p>

            {/* Credenciales de prueba */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-secondary mb-4">
                🔑 Credenciales de Prueba
              </h3>
              <div className="space-y-3">
                {Object.values(ROLE_CONFIGS).map((roleConfig) => {
                  const credentials = {
                    admin: { user: 'admin', pass: 'admin123' },
                    gestor: { user: 'gestor.malaga', pass: 'gestor123' },
                    analista: { user: 'analista.datos', pass: 'analista123' },
                    invitado: { user: 'demo', pass: 'demo123' },
                  };

                  const cred = credentials[roleConfig.role];

                  return (
                    <button
                      key={roleConfig.role}
                      onClick={() => handleDemoLogin(cred.user, cred.pass)}
                      className="w-full text-left p-3 rounded-lg border-2 hover:shadow-md transition-all"
                      style={{
                        borderColor: roleConfig.color,
                        backgroundColor: `${roleConfig.color}15`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl mr-2">{roleConfig.icon}</span>
                          <span className="font-semibold" style={{ color: roleConfig.color }}>
                            {roleConfig.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {cred.user} / {cred.pass}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>✅ 26 KPIs de salud de Andalucía</p>
              <p>✅ Mapas interactivos de centros sanitarios</p>
              <p>✅ Asistente AI Inteligente (Groq)</p>
              <p>✅ Análisis de datos en tiempo real</p>
            </div>
          </div>

          {/* Panel derecho - Formulario de login */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-secondary">Iniciar Sesión</h2>
              <p className="text-gray-600 mt-2">Ingresa tus credenciales</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de usuario */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Ingresa tu usuario"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Campo de contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">❌ {error}</p>
                </div>
              )}

              {/* Botón de submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Versión 2.0 - Migración React + TypeScript</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
