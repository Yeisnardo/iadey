// pages/ConfiguracionContrato.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Save,
  RotateCcw,
  Percent,
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  CreditCard,
  Building,
  User
} from "lucide-react";

// Componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import configuracionContratoAPI from '../services/api_configuracion_contrato';

const ConfiguracionContrato = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("configuracion");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentConfigId, setCurrentConfigId] = useState(null);

  // Estado para la configuración
  const [configuracion, setConfiguracion] = useState({
    interes_porcentaje: 12.5,
    morosidad_porcentaje: 3.0,
    flat_porcentaje: 2.5,
    cuotas_obligatorias: 12,
    cuotas_gracia: 2,
    frecuencia_pago: "mensual",
    cedula_pago: "",
    banco_pago: "",
    cuenta_pago: ""
  });

  // Notificaciones y usuario
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Configuración actualizada", time: "2 horas", read: false },
    { id: 2, text: "Nuevo contrato generado", time: "1 día", read: false },
  ]);

  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador del Sistema",
    avatar: null,
    department: "Dirección General"
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Bancos disponibles
  const bancosOptions = [
    "Banco de Venezuela",
    "Banco Bicentenario",
    "Banco del Tesoro",
    "Banco Mercantil",
    "Banco Provincial",
    "Banesco",
    "Banco Nacional de Crédito (BNC)",
    "Banco Exterior",
    "Banco Plaza",
    "Banco Caroní",
    "Banco Sofitasa",
    "Banco Activo",
    "Banco Agrícola",
    "Banco de la Fuerza Armada (BANFANB)",
    "Banco Fondo Común",
    "Banco Venezolano de Crédito",
    "Bancaribe",
    "Banplus",
    "Del Sur Banco Universal",
    "100% Banco"
  ];

  // Cargar configuración al montar
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  // Detectar cambios
  useEffect(() => {
    const originalConfig = JSON.parse(localStorage.getItem('configOriginal') || '{}');
    const hasChanged = JSON.stringify(configuracion) !== JSON.stringify(originalConfig);
    setHasChanges(hasChanged);
  }, [configuracion]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notifications-menu') && !e.target.closest('.user-menu')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const cargarConfiguracion = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await configuracionContratoAPI.getCurrent();
      if (response.success && response.data) {
        const configData = response.data;
        setConfiguracion({
          interes_porcentaje: parseFloat(configData.interes_porcentaje) || 12.5,
          morosidad_porcentaje: parseFloat(configData.morosidad_porcentaje) || 3.0,
          flat_porcentaje: parseFloat(configData.flat_porcentaje) || 2.5,
          cuotas_obligatorias: parseInt(configData.cuotas_obligatorias) || 12,
          cuotas_gracia: parseInt(configData.cuotas_gracia) || 2,
          frecuencia_pago: configData.frecuencia_pago || "mensual",
          cedula_pago: configData.cedula_pago || "",
          banco_pago: configData.banco_pago || "",
          cuenta_pago: configData.cuenta_pago || ""
        });
        setCurrentConfigId(configData.id_configuracion);
        localStorage.setItem('configOriginal', JSON.stringify(configData));
      } else {
        // Si no hay configuración, usar valores por defecto
        const defaultConfig = {
          interes_porcentaje: 12.5,
          morosidad_porcentaje: 3.0,
          flat_porcentaje: 2.5,
          cuotas_obligatorias: 12,
          cuotas_gracia: 2,
          frecuencia_pago: "mensual",
          cedula_pago: "",
          banco_pago: "",
          cuenta_pago: ""
        };
        localStorage.setItem('configOriginal', JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setErrorMessage('No se pudo cargar la configuración. Usando valores por defecto.');
      // Usar valores por defecto en caso de error
      const defaultConfig = {
        interes_porcentaje: 12.5,
        morosidad_porcentaje: 3.0,
        flat_porcentaje: 2.5,
        cuotas_obligatorias: 12,
        cuotas_gracia: 2,
        frecuencia_pago: "mensual",
        cedula_pago: "",
        banco_pago: "",
        cuenta_pago: ""
      };
      localStorage.setItem('configOriginal', JSON.stringify(defaultConfig));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: ['frecuencia_pago', 'cedula_pago', 'banco_pago', 'cuenta_pago'].includes(campo) 
        ? valor 
        : parseFloat(valor) || 0
    }));
    setSaveSuccess(false);
    setErrorMessage("");
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage("");
    setSaveSuccess(false);
    
    try {
      // Preparar datos para enviar a la API
      const dataToSend = {
        interes_porcentaje: parseFloat(configuracion.interes_porcentaje),
        morosidad_porcentaje: parseFloat(configuracion.morosidad_porcentaje),
        flat_porcentaje: parseFloat(configuracion.flat_porcentaje),
        cuotas_obligatorias: parseInt(configuracion.cuotas_obligatorias),
        cuotas_gracia: parseInt(configuracion.cuotas_gracia),
        frecuencia_pago: configuracion.frecuencia_pago,
        cedula_pago: configuracion.cedula_pago || null,
        banco_pago: configuracion.banco_pago || null,
        cuenta_pago: configuracion.cuenta_pago || null
      };

      let response;
      
      if (currentConfigId) {
        // Si existe una configuración, actualizarla
        response = await configuracionContratoAPI.update(currentConfigId, dataToSend);
      } else {
        // Si no existe, crear una nueva
        response = await configuracionContratoAPI.create(dataToSend);
      }

      if (response.success) {
        // Actualizar el ID de configuración si es una nueva
        if (!currentConfigId && response.data) {
          setCurrentConfigId(response.data.id_configuracion);
        }
        
        // Actualizar localStorage con la nueva configuración
        localStorage.setItem('configOriginal', JSON.stringify(response.data || dataToSend));
        
        // Mostrar mensaje de éxito
        setSaveSuccess(true);
        setHasChanges(false);
        
        // Agregar notificación
        setNotifications(prev => [{
          id: Date.now(),
          text: "Configuración de contratos guardada exitosamente",
          time: "ahora",
          read: false
        }, ...prev]);
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(response.error || 'Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrorMessage(error.error || error.message || 'Error al guardar la configuración');
      
      // Agregar notificación de error
      setNotifications(prev => [{
        id: Date.now(),
        text: `Error: ${error.error || 'No se pudo guardar la configuración'}`,
        time: "ahora",
        read: false
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de restaurar la última configuración guardada?')) {
      const savedConfig = localStorage.getItem('configOriginal');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfiguracion({
          interes_porcentaje: parseFloat(parsed.interes_porcentaje) || 12.5,
          morosidad_porcentaje: parseFloat(parsed.morosidad_porcentaje) || 3.0,
          flat_porcentaje: parseFloat(parsed.flat_porcentaje) || 2.5,
          cuotas_obligatorias: parseInt(parsed.cuotas_obligatorias) || 12,
          cuotas_gracia: parseInt(parsed.cuotas_gracia) || 2,
          frecuencia_pago: parsed.frecuencia_pago || "mensual",
          cedula_pago: parsed.cedula_pago || "",
          banco_pago: parsed.banco_pago || "",
          cuenta_pago: parsed.cuenta_pago || ""
        });
        setErrorMessage("");
        setSaveSuccess(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const frecuenciaOptions = [
    { value: "semanal", label: "Semanal" },
    { value: "quincenal", label: "Quincenal" },
    { value: "mensual", label: "Mensual" }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        user={user}
        handleLogout={handleLogout}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
      />

      <div className="flex flex-1">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="p-4 md:p-6 mt-16">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Configuración de Contratos
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gestión de parámetros para contratos de financiamiento
                </p>
              </div>
              
              <div className="flex gap-3">
                {hasChanges && (
                  <>
                    <button
                      onClick={handleReset}
                      className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <RotateCcw size={18} />
                      Restaurar
                    </button>
                    
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </>
                )}
                
                {saveSuccess && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="text-sm">¡Guardado!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje de error */}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}

            {/* Formulario de Configuración */}
            <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Porcentaje de Interés */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Porcentaje de Interés (%)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={configuracion.interes_porcentaje}
                      onChange={(e) => handleInputChange('interes_porcentaje', e.target.value)}
                      className={`w-full px-4 py-2 pr-8 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      %
                    </span>
                  </div>
                </div>

                {/* Porcentaje de Morosidad */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={darkMode ? 'text-red-400' : 'text-red-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Porcentaje de Morosidad (%)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={configuracion.morosidad_porcentaje}
                      onChange={(e) => handleInputChange('morosidad_porcentaje', e.target.value)}
                      className={`w-full px-4 py-2 pr-8 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      %
                    </span>
                  </div>
                </div>

                {/* Porcentaje Flat */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Porcentaje Flat (%)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={configuracion.flat_porcentaje}
                      onChange={(e) => handleInputChange('flat_porcentaje', e.target.value)}
                      className={`w-full px-4 py-2 pr-8 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      %
                    </span>
                  </div>
                </div>

                {/* Cuotas Obligatorias */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={darkMode ? 'text-green-400' : 'text-green-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cuotas Obligatorias
                    </label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={configuracion.cuotas_obligatorias}
                    onChange={(e) => handleInputChange('cuotas_obligatorias', e.target.value)}
                    className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                {/* Cuotas de Gracia */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cuotas de Gracia
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={configuracion.cuotas_gracia}
                    onChange={(e) => handleInputChange('cuotas_gracia', e.target.value)}
                    className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                {/* Frecuencia de Pago */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Frecuencia de Pago
                    </label>
                  </div>
                  <select
                    value={configuracion.frecuencia_pago}
                    onChange={(e) => handleInputChange('frecuencia_pago', e.target.value)}
                    className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {frecuenciaOptions.map((opcion) => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cédula de Pago */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cédula de Pago
                    </label>
                  </div>
                  <input
                    type="text"
                    value={configuracion.cedula_pago}
                    onChange={(e) => handleInputChange('cedula_pago', e.target.value)}
                    placeholder="Ej: V-12345678-9"
                    className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Banco de Pago */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Banco de Pago
                    </label>
                  </div>
                  <select
                    value={configuracion.banco_pago}
                    onChange={(e) => handleInputChange('banco_pago', e.target.value)}
                    className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar Banco</option>
                    {bancosOptions.map((banco) => (
                      <option key={banco} value={banco}>
                        {banco}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cuenta de Pago */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className={darkMode ? 'text-green-400' : 'text-green-600'} size={18} />
                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cuenta de Pago
                    </label>
                  </div>
                  <input
                    type="text"
                    value={configuracion.cuenta_pago}
                    onChange={(e) => handleInputChange('cuenta_pago', e.target.value)}
                    placeholder="Ej: 0102-1234-56-7890123456"
                    className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Resumen de Valores Actuales */}
              <div className={`mt-8 p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resumen de Configuración Actual
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Interés</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {configuracion.interes_porcentaje}%
                    </span>
                  </div>
                  <div>
                    <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Morosidad</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {configuracion.morosidad_porcentaje}%
                    </span>
                  </div>
                  <div>
                    <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Flat</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {configuracion.flat_porcentaje}%
                    </span>
                  </div>
                  <div>
                    <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Cuotas Oblig.</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {configuracion.cuotas_obligatorias}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Cuotas Gracia</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {configuracion.cuotas_gracia}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Frecuencia</span>
                    <span className={`font-medium capitalize ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {configuracion.frecuencia_pago}
                    </span>
                  </div>
                  {configuracion.cedula_pago && (
                    <div>
                      <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Cédula</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {configuracion.cedula_pago}
                      </span>
                    </div>
                  )}
                  {configuracion.banco_pago && (
                    <div>
                      <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Banco</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {configuracion.banco_pago}
                      </span>
                    </div>
                  )}
                  {configuracion.cuenta_pago && (
                    <div>
                      <span className={`block text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Cuenta</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {configuracion.cuenta_pago}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

export default ConfiguracionContrato;