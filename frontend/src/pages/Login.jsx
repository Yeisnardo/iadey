// pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IdCard, Lock, User, AlertCircle, Shield, Eye, EyeOff, ArrowRight } from "lucide-react";
import usuarioAPI from '../services/api_usuario'; // Importar la API real

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cedula_usuario: "", // Cambiado de email a cedula_usuario
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Verificar si ya está autenticado
    if (usuarioAPI.isAuthenticated()) {
      const user = usuarioAPI.getCurrentUser();
      if (user) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Para cédula, solo permitir números y letras (según formato venezolano)
    if (name === "cedula_usuario") {
      const filteredValue = value.replace(/[^\dVEve-]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: filteredValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.cedula_usuario || !formData.password) {
      setLoginError("Por favor completa todos los campos");
      return;
    }
    
    // Validar formato básico de cédula
    const cedulaRegex = /^[\dVEve-]+$/;
    if (!cedulaRegex.test(formData.cedula_usuario)) {
      setLoginError("Formato de cédula inválido");
      return;
    }
    
    setIsLoading(true);
    setLoginError("");
    
    try {
      // Usar la API real de usuarioAPI
      const response = await usuarioAPI.login(formData.cedula_usuario, formData.password);
      
      if (response.success) {
        // Navegar al dashboard después del login exitoso
        navigate("/dashboard", { replace: true });
      } else {
        setLoginError(response.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error de login:", error);
      if (error.response?.status === 401) {
        setLoginError("Cédula o contraseña incorrecta");
      } else if (error.response?.status === 403) {
        setLoginError("Usuario inactivo o bloqueado");
      } else if (error.response?.status === 500) {
        setLoginError("Error del servidor. Intente más tarde");
      } else {
        setLoginError(error.error || "Error al conectar con el servidor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#264653] to-white flex items-center justify-center p-4">
      {/* Tarjeta principal */}
      <div className={`
        bg-white rounded-2xl shadow-xl w-full max-w-md
        transform transition-all duration-700 ease-out
        border border-gray-100
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}>
        {/* Header con color sólido */}
        <div className="bg-[#264653] px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white/10 p-3 rounded-xl">
              <User size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                IADEY
              </h2>
              <p className="text-white/80 text-sm">
                Instituto Autónomo del Desarrollo Económico del Estado Yaracuy
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Título de bienvenida */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              ¡Bienvenido de vuelta!
            </h3>
            <p className="text-gray-500 text-sm">
              Inicia sesión con tu cédula de identidad
            </p>
          </div>

          {/* Mensaje de error */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de cédula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cédula de Identidad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdCard size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="cedula_usuario"
                  value={formData.cedula_usuario}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg
                    focus:outline-none focus:border-[#264653] focus:ring-2 focus:ring-[#264653]/20
                    transition-all duration-200 bg-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ej: 12345678 o V-12345678"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">
                Ingresa tu número de cédula (V-12345678 o 12345678)
              </p>
            </div>

            {/* Campo de contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg
                    focus:outline-none focus:border-[#264653] focus:ring-2 focus:ring-[#264653]/20
                    transition-all duration-200 bg-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#264653] transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Enlace de olvidé contraseña */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/recuperar-password")}
                className="text-sm text-[#264653] hover:text-[#2A9D8F] font-medium 
                  transition-colors duration-200 flex items-center gap-1 group"
              >
                ¿Olvidaste tu contraseña?
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#264653] text-white py-2.5 rounded-lg font-medium
                hover:bg-[#1a3542] active:bg-[#0f232e]
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm hover:shadow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Enlace de registro */}
            <p className="text-center text-gray-600 text-sm mt-6">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate("/registro-emprendedor")}
                className="text-[#264653] font-semibold hover:text-[#2A9D8F] transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;