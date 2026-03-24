// pages/Login_administrativo.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, Shield, Eye, EyeOff, ArrowRight } from "lucide-react";

const Login_administrativo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setLoginError("Por favor completa todos los campos");
      return;
    }
    
    setIsLoading(true);
    setLoginError("");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.email === "demo@iadey.gob.ve" && formData.password === "Password123") {
        const userData = {
          id: "usr_" + Date.now(),
          email: formData.email,
          name: "Usuario Demo",
          role: "emprendedor",
          lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('usuario', JSON.stringify(userData));
        navigate("/dashboard", { replace: true });
      } else {
        setLoginError("Credenciales incorrectas");
      }
    } catch (error) {
      setLoginError("Error al conectar con el servidor");
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
                Instituto Autónomo del Desarrollo Economico del Estado Yaracuy
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
              Inicia sesión para acceder a tu cuenta
            </p>
          </div>

          {/* Mensaje de error */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo de email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg
                    focus:outline-none focus:border-[#264653] focus:ring-2 focus:ring-[#264653]/20
                    transition-all duration-200 bg-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="ejemplo@correo.com"
                  disabled={isLoading}
                />
              </div>
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#264653] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login_administrativo;