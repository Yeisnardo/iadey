// pages/Cuota.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  DollarSign,
  CreditCard,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  ArrowUpDown,
  Wallet,
  Banknote,
  Receipt,
  PhoneCall,
  Mail,
  MapPin,
  User,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileText
} from "lucide-react";

// Componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import CuotaAPI from '../services/api_cuota';

const Cuota = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [showPaymentReceiptModal, setShowPaymentReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para generar cuotas
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPrestamoForGeneration, setSelectedPrestamoForGeneration] = useState(null);
  const [generationConfig, setGenerationConfig] = useState({
    cantidadCuotas: 0,
    montoPorCuota: 0,
    frecuencia: "mensual",
    fechaPrimeraCuota: "",
    incluirMora: false
  });
  
  // Datos del usuario
  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Gestión de Cuotas",
    joinDate: "Enero 2024"
  };

  // Notificaciones
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Pago de cuota registrado", time: "5 min", read: false },
    { id: 2, text: "Nuevo vencimiento próximo", time: "1 hora", read: false },
    { id: 3, text: "Actualización de tasas", time: "3 horas", read: true },
  ]);

  // Función para verificar si una cuota está vencida o en mora
  const getCuotaStatus = (fechaVencimiento, fechaPago, estadoBase) => {
    if (estadoBase === "pagado") return "pagado";
    
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);
    
    if (estadoBase === "pendiente") {
      if (hoy > vencimiento) {
        const diffDays = Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
          return "vencido";
        }
        return "en_mora";
      }
      return "pendiente";
    }
    
    return estadoBase;
  };

  // Calcular mora (5% del monto de la cuota por mes de retraso)
  const calcularMora = (fechaVencimiento, montoCuota) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);
    
    if (hoy > vencimiento) {
      const diffMonths = (hoy.getFullYear() - vencimiento.getFullYear()) * 12 + 
                        (hoy.getMonth() - vencimiento.getMonth());
      const moraPorcentaje = 0.05 * (diffMonths + 1);
      return montoCuota * moraPorcentaje;
    }
    return 0;
  };

  // Estadísticas generales
  const stats = [
    {
      id: 1,
      title: "Total Préstamos Activos",
      value: prestamos.filter(p => p.estado === "activo").length,
      icon: CreditCard,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      id: 2,
      title: "Monto Total Prestado",
      value: `$${prestamos.reduce((sum, p) => sum + p.montoTotal, 0).toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      id: 3,
      title: "Cuotas por Cobrar",
      value: `$${prestamos.reduce((sum, p) => sum + p.saldoPendiente, 0).toLocaleString()}`,
      icon: Clock,
      color: "yellow",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      id: 4,
      title: "Tasa de Puntualidad",
      value: "94%",
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  // Filtrar préstamos
  const filteredPrestamos = prestamos.filter(prestamo => {
    const matchesSearch = prestamo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prestamo.cedula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || prestamo.estado === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Marcar notificaciones como leídas
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  // Registrar pago con comprobante
  const handleRegisterPayment = async (prestamoId, cuotaNumero, pagoData) => {
    const { montoPagado, comprobante } = pagoData;
    
    setPrestamos(prestamos.map(prestamo => {
      if (prestamo.id === prestamoId) {
        const updatedCuotas = prestamo.cuotas.map(cuota => {
          if (cuota.numero === cuotaNumero && (cuota.estado === "pendiente" || cuota.estado === "en_mora")) {
            const fechaPago = new Date().toISOString().split('T')[0];
            const mora = calcularMora(cuota.fechaVencimiento, cuota.monto);
            
            return { 
              ...cuota, 
              estado: "pagado", 
              fechaPago: fechaPago,
              comprobante: comprobante.name || comprobante,
              montoPagado: montoPagado,
              moraPagada: mora
            };
          }
          return cuota;
        });
        
        const pagadas = updatedCuotas.filter(c => c.estado === "pagado").length;
        const montoPagadoTotal = updatedCuotas.reduce((sum, c) => sum + (c.estado === "pagado" ? c.monto : 0), 0);
        const saldoPendiente = prestamo.montoTotal - montoPagadoTotal;
        
        const fechaCierre = saldoPendiente === 0 ? new Date().toISOString().split('T')[0] : null;
        
        return {
          ...prestamo,
          cuotas: updatedCuotas,
          cuotasPagadas: pagadas,
          cuotasPendientes: prestamo.plazo - pagadas,
          montoPagado: montoPagadoTotal,
          saldoPendiente: saldoPendiente,
          estado: saldoPendiente === 0 ? "pagado" : "activo",
          fechaCierre: fechaCierre
        };
      }
      return prestamo;
    }));
    
    setShowPaymentModal(false);
    setSelectedCuota(null);
    
    setNotifications([
      {
        id: Date.now(),
        text: `Pago de cuota ${cuotaNumero} registrado exitosamente`,
        time: "Justo ahora",
        read: false
      },
      ...notifications
    ]);
  };

  // Ver comprobante de pago
  const handleViewReceipt = (prestamoId, cuota) => {
    setSelectedPayment({
      prestamoId,
      cuota,
      prestamo: prestamos.find(p => p.id === prestamoId)
    });
    setShowPaymentReceiptModal(true);
  };

  // Función para generar cuotas para un préstamo
  const handleGenerateCuotas = (prestamoId) => {
    const prestamo = prestamos.find(p => p.id === prestamoId);
    if (prestamo) {
      const cuotasRestantes = prestamo.plazo - prestamo.cuotas.length;
      const montoPorCuota = prestamo.montoCuota;
      
      setGenerationConfig({
        cantidadCuotas: cuotasRestantes || 1,
        montoPorCuota: montoPorCuota,
        frecuencia: "mensual",
        fechaPrimeraCuota: new Date().toISOString().split('T')[0],
        incluirMora: false
      });
      
      setSelectedPrestamoForGeneration(prestamo);
      setShowGenerateModal(true);
    }
  };

  // Función para confirmar la generación de cuotas
  const confirmGenerateCuotas = async (configuracion) => {
    if (!selectedPrestamoForGeneration) return;
    
    const config = {
      cantidadCuotas: configuracion.cantidadCuotas,
      frecuencia: configuracion.frecuencia,
      fechaPrimeraCuota: configuracion.fechaPrimeraCuota,
      cuotasGracia: configuracion.cuotasGracia || 0,
      montoObligatorio: configuracion.montoObligatorio || 0,
      montoGracia: configuracion.montoGracia || 0
    };
    
    console.log('Enviando configuración al backend:', config);
    
    try {
      const response = await CuotaAPI.generarCuotasManual(selectedPrestamoForGeneration.id, config);
      
      if (response.success) {
        await cargarContratos();
        alert(response.message);
        setShowGenerateModal(false);
        setSelectedPrestamoForGeneration(null);
      }
    } catch (error) {
      console.error('Error al generar cuotas:', error);
      alert(error.response?.data?.error || 'Error al generar las cuotas');
    }
  };

  // Obtener estado de cuota con color y texto
  const getEstadoConfig = (cuota, prestamoId) => {
    const status = getCuotaStatus(cuota.fechaVencimiento, cuota.fechaPago, cuota.estado);
    
    switch(status) {
      case "pagado":
        return { 
          text: "Pagado", 
          color: "text-green-600", 
          bg: "bg-green-100", 
          icon: CheckCircle,
          border: "border-green-200"
        };
      case "vencido":
        return { 
          text: "Vencido", 
          color: "text-red-600", 
          bg: "bg-red-100", 
          icon: XCircle,
          border: "border-red-200"
        };
      case "en_mora":
        return { 
          text: "En Mora", 
          color: "text-orange-600", 
          bg: "bg-orange-100", 
          icon: AlertCircle,
          border: "border-orange-200"
        };
      default:
        return { 
          text: "Pendiente", 
          color: "text-yellow-600", 
          bg: "bg-yellow-100", 
          icon: Clock,
          border: "border-yellow-200"
        };
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarContratos();
  }, []);

  const cargarContratos = async () => {
    try {
      setLoading(true);
      const response = await CuotaAPI.getAll();
      if (response.success) {
        const contratosFormateados = response.data.map(contrato => ({
          id: contrato.id_contrato,
          cliente: `${contrato.aprobacion?.cliente_nombre || 'Cliente'}`,
          cedula: contrato.aprobacion?.cliente_cedula || '',
          telefono: contrato.aprobacion?.cliente_telefono || '',
          email: contrato.aprobacion?.cliente_email || '',
          direccion: contrato.aprobacion?.cliente_direccion || '',
          montoTotal: parseFloat(contrato.devolvimiento) || 0,
          montoPagado: 0,
          saldoPendiente: parseFloat(contrato.monto_moneda) || 0,
          tasaInteres: parseFloat(contrato.interes) || 0,
          plazo: contrato.numero_cuotas || 0,
          cuotasPagadas: 0,
          numero_gracias: contrato.numero_gracias || 0,
          devolvimiento: contrato.devolvimiento,
          monto_moneda: contrato.monto_moneda, 
          cuotasPendientes: contrato.numero_cuotas || 0,
          estado: contrato.estatus === 'En espera de cuotas' ? 'pendiente' : 
                  contrato.estatus === 'Activo' ? 'activo' : 'pagado',
          fechaInicio: contrato.inicio ? contrato.inicio.split('T')[0] : '',
          fechaCierre: contrato.cierre ? contrato.cierre.split('T')[0] : null,
          montoCuota: contrato.cuotas && contrato.cuotas.length > 0 ? 
                      parseFloat(contrato.cuotas[0].monto_cuota) : 0,
          cuotas: (contrato.cuotas || []).map(cuota => ({
            id: cuota.id_cuota,
            numero: cuota.numero_cuota,
            fechaVencimiento: cuota.fecha_vencimiento ? cuota.fecha_vencimiento.split('T')[0] : '',
            monto: parseFloat(cuota.monto_cuota) || 0,
            estado: cuota.estado_cuota,
            fechaPago: cuota.fecha_pago ? cuota.fecha_pago.split('T')[0] : null,
            comprobante: cuota.comprobante_pago,
            montoPagado: parseFloat(cuota.monto_pagado) || 0,
            moraPagada: parseFloat(cuota.monto_mora) || 0
          }))
        }));
        
        contratosFormateados.forEach(contrato => {
          const pagadas = contrato.cuotas.filter(c => c.estado === 'pagado');
          contrato.cuotasPagadas = pagadas.length;
          contrato.cuotasPendientes = contrato.plazo - pagadas.length;
          contrato.montoPagado = pagadas.reduce((sum, c) => sum + c.monto, 0);
          contrato.saldoPendiente = contrato.montoTotal - contrato.montoPagado;
        });
        
        setPrestamos(contratosFormateados);
      }
    } catch (error) {
      console.error('Error al cargar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const unreadCount = notifications.filter(n => !n.read).length;

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
          activeTab="cuotas"
          setActiveTab={() => {}}
          darkMode={darkMode}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="p-4 md:p-6 mt-16">
            {/* Título */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Gestión de Cuotas
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Control de pagos, seguimiento de morosidad y gestión de cartera
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.id} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={stat.textColor} size={24} />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stat.value}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Filtros y búsqueda */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por cliente o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-200 text-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                >
                  <option value="all">Todos los préstamos</option>
                  <option value="activo">Activos</option>
                  <option value="pagado">Pagados</option>
                </select>
                
                <button className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                  <Plus size={20} />
                  Nuevo Préstamo
                </button>
              </div>
            </div>

            {/* Lista de préstamos */}
            <div className="space-y-6">
              {filteredPrestamos.map((prestamo) => (
                <div key={prestamo.id} className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
                  {/* Cabecera del préstamo */}
                  <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${prestamo.estado === 'activo' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Wallet className={prestamo.estado === 'activo' ? 'text-green-600' : 'text-gray-600'} size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {prestamo.cliente}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prestamo.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {prestamo.estado.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-400" />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cédula: {prestamo.cedula}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneCall size={14} className="text-gray-400" />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{prestamo.telefono}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{prestamo.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{prestamo.direccion}</span>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                              📅 Inicio: {prestamo.fechaInicio}
                            </span>
                            {prestamo.fechaCierre && (
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                🔒 Cierre: {prestamo.fechaCierre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto Total</p>
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              ${prestamo.montoTotal.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Saldo Pendiente</p>
                            <p className={`text-lg font-bold ${prestamo.saldoPendiente > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              ${prestamo.saldoPendiente.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progreso</p>
                            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {Math.round((prestamo.montoPagado / prestamo.montoTotal) * 100)}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Botón Generar Cuotas */}
                        <div className="flex justify-center mt-2">
                          <button
                            onClick={() => handleGenerateCuotas(prestamo.id)}
                            className="px-4 py-2 bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <Calendar size={18} />
                            Generar Cuotas
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progreso de pago</span>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {prestamo.cuotasPagadas} de {prestamo.plazo} cuotas
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#264653] to-[#2A9D8F] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(prestamo.cuotasPagadas / prestamo.plazo) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tabla de cuotas */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">N°</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha Vencimiento</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Monto</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Mora</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Monto Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha Pago</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Comprobante</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {prestamo.cuotas.map((cuota) => {
                          const estadoConfig = getEstadoConfig(cuota, prestamo.id);
                          const mora = (cuota.estado !== "pagado") ? calcularMora(cuota.fechaVencimiento, cuota.monto) : 0;
                          const totalPagar = cuota.monto + mora;
                          const Icon = estadoConfig.icon;
                          const puedePagar = cuota.estado === "pendiente" || cuota.estado === "en_mora";
                          
                          return (
                            <tr key={cuota.numero} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${estadoConfig.border}`}>
                              <td className="px-4 py-3 text-sm font-medium">{cuota.num_cuota}</td>
                              <td className="px-4 py-3 text-sm">{cuota.fechaVencimiento}</td>
                              <td className="px-4 py-3 text-sm">${cuota.monto.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-red-600">
                                {mora > 0 ? `$${mora.toFixed(2)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {mora > 0 ? `$${totalPagar.toFixed(2)}` : `$${cuota.monto.toLocaleString()}`}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.bg} ${estadoConfig.color}`}>
                                  <Icon size={12} />
                                  {estadoConfig.text}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">{cuota.fechaPago || '-'}</td>
                              <td className="px-4 py-3">
                                {cuota.comprobante && (
                                  <button
                                    onClick={() => handleViewReceipt(prestamo.id, cuota)}
                                    className="text-[#2A9D8F] hover:text-[#264653] transition-colors"
                                  >
                                    <FileText size={18} />
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {puedePagar && (
                                  <button
                                    onClick={() => {
                                      setSelectedCuota({ 
                                        prestamoId: prestamo.id, 
                                        cuotaNumero: cuota.numero, 
                                        monto: cuota.monto, 
                                        mora,
                                        fechaVencimiento: cuota.fechaVencimiento
                                      });
                                      setShowPaymentModal(true);
                                    }}
                                    className="px-3 py-1 bg-[#2A9D8F] text-white rounded-lg text-sm hover:bg-[#264653] transition-colors flex items-center gap-1"
                                  >
                                    <Receipt size={14} />
                                    Pagar
                                  </button>
                                )}
                                {cuota.estado === "pagado" && (
                                  <button
                                    onClick={() => handleViewReceipt(prestamo.id, cuota)}
                                    className="px-3 py-1 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors flex items-center gap-1"
                                  >
                                    <Eye size={14} />
                                    Ver
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* Modal de registro de pago */}
      {showPaymentModal && selectedCuota && (
        <PaymentModal
          selectedCuota={selectedCuota}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCuota(null);
          }}
          onConfirm={handleRegisterPayment}
          darkMode={darkMode}
        />
      )}

      {/* Modal para ver comprobante */}
      {showPaymentReceiptModal && selectedPayment && (
        <ReceiptModal
          selectedPayment={selectedPayment}
          onClose={() => {
            setShowPaymentReceiptModal(false);
            setSelectedPayment(null);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Modal para generar cuotas */}
      {showGenerateModal && selectedPrestamoForGeneration && (
        <GenerateCuotasModal
          prestamo={selectedPrestamoForGeneration}
          config={generationConfig}
          onConfigChange={setGenerationConfig}
          onConfirm={confirmGenerateCuotas}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedPrestamoForGeneration(null);
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Componente Modal de Pago
const PaymentModal = ({ selectedCuota, onClose, onConfirm, darkMode }) => {
  const [comprobante, setComprobante] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [referencia, setReferencia] = useState("");
  const [montoPagado, setMontoPagado] = useState(selectedCuota.monto + selectedCuota.mora);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPagar = selectedCuota.monto + selectedCuota.mora;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprobante(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!comprobante && metodoPago !== "efectivo") {
      alert("Por favor, adjunte el comprobante de pago");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onConfirm(selectedCuota.prestamoId, selectedCuota.cuotaNumero, {
      montoPagado: montoPagado,
      comprobante: comprobante || {
        name: `pago_${Date.now()}.pdf`,
        size: 0,
        type: "application/pdf"
      },
      metodoPago: metodoPago,
      referencia: referencia
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Registrar Pago - Cuota N° {selectedCuota.cuotaNumero}
        </h3>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fecha vencimiento:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedCuota.fechaVencimiento}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto de cuota:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ${selectedCuota.monto.toLocaleString()}
              </span>
            </div>
            {selectedCuota.mora > 0 && (
              <div className="flex justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Mora:</span>
                <span className="font-semibold text-red-600">${selectedCuota.mora.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold">Total a pagar:</span>
              <span className="text-xl font-bold text-[#2A9D8F]">
                ${totalPagar.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="pago_movil">Pago Móvil</option>
              <option value="punto_venta">Punto de Venta</option>
            </select>
          </div>

          {(metodoPago === "transferencia" || metodoPago === "pago_movil") && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Número de referencia
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ingrese el número de referencia"
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Comprobante de pago {metodoPago !== "efectivo" && <span className="text-red-500">*</span>}
            </label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}>
              {previewUrl ? (
                <div className="space-y-2">
                  {comprobante.type?.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                  ) : (
                    <FileText size={48} className="mx-auto text-gray-400" />
                  )}
                  <p className="text-sm text-gray-600">{comprobante.name}</p>
                  <button
                    onClick={() => {
                      setComprobante(null);
                      setPreviewUrl(null);
                    }}
                    className="text-red-600 text-sm hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Haga clic para subir el comprobante</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max. 5MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modal para ver comprobante
const ReceiptModal = ({ selectedPayment, onClose, darkMode }) => {
  const { cuota, prestamo } = selectedPayment;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Comprobante de Pago
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Información del Préstamo
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cliente:</span>
                <p className="font-medium">{prestamo.cliente}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cédula:</span>
                <p className="font-medium">{prestamo.cedula}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>N° Cuota:</span>
                <p className="font-medium">{cuota.numero}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto pagado:</span>
                <p className="font-medium text-green-600">${cuota.monto.toLocaleString()}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fecha de pago:</span>
                <p className="font-medium">{cuota.fechaPago}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Comprobante:</span>
                <p className="font-medium text-[#2A9D8F]">{cuota.comprobante}</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Comprobante
            </h4>
            <div className="bg-white p-4 rounded border border-gray-200 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">comprobante_pago_cuota_{cuota.numero}.pdf</p>
              <button className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg text-sm hover:bg-[#264653] transition-colors">
                Descargar Comprobante
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para generar cuotas manuales - VERSIÓN CORREGIDA (CON PARSEINT)
const GenerateCuotasModal = ({ 
  prestamo, 
  config, 
  onConfigChange, 
  onConfirm, 
  onClose, 
  darkMode 
}) => {
  const [cuotasGeneradas, setCuotasGeneradas] = useState([]);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [montosCalculados, setMontosCalculados] = useState({
    montoObligatorio: 0,
    montoGracia: 0
  });
  
  const handleChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };
  
  const calcularVistaPrevia = () => {
    const {
      cantidadCuotas, // Este es el número de CUOTAS OBLIGATORIAS
      frecuencia,
      fechaPrimeraCuota,
    } = config;
    
    if (!cantidadCuotas || !fechaPrimeraCuota) return;
    
    // IMPORTANTE: Asegurar que sean números, no strings
    const cuotasGracia = parseInt(prestamo.numero_gracias) || 0;
    const cuotasObligatorias = parseInt(cantidadCuotas) || 0;
    
    // TOTAL DE CUOTAS A GENERAR = OBLIGATORIAS + GRACIAS
    const totalCuotas = cuotasObligatorias + cuotasGracia;
    
    console.log('Debug:', {
      cuotasObligatorias,
      cuotasGracia,
      totalCuotas,
      tipoObligatorias: typeof cuotasObligatorias,
      tipoGracia: typeof cuotasGracia
    });
    
    // Monto total del préstamo
    const montoTotal = parseFloat(prestamo.devolvimiento || prestamo.montoTotal);
    
    // Monto de cada cuota obligatoria = MontoTotal / número de cuotas obligatorias
    const montoObligatorio = cuotasObligatorias > 0 ? montoTotal / cuotasObligatorias : 0;
    
    // Monto de cada cuota gracia = MontoTotal / número de cuotas gracias
    const montoGracia = cuotasGracia > 0 ? montoTotal / cuotasGracia : 0;
    
    // Actualizar montos calculados
    setMontosCalculados({
      montoObligatorio,
      montoGracia
    });
    
    const cuotasPrevias = [];
    let fechaActual = new Date(fechaPrimeraCuota);
    let totalObligatorias = 0;
    let totalGracias = 0;
    
    // Generar todas las cuotas (obligatorias + gracias)
    for (let i = 0; i < totalCuotas; i++) {
      const numeroCuota = i + 1;
      let tipoCuota = '';
      let monto = 0;
      
      // Las primeras 'cuotasObligatorias' son obligatorias
      // Las siguientes 'cuotasGracia' son de gracia
      if (numeroCuota <= cuotasObligatorias) {
        tipoCuota = 'Obligatoria';
        monto = montoObligatorio;
        totalObligatorias += monto;
      } else {
        tipoCuota = 'Gracias';
        monto = montoGracia;
        totalGracias += monto;
      }
      
      let fechaDesde = new Date(fechaActual);
      let fechaHasta = new Date(fechaActual);
      
      switch(frecuencia) {
        case 'mensual':
          fechaHasta.setMonth(fechaHasta.getMonth() + 1);
          fechaHasta.setDate(fechaHasta.getDate() - 1);
          break;
        case 'quincenal':
          fechaHasta.setDate(fechaHasta.getDate() + 14);
          break;
        case 'semanal':
          fechaHasta.setDate(fechaHasta.getDate() + 6);
          break;
        default:
          fechaHasta.setMonth(fechaHasta.getMonth() + 1);
          fechaHasta.setDate(fechaHasta.getDate() - 1);
      }
      
      cuotasPrevias.push({
        numero: numeroCuota,
        tipo: tipoCuota,
        fecha_desde: fechaDesde.toISOString().split('T')[0],
        fecha_hasta: fechaHasta.toISOString().split('T')[0],
        monto: monto
      });
      
      // Avanzar fecha para la siguiente cuota
      switch(frecuencia) {
        case 'mensual':
          fechaActual.setMonth(fechaActual.getMonth() + 1);
          break;
        case 'quincenal':
          fechaActual.setDate(fechaActual.getDate() + 15);
          break;
        case 'semanal':
          fechaActual.setDate(fechaActual.getDate() + 7);
          break;
      }
    }
    
    console.log('Resumen vista previa:', {
      cuotasObligatorias,
      cuotasGracia,
      totalCuotas,
      montoTotal,
      totalObligatorias,
      totalGracias,
      totalGeneral: totalObligatorias + totalGracias
    });
    
    setCuotasGeneradas(cuotasPrevias);
    setMostrarVistaPrevia(true);
  };
  
  const totalObligatorias = cuotasGeneradas
    .filter(c => c.tipo === 'Obligatoria')
    .reduce((sum, cuota) => sum + cuota.monto, 0);
  const totalGracias = cuotasGeneradas
    .filter(c => c.tipo === 'Gracias')
    .reduce((sum, cuota) => sum + cuota.monto, 0);
  
  // Obtener números del contrato (asegurar que sean números)
  const cuotasGraciaContrato = parseInt(prestamo.numero_gracias) || 0;
  const cuotasObligatoriasIngresadas = parseInt(config.cantidadCuotas) || 0;
  const totalCuotasGenerar = cuotasObligatoriasIngresadas + cuotasGraciaContrato;
  const montoTotalPrestamo = parseFloat(prestamo.devolvimiento || prestamo.montoTotal || 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Generar Cuotas - {prestamo.cliente}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de configuración */}
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Información del Contrato
              </h4>
              <div className="space-y-2 text-sm">
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Contrato N°: {prestamo.numero_contrato || prestamo.id}
                </p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Monto Total: <span className="font-semibold">${montoTotalPrestamo.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Cuotas de Gracia según contrato: <span className="font-semibold">{cuotasGraciaContrato}</span>
                </p>
              </div>
            </div>
            
            {/* Cantidad de cuotas OBLIGATORIAS */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Número de Cuotas Obligatorias *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={config.cantidadCuotas}
                onChange={(e) => handleChange('cantidadCuotas', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                placeholder="Ej: 10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingrese solo las cuotas obligatorias. Las cuotas de gracia se sumarán automáticamente.
              </p>
            </div>
            
            {/* Información de distribución de cuotas */}
            {config.cantidadCuotas > 0 && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                  Distribución de Cuotas
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-blue-600'}>Obligatorias:</span>
                    <span className={`font-bold ml-1 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                      {cuotasObligatoriasIngresadas}
                    </span>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-blue-600'}>Gracias (se suman):</span>
                    <span className={`font-bold ml-1 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                      {cuotasGraciaContrato}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs font-semibold text-blue-800">
                  ➕ Total cuotas a generar: {cuotasObligatoriasIngresadas} + {cuotasGraciaContrato} = <span className="text-blue-600">{totalCuotasGenerar}</span>
                </div>
              </div>
            )}
            
            {/* Montos calculados automáticamente */}
            {montosCalculados.montoObligatorio > 0 && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                  Montos Calculados
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-green-600'}>Cuota Obligatoria:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-green-800'}`}>
                      ${montosCalculados.montoObligatorio.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  {montosCalculados.montoGracia > 0 && (
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-green-600'}>Cuota Gracia:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-green-800'}`}>
                        ${montosCalculados.montoGracia.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Obligatorias:</span>
                    <span className="font-semibold">
                      ${(montosCalculados.montoObligatorio * cuotasObligatoriasIngresadas).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Gracias (adicional):</span>
                    <span className="font-semibold">
                      ${(montosCalculados.montoGracia * cuotasGraciaContrato).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold mt-1">
                    <span>Total General a Pagar:</span>
                    <span className="text-[#2A9D8F]">
                      ${((montosCalculados.montoObligatorio * cuotasObligatoriasIngresadas) + 
                         (montosCalculados.montoGracia * cuotasGraciaContrato)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Frecuencia de pago */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Frecuencia de pago
              </label>
              <select
                value={config.frecuencia}
                onChange={(e) => handleChange('frecuencia', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            
            {/* Fecha primera cuota */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha de primera cuota *
              </label>
              <input
                type="date"
                value={config.fechaPrimeraCuota}
                onChange={(e) => handleChange('fechaPrimeraCuota', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
              />
            </div>
            
            {/* Botón vista previa */}
            <button
              onClick={calcularVistaPrevia}
              disabled={!config.cantidadCuotas || !config.fechaPrimeraCuota}
              className="w-full px-4 py-2 bg-[#264653] text-white rounded-lg hover:bg-[#1d3a4a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              Calcular y Ver Vista Previa
            </button>
          </div>
          
          {/* Vista previa de cuotas */}
          <div>
            {mostrarVistaPrevia && cuotasGeneradas.length > 0 && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Resumen de Cuotas a Generar
                </h4>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total cuotas:</span>
                    <span className="font-bold">{cuotasGeneradas.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cuotas Obligatorias:</span>
                    <span className="font-bold text-blue-600">
                      {cuotasGeneradas.filter(c => c.tipo === 'Obligatoria').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cuotas de Gracia:</span>
                    <span className="font-bold text-green-600">
                      {cuotasGeneradas.filter(c => c.tipo === 'Gracias').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto Total Obligatorias:</span>
                    <span className="font-bold">${totalObligatorias.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto Total Gracias:</span>
                    <span className="font-bold">${totalGracias.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="font-semibold">Total General a Pagar:</span>
                    <span className="font-bold text-[#2A9D8F]">
                      ${(totalObligatorias + totalGracias).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
                
                {/* Tabla de cuotas vista previa */}
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className={darkMode ? 'bg-gray-600' : 'bg-gray-200'}>
                      <tr>
                        <th className="px-2 py-1 text-left">N°</th>
                        <th className="px-2 py-1 text-left">Tipo</th>
                        <th className="px-2 py-1 text-left">Desde</th>
                        <th className="px-2 py-1 text-left">Hasta</th>
                        <th className="px-2 py-1 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuotasGeneradas.map((cuota) => (
                        <tr key={cuota.numero} className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <td className="px-2 py-1">{cuota.numero}</td>
                          <td className="px-2 py-1">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              cuota.tipo === 'Obligatoria' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {cuota.tipo}
                            </span>
                          </td>
                          <td className="px-2 py-1">{cuota.fecha_desde}</td>
                          <td className="px-2 py-1">{cuota.fecha_hasta}</td>
                          <td className="px-2 py-1 text-right font-medium">
                            ${cuota.monto.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-3 pt-6 mt-4 border-t">
          <button
            onClick={() => onConfirm({
              ...config,
              totalCuotas: totalCuotasGenerar,
              cuotasObligatorias: cuotasObligatoriasIngresadas,
              cuotasGracia: cuotasGraciaContrato,
              montoObligatorio: montosCalculados.montoObligatorio,
              montoGracia: montosCalculados.montoGracia
            })}
            disabled={!mostrarVistaPrevia || cuotasGeneradas.length === 0}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={20} />
            Generar {cuotasGeneradas.length} Cuotas
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cuota;