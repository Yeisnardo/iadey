// components/CreditContracts.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  DollarSign,
  Percent,
  CreditCard,
  Receipt,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  User,
  TrendingUp,
  FileSignature,
  Calendar,
  Briefcase,
  ClipboardCheck,
  Handshake,
  Users,
  Building,
  Clock,
  AlertCircle,
  FolderPlus,
  UserCheck,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  Menu,
  Moon,
  Sun,
  ChevronDown
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const CreditContracts = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("contracts");
  
  // Estados específicos del componente de contratos
  const [contractsActiveTab, setContractsActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaInicio', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  
  // Notificaciones
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nuevo contrato de crédito pendiente de revisión", time: "5 min", read: false },
    { id: 2, text: "Pago de cuota registrado - Contrato CRE-2024-0001", time: "1 hora", read: false },
    { id: 3, text: "Contrato por vencer en 30 días", time: "3 horas", read: true },
    { id: 4, text: "Solicitud de crédito aprobada", time: "1 día", read: true },
  ]);
  
  // Constantes para los cálculos
  const FLAT_PORCENTAJE = 5; // 5% flat
  const INTERES_PORCENTAJE = 10; // 10% interés
  const CUOTAS_FIJAS = 12; // 12 cuotas fijas

  // Estados para el formulario de contrato
  const [formData, setFormData] = useState({
    codigo: "",
    emprendedor: "",
    emprendedorId: "",
    cedula: "",
    telefono: "",
    email: "",
    emprendimiento: "",
    montoDolares: "",
    montoBolivares: "",
    tasaInteres: INTERES_PORCENTAJE.toString(),
    plazo: CUOTAS_FIJAS.toString(),
    cuotaMensual: "",
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaVencimiento: "",
    estado: "Pendiente",
    tipoCredito: "Ordinario",
    destino: "",
    garantias: "",
    observaciones: "",
    cuotasPagadas: 0,
    totalCuotas: CUOTAS_FIJAS,
    saldoPendiente: "",
    historialPagos: []
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    estado: "",
    tipoCredito: "",
    fechaDesde: "",
    fechaHasta: "",
    montoMin: "",
    montoMax: ""
  });

  // Datos del usuario
  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Gestión de Créditos",
    joinDate: "Enero 2024",
    pendingTasks: 8,
    completedTasks: 45,
    performance: "98%"
  };

  // Datos de ejemplo para contratos de crédito
  const [contracts, setContracts] = useState([
    {
      id: 1,
      codigo: "CRE-2024-0001",
      emprendedor: "María González Pérez",
      cedula: "V-12345678",
      telefono: "0412-1234567",
      email: "maria@email.com",
      emprendimiento: "Restaurante El Sazón",
      montoDolares: 25000,
      montoBolivares: 950000,
      tasaInteres: 10,
      plazo: 12,
      cuotaMensual: 2291.67,
      fechaInicio: "2024-01-15",
      fechaVencimiento: "2025-01-15",
      estado: "Activo",
      tipoCredito: "Ordinario",
      cuotasPagadas: 3,
      totalCuotas: 12,
      saldoPendiente: 25000,
      destino: "Compra de equipos de cocina y remodelación del local",
      garantias: "Equipos adquiridos como garantía",
      observaciones: "Cliente con buen historial crediticio",
      historialPagos: [
        { fecha: "2024-02-15", monto: 2291.67, estado: "Pagado", referencia: "PAG-001" },
        { fecha: "2024-03-15", monto: 2291.67, estado: "Pagado", referencia: "PAG-002" },
        { fecha: "2024-04-15", monto: 2291.67, estado: "Pagado", referencia: "PAG-003" }
      ]
    },
    {
      id: 2,
      codigo: "CRE-2024-0002",
      emprendedor: "Juan Pérez Rodríguez",
      cedula: "V-87654321",
      telefono: "0416-7654321",
      email: "juan@email.com",
      emprendimiento: "Taller Mecánico Rápido",
      montoDolares: 15000,
      montoBolivares: 570000,
      tasaInteres: 10,
      plazo: 12,
      cuotaMensual: 1375,
      fechaInicio: "2024-02-01",
      fechaVencimiento: "2025-02-01",
      estado: "Activo",
      tipoCredito: "Microcrédito",
      cuotasPagadas: 2,
      totalCuotas: 12,
      saldoPendiente: 15000,
      destino: "Compra de herramientas y equipos de diagnóstico",
      garantias: "Maquinaria y herramientas",
      observaciones: "",
      historialPagos: [
        { fecha: "2024-03-01", monto: 1375, estado: "Pagado", referencia: "PAG-004" },
        { fecha: "2024-04-01", monto: 1375, estado: "Pagado", referencia: "PAG-005" }
      ]
    },
    {
      id: 3,
      codigo: "CRE-2024-0003",
      emprendedor: "Carlos Rodríguez Silva",
      cedula: "V-11223344",
      telefono: "0424-1122334",
      email: "carlos@email.com",
      emprendimiento: "Tienda de Ropa Moda",
      montoDolares: 50000,
      montoBolivares: 1900000,
      tasaInteres: 10,
      plazo: 12,
      cuotaMensual: 4583.33,
      fechaInicio: "2024-01-10",
      fechaVencimiento: "2025-01-10",
      estado: "Pendiente",
      tipoCredito: "Expansión",
      cuotasPagadas: 0,
      totalCuotas: 12,
      saldoPendiente: 50000,
      destino: "Ampliación del local y compra de inventario",
      garantias: "Local comercial",
      observaciones: "En espera de evaluación de garantías",
      historialPagos: []
    },
    {
      id: 4,
      codigo: "CRE-2023-0012",
      emprendedor: "Ana Martínez López",
      cedula: "V-55667788",
      telefono: "0412-5566778",
      email: "ana@email.com",
      emprendimiento: "Distribuidora de Alimentos",
      montoDolares: 80000,
      montoBolivares: 3040000,
      tasaInteres: 10,
      plazo: 12,
      cuotaMensual: 7333.33,
      fechaInicio: "2023-06-01",
      fechaVencimiento: "2024-06-01",
      estado: "Activo",
      tipoCredito: "Ordinario",
      cuotasPagadas: 10,
      totalCuotas: 12,
      saldoPendiente: 80000,
      destino: "Compra de vehículo de distribución",
      garantias: "Vehículo",
      observaciones: "Pagos al día",
      historialPagos: [
        { fecha: "2023-07-01", monto: 7333.33, estado: "Pagado", referencia: "PAG-010" },
        { fecha: "2023-08-01", monto: 7333.33, estado: "Pagado", referencia: "PAG-011" }
      ]
    },
    {
      id: 5,
      codigo: "CRE-2023-0015",
      emprendedor: "Luis Torres Méndez",
      cedula: "V-99887766",
      telefono: "0416-9988776",
      email: "luis@email.com",
      emprendimiento: "Servicios de Tecnología",
      montoDolares: 35000,
      montoBolivares: 1330000,
      tasaInteres: 10,
      plazo: 12,
      cuotaMensual: 3208.33,
      fechaInicio: "2023-12-01",
      fechaVencimiento: "2024-12-01",
      estado: "Vencido",
      tipoCredito: "Ordinario",
      cuotasPagadas: 4,
      totalCuotas: 12,
      saldoPendiente: 35000,
      destino: "Compra de servidores y equipos de red",
      garantias: "Equipos tecnológicos",
      observaciones: "Cliente con retraso en pagos",
      historialPagos: [
        { fecha: "2024-01-01", monto: 3208.33, estado: "Pagado", referencia: "PAG-015" },
        { fecha: "2024-02-01", monto: 3208.33, estado: "Pagado", referencia: "PAG-016" }
      ]
    },
    {
      id: 6,
      codigo: "CRE-2024-0004",
      emprendedor: "Elena Sánchez Díaz",
      cedula: "V-44332211",
      telefono: "0412-4433221",
      email: "elena@email.com",
      emprendimiento: "Panadería La Espiga",
      montoDolares: 10000,
      montoBolivares: 380000,
      tasaInteres: 10,
      plazo: 12,
      cuotaMensual: 916.67,
      fechaInicio: "2024-03-01",
      fechaVencimiento: "2025-03-01",
      estado: "Aprobado",
      tipoCredito: "Microcrédito",
      cuotasPagadas: 0,
      totalCuotas: 12,
      saldoPendiente: 10000,
      destino: "Compra de horno industrial",
      garantias: "Equipo adquirido",
      observaciones: "Documentación en regla",
      historialPagos: []
    }
  ]);

  // Lista de emprendedores (para el formulario)
  const emprendedores = [
    { id: 1, nombre: "María González Pérez", cedula: "V-12345678", telefono: "0412-1234567", email: "maria@email.com", emprendimiento: "Restaurante El Sazón" },
    { id: 2, nombre: "Juan Pérez Rodríguez", cedula: "V-87654321", telefono: "0416-7654321", email: "juan@email.com", emprendimiento: "Taller Mecánico Rápido" },
    { id: 3, nombre: "Carlos Rodríguez Silva", cedula: "V-11223344", telefono: "0424-1122334", email: "carlos@email.com", emprendimiento: "Tienda de Ropa Moda" },
    { id: 4, nombre: "Ana Martínez López", cedula: "V-55667788", telefono: "0412-5566778", email: "ana@email.com", emprendimiento: "Distribuidora de Alimentos" },
    { id: 5, nombre: "Luis Torres Méndez", cedula: "V-99887766", telefono: "0416-9988776", email: "luis@email.com", emprendimiento: "Servicios de Tecnología" },
    { id: 6, nombre: "Elena Sánchez Díaz", cedula: "V-44332211", telefono: "0412-4433221", email: "elena@email.com", emprendimiento: "Panadería La Espiga" }
  ];

  // Tipos de crédito
  const tiposCredito = [
    "Ordinario",
    "Microcrédito",
    "Expansión",
    "Maquinaria y Equipo",
    "Capital de Trabajo",
    "Emergencia"
  ];

  // Estados del contrato
  const estados = [
    "Pendiente",
    "Aprobado",
    "Activo",
    "Vencido",
    "Pagado",
    "Cancelado",
    "Rechazado"
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Función para calcular el monto en bolívares basado en el monto en dólares
  const calcularMontoBolivares = (montoDolares) => {
    if (!montoDolares || montoDolares <= 0) return 0;
    const tasaCambio = 40;
    const montoBs = montoDolares * tasaCambio;
    const montoConFlat = montoBs * (1 - FLAT_PORCENTAJE / 100);
    return Math.round(montoConFlat * 100) / 100;
  };

  // Función para calcular la cuota mensual
  const calcularCuotaMensual = (montoDolares) => {
    if (!montoDolares || montoDolares <= 0) return 0;
    const montoConInteres = montoDolares * (1 + INTERES_PORCENTAJE / 100);
    const cuota = montoConInteres / CUOTAS_FIJAS;
    return Math.round(cuota * 100) / 100;
  };

  // Generar código de contrato
  const generarCodigoContrato = () => {
    const año = new Date().getFullYear();
    const contratosAño = contracts.filter(c => c.codigo.includes(año.toString()));
    const nuevoNumero = contratosAño.length + 1;
    return `CRE-${año}-${String(nuevoNumero).padStart(4, '0')}`;
  };

  // Actualizar cálculos cuando cambia el monto en dólares
  useEffect(() => {
    if (formData.montoDolares && parseFloat(formData.montoDolares) > 0) {
      const montoDolaresNum = parseFloat(formData.montoDolares);
      const montoBolivares = calcularMontoBolivares(montoDolaresNum);
      const cuotaMensual = calcularCuotaMensual(montoDolaresNum);
      const saldoPendiente = montoDolaresNum;
      
      setFormData(prev => ({
        ...prev,
        montoBolivares: montoBolivares.toFixed(2),
        cuotaMensual: cuotaMensual.toFixed(2),
        saldoPendiente: saldoPendiente.toFixed(2),
        totalCuotas: CUOTAS_FIJAS,
        plazo: CUOTAS_FIJAS.toString()
      }));
    }
  }, [formData.montoDolares]);

  // Actualizar fecha de vencimiento cuando cambia la fecha de inicio
  useEffect(() => {
    if (formData.fechaInicio) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaVenc = new Date(fechaInicio);
      fechaVenc.setMonth(fechaVenc.getMonth() + CUOTAS_FIJAS);
      setFormData(prev => ({
        ...prev,
        fechaVencimiento: fechaVenc.toISOString().split('T')[0]
      }));
    }
  }, [formData.fechaInicio]);

  // Abrir modal para nuevo contrato
  const handleNewContract = () => {
    setSelectedContract(null);
    setFormData({
      codigo: generarCodigoContrato(),
      emprendedor: "",
      emprendedorId: "",
      cedula: "",
      telefono: "",
      email: "",
      emprendimiento: "",
      montoDolares: "",
      montoBolivares: "",
      tasaInteres: INTERES_PORCENTAJE.toString(),
      plazo: CUOTAS_FIJAS.toString(),
      cuotaMensual: "",
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaVencimiento: "",
      estado: "Pendiente",
      tipoCredito: "Ordinario",
      destino: "",
      garantias: "",
      observaciones: "",
      cuotasPagadas: 0,
      totalCuotas: CUOTAS_FIJAS,
      saldoPendiente: "",
      historialPagos: []
    });
    setShowContractModal(true);
  };

  // Editar contrato
  const handleEditContract = (contract) => {
    setSelectedContract(contract);
    setFormData({
      ...contract,
      montoDolares: contract.montoDolares.toString(),
      montoBolivares: contract.montoBolivares.toString(),
      tasaInteres: contract.tasaInteres.toString(),
      plazo: contract.plazo.toString(),
      cuotaMensual: contract.cuotaMensual.toString()
    });
    setShowContractModal(true);
  };

  // Guardar contrato
  const handleSaveContract = () => {
    const montoDolaresNum = parseFloat(formData.montoDolares);
    const montoBolivaresNum = parseFloat(formData.montoBolivares);
    const cuotaNum = parseFloat(formData.cuotaMensual);
    
    if (!formData.emprendedor || !formData.montoDolares) {
      alert("Por favor, complete los campos requeridos (Emprendedor y Monto en Dólares)");
      return;
    }
    
    if (montoDolaresNum <= 0) {
      alert("El monto en dólares debe ser mayor a 0");
      return;
    }
    
    if (selectedContract) {
      const updatedContracts = contracts.map(c => 
        c.id === selectedContract.id 
          ? { 
              ...c, 
              ...formData, 
              montoDolares: montoDolaresNum, 
              montoBolivares: montoBolivaresNum,
              cuotaMensual: cuotaNum,
              totalCuotas: CUOTAS_FIJAS,
              plazo: CUOTAS_FIJAS
            }
          : c
      );
      setContracts(updatedContracts);
      const nuevaNotificacion = {
        id: notifications.length + 1,
        text: `Contrato ${selectedContract.codigo} actualizado`,
        time: "Ahora",
        read: false
      };
      setNotifications([nuevaNotificacion, ...notifications]);
    } else {
      const newContract = {
        id: contracts.length + 1,
        ...formData,
        montoDolares: montoDolaresNum,
        montoBolivares: montoBolivaresNum,
        cuotaMensual: cuotaNum,
        totalCuotas: CUOTAS_FIJAS,
        plazo: CUOTAS_FIJAS,
        historialPagos: []
      };
      setContracts([newContract, ...contracts]);
      const nuevaNotificacion = {
        id: notifications.length + 1,
        text: `Nuevo contrato creado: ${newContract.codigo} - ${newContract.emprendedor}`,
        time: "Ahora",
        read: false
      };
      setNotifications([nuevaNotificacion, ...notifications]);
    }
    
    setShowContractModal(false);
    alert(selectedContract ? "Contrato actualizado exitosamente" : "Contrato creado exitosamente");
  };

  // Eliminar contrato
  const handleDeleteContract = (id) => {
    setContractToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setContracts(contracts.filter(c => c.id !== contractToDelete));
    setShowDeleteConfirm(false);
    setContractToDelete(null);
    alert("Contrato eliminado exitosamente");
  };

  // Ver detalles del contrato
  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setShowDetailModal(true);
  };

  // Registrar pago
  const handleRegisterPayment = (contract) => {
    setSelectedContract(contract);
    setSelectedPayment({
      monto: contract.cuotaMensual,
      fecha: new Date().toISOString().split('T')[0],
      referencia: "",
      observaciones: ""
    });
    setShowPaymentModal(true);
  };

  const savePayment = () => {
    if (!selectedPayment.referencia) {
      alert("Por favor, ingrese el número de referencia del pago");
      return;
    }
    
    const nuevoPago = {
      fecha: selectedPayment.fecha,
      monto: parseFloat(selectedPayment.monto),
      estado: "Pagado",
      referencia: selectedPayment.referencia,
      observaciones: selectedPayment.observaciones
    };
    
    const updatedContracts = contracts.map(c => {
      if (c.id === selectedContract.id) {
        const nuevasCuotasPagadas = c.cuotasPagadas + 1;
        const nuevoEstado = nuevasCuotasPagadas === c.totalCuotas ? "Pagado" : c.estado;
        return {
          ...c,
          cuotasPagadas: nuevasCuotasPagadas,
          historialPagos: [nuevoPago, ...c.historialPagos],
          estado: nuevoEstado
        };
      }
      return c;
    });
    
    setContracts(updatedContracts);
    setShowPaymentModal(false);
    
    const nuevaNotificacion = {
      id: notifications.length + 1,
      text: `Pago registrado para contrato ${selectedContract.codigo} - Monto: ${formatCurrency(nuevoPago.monto)}`,
      time: "Ahora",
      read: false
    };
    setNotifications([nuevaNotificacion, ...notifications]);
    
    alert("Pago registrado exitosamente");
  };

  // Descargar contrato (PDF simulado)
  const handleDownloadContract = (contract) => {
    alert(`Descargando contrato ${contract.codigo}...`);
  };

  // Imprimir contrato
  const handlePrintContract = (contract) => {
    window.print();
  };

  // Filtrar contratos
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === "" ||
      contract.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.emprendedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.cedula.includes(searchTerm) ||
      contract.emprendimiento.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (contractsActiveTab === "active") matchesTab = contract.estado === "Activo";
    if (contractsActiveTab === "pending") matchesTab = contract.estado === "Pendiente" || contract.estado === "Aprobado";
    if (contractsActiveTab === "expired") matchesTab = contract.estado === "Vencido";
    
    const matchesEstado = !filters.estado || contract.estado === filters.estado;
    const matchesTipo = !filters.tipoCredito || contract.tipoCredito === filters.tipoCredito;
    const matchesFechaDesde = !filters.fechaDesde || contract.fechaInicio >= filters.fechaDesde;
    const matchesFechaHasta = !filters.fechaHasta || contract.fechaInicio <= filters.fechaHasta;
    const matchesMontoMin = !filters.montoMin || contract.montoDolares >= parseFloat(filters.montoMin);
    const matchesMontoMax = !filters.montoMax || contract.montoDolares <= parseFloat(filters.montoMax);
    
    return matchesSearch && matchesTab && matchesEstado && matchesTipo && 
           matchesFechaDesde && matchesFechaHasta && matchesMontoMin && matchesMontoMax;
  });

  // Ordenar contratos
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedContracts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedContracts = sortedContracts.slice(startIndex, startIndex + rowsPerPage);

  // Estadísticas
  const stats = {
    total: contracts.length,
    activos: contracts.filter(c => c.estado === "Activo").length,
    pendientes: contracts.filter(c => c.estado === "Pendiente" || c.estado === "Aprobado").length,
    vencidos: contracts.filter(c => c.estado === "Vencido").length,
    montoTotalDolares: contracts.reduce((sum, c) => sum + c.montoDolares, 0),
    montoTotalBolivares: contracts.reduce((sum, c) => sum + c.montoBolivares, 0),
    tasaPromedio: INTERES_PORCENTAJE
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Activo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Aprobado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Vencido': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Pagado': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Cancelado': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const resetFilters = () => {
    setFilters({
      estado: "",
      tipoCredito: "",
      fechaDesde: "",
      fechaHasta: "",
      montoMin: "",
      montoMax: ""
    });
    setSearchTerm("");
    setContractsActiveTab("all");
    setCurrentPage(1);
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatCurrencyBs = (amount) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
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
            <div className="space-y-6">
              {/* Encabezado */}
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Contratos de Crédito
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gestión de contratos de crédito para emprendedores
                </p>
              </div>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="text-blue-500" size={24} />
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {stats.total}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Contratos</p>
                </div>
                
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="text-green-500" size={24} />
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {stats.activos}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Contratos Activos</p>
                </div>
                
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="text-yellow-500" size={24} />
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formatCurrency(stats.montoTotalDolares)}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monto Total Otorgado (USD)</p>
                </div>
                
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <Percent className="text-purple-500" size={24} />
                    <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {stats.tasaPromedio}%
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tasa de Interés Anual</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4">
                  <button
                    onClick={() => { setContractsActiveTab("all"); setCurrentPage(1); }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      contractsActiveTab === "all"
                        ? `border-b-2 border-[#2A9D8F] text-[#2A9D8F]`
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Todos ({stats.total})
                  </button>
                  <button
                    onClick={() => { setContractsActiveTab("active"); setCurrentPage(1); }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      contractsActiveTab === "active"
                        ? `border-b-2 border-[#2A9D8F] text-[#2A9D8F]`
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Activos ({stats.activos})
                  </button>
                  <button
                    onClick={() => { setContractsActiveTab("pending"); setCurrentPage(1); }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      contractsActiveTab === "pending"
                        ? `border-b-2 border-[#2A9D8F] text-[#2A9D8F]`
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pendientes ({stats.pendientes})
                  </button>
                  <button
                    onClick={() => { setContractsActiveTab("expired"); setCurrentPage(1); }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      contractsActiveTab === "expired"
                        ? `border-b-2 border-[#2A9D8F] text-[#2A9D8F]`
                        : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Vencidos ({stats.vencidos})
                  </button>
                </nav>
              </div>

              {/* Barra de búsqueda y acciones */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por código, emprendedor, cédula..."
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
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                      darkMode 
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Filter size={20} />
                    Filtros
                  </button>
                  <button
                    onClick={handleNewContract}
                    className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Nuevo Contrato
                  </button>
                </div>
              </div>

              {/* Panel de filtros */}
              {showFilters && (
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <select
                      value={filters.estado}
                      onChange={(e) => setFilters({...filters, estado: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="">Todos los estados</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>

                    <select
                      value={filters.tipoCredito}
                      onChange={(e) => setFilters({...filters, tipoCredito: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="">Todos los tipos</option>
                      {tiposCredito.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={filters.fechaDesde}
                      onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                      placeholder="Fecha desde"
                    />

                    <input
                      type="date"
                      value={filters.fechaHasta}
                      onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                      placeholder="Fecha hasta"
                    />

                    <input
                      type="number"
                      value={filters.montoMin}
                      onChange={(e) => setFilters({...filters, montoMin: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                      placeholder="Monto mínimo (USD)"
                    />

                    <input
                      type="number"
                      value={filters.montoMax}
                      onChange={(e) => setFilters({...filters, montoMax: e.target.value})}
                      className={`px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                      placeholder="Monto máximo (USD)"
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-[#2A9D8F] hover:text-[#264653]"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {/* Tabla de contratos */}
              <div className={`rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              } overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('codigo')}>
                          <div className="flex items-center gap-2">
                            Código
                            <ArrowUpDown size={14} />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emprendedor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('montoDolares')}>
                          <div className="flex items-center gap-2">
                            Monto (USD)
                            <ArrowUpDown size={14} />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto (Bs)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('cuotaMensual')}>
                          <div className="flex items-center gap-2">
                            Cuota
                            <ArrowUpDown size={14} />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('cuotasPagadas')}>
                          <div className="flex items-center gap-2">
                            Progreso
                            <ArrowUpDown size={14} />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {paginatedContracts.map((contract) => {
                        const progreso = (contract.cuotasPagadas / contract.totalCuotas) * 100;
                        return (
                          <tr key={contract.id} className={`${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          } transition-colors`}>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {contract.codigo}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {contract.emprendedor}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {contract.emprendimiento}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(contract.montoDolares)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrencyBs(contract.montoBolivares)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrency(contract.cuotaMensual)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-[#2A9D8F] h-2 rounded-full"
                                      style={{ width: `${progreso}%` }}
                                    />
                                  </div>
                                </div>
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {contract.cuotasPagadas}/{contract.totalCuotas}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(contract.estado)}`}>
                                {contract.estado}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(contract)}
                                  className={`p-1 rounded-lg ${
                                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                  } transition-colors`}
                                  title="Ver detalles"
                                >
                                  <Eye size={18} className="text-[#2A9D8F]" />
                                </button>
                                <button
                                  onClick={() => handleEditContract(contract)}
                                  className={`p-1 rounded-lg ${
                                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                  } transition-colors`}
                                  title="Editar"
                                >
                                  <Edit size={18} className="text-blue-500" />
                                </button>
                                {contract.estado === "Activo" && (
                                  <button
                                    onClick={() => handleRegisterPayment(contract)}
                                    className={`p-1 rounded-lg ${
                                      darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                    } transition-colors`}
                                    title="Registrar pago"
                                  >
                                    <CreditCard size={18} className="text-green-500" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownloadContract(contract)}
                                  className={`p-1 rounded-lg ${
                                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                  } transition-colors`}
                                  title="Descargar"
                                >
                                  <Download size={18} className="text-purple-500" />
                                </button>
                                <button
                                  onClick={() => handleDeleteContract(contract.id)}
                                  className={`p-1 rounded-lg ${
                                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                  } transition-colors`}
                                  title="Eliminar"
                                >
                                  <Trash2 size={18} className="text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {sortedContracts.length > 0 && (
                  <div className={`px-4 py-3 flex items-center justify-between border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        Mostrar
                      </span>
                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className={`px-2 py-1 rounded border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        }`}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        registros
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedContracts.length)} de {sortedContracts.length}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className={`p-1 rounded ${
                            currentPage === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronsLeft size={18} />
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`p-1 rounded ${
                            currentPage === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        
                        <span className={`px-3 py-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Página {currentPage} de {totalPages}
                        </span>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className={`p-1 rounded ${
                            currentPage === totalPages
                              ? 'text-gray-400 cursor-not-allowed'
                              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`p-1 rounded ${
                            currentPage === totalPages
                              ? 'text-gray-400 cursor-not-allowed'
                              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronsRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* Modal para crear/editar contrato - Continuación del código */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <FileSignature size={28} className="text-[#2A9D8F]" />
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {selectedContract ? 'Editar Contrato' : 'Nuevo Contrato de Crédito'}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Complete la información del contrato de crédito
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={24} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Información del contrato */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <FileText size={20} className="text-[#2A9D8F]" />
                    Información General
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Código de Contrato *
                      </label>
                      <input
                        type="text"
                        value={formData.codigo}
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-100 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                        }`}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Fecha de Inicio *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          value={formData.fechaInicio}
                          onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Estado *
                      </label>
                      <select
                        value={formData.estado}
                        onChange={(e) => setFormData({...formData, estado: e.target.value})}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        }`}
                      >
                        {estados.map(estado => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Datos del emprendedor */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <User size={20} className="text-[#2A9D8F]" />
                    Datos del Emprendedor *
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Emprendedor
                      </label>
                      <select
                        value={formData.emprendedorId}
                        onChange={(e) => {
                          const emp = emprendedores.find(emp => emp.id === parseInt(e.target.value));
                          if (emp) {
                            setFormData({
                              ...formData,
                              emprendedorId: emp.id,
                              emprendedor: emp.nombre,
                              cedula: emp.cedula,
                              telefono: emp.telefono,
                              email: emp.email,
                              emprendimiento: emp.emprendimiento
                            });
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        }`}
                      >
                        <option value="">Seleccione un emprendedor</option>
                        {emprendedores.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.nombre} - {emp.cedula}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cédula
                      </label>
                      <input
                        type="text"
                        value={formData.cedula}
                        readOnly
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-100 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={formData.telefono}
                        readOnly
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-100 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-100 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Emprendimiento
                      </label>
                      <input
                        type="text"
                        value={formData.emprendimiento}
                        readOnly
                        className={`w-full px-3 py-2 rounded-lg border bg-gray-100 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Datos del crédito */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <DollarSign size={20} className="text-[#2A9D8F]" />
                    Datos del Crédito
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Condiciones del crédito:</strong> Flat del {FLAT_PORCENTAJE}% (se resta al monto en bolívares), 
                      Interés del {INTERES_PORCENTAJE}% sobre el monto en dólares, {CUOTAS_FIJAS} cuotas fijas.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Monto del Crédito (USD) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="number"
                          value={formData.montoDolares}
                          onChange={(e) => setFormData({...formData, montoDolares: e.target.value})}
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                          }`}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Monto que recibe el emprendedor en USD
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Monto en Bolívares (Bs)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">Bs</span>
                        <input
                          type="text"
                          value={formData.montoBolivares}
                          readOnly
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-100 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Monto en Bs después de aplicar el flat del {FLAT_PORCENTAJE}%
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tasa de Interés
                      </label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={`${INTERES_PORCENTAJE}%`}
                          readOnly
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-100 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Plazo
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={`${CUOTAS_FIJAS} meses`}
                          readOnly
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-100 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cuota Mensual (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={formData.cuotaMensual}
                          readOnly
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-100 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        (Monto USD + {INTERES_PORCENTAJE}% interés) / {CUOTAS_FIJAS} cuotas
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tipo de Crédito *
                      </label>
                      <select
                        value={formData.tipoCredito}
                        onChange={(e) => setFormData({...formData, tipoCredito: e.target.value})}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        }`}
                      >
                        {tiposCredito.map(tipo => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Fecha de Vencimiento
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          value={formData.fechaVencimiento}
                          readOnly
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-gray-100 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Info size={20} className="text-[#2A9D8F]" />
                    Información Adicional
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Destino del Crédito
                      </label>
                      <textarea
                        value={formData.destino}
                        onChange={(e) => setFormData({...formData, destino: e.target.value})}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        }`}
                        placeholder="Describa el destino del crédito..."
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Garantías
                      </label>
                      <textarea
                        value={formData.garantias}
                        onChange={(e) => setFormData({...formData, garantias: e.target.value})}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        }`}
                        placeholder="Describa las garantías ofrecidas..."
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Observaciones
                      </label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                        }`}
                        placeholder="Observaciones adicionales..."
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className={`sticky bottom-0 flex justify-end gap-3 p-6 border-t ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <button
                onClick={() => setShowContractModal(false)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveContract}
                className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Save size={18} />
                {selectedContract ? 'Actualizar' : 'Guardar'} Contrato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del contrato */}
      {showDetailModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 flex justify-between items-center p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <FileSignature size={28} className="text-[#2A9D8F]" />
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Detalles del Contrato
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedContract.codigo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={24} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>

            <div className="p-6">
              {/* Información del contrato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <FileText size={18} />
                    Información General
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Código:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContract.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Fecha Inicio:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.fechaInicio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Fecha Vencimiento:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.fechaVencimiento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Estado:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedContract.estado)}`}>
                        {selectedContract.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <User size={18} />
                    Datos del Emprendedor
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Nombre:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.emprendedor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Cédula:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.cedula}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Emprendimiento:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.emprendimiento}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <DollarSign size={18} />
                    Datos del Crédito
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Monto (USD):</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formatCurrency(selectedContract.montoDolares)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Monto (Bs):</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{formatCurrencyBs(selectedContract.montoBolivares)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Tasa Interés:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.tasaInteres}% anual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Plazo:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.plazo} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Cuota Mensual:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{formatCurrency(selectedContract.cuotaMensual)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Tipo Crédito:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.tipoCredito}</span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <TrendingUp size={18} />
                    Estado de Pagos
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Cuotas Pagadas:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.cuotasPagadas} / {selectedContract.totalCuotas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Saldo Pendiente:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formatCurrency(selectedContract.saldoPendiente)}</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#2A9D8F] h-2 rounded-full"
                          style={{ width: `${(selectedContract.cuotasPagadas / selectedContract.totalCuotas) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial de pagos */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Receipt size={20} className="text-[#2A9D8F]" />
                  Historial de Pagos
                </h3>
                {selectedContract.historialPagos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Monto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Referencia</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Estado</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {selectedContract.historialPagos.map((pago, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{pago.fecha}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(pago.monto)}</td>
                            <td className="px-4 py-2 text-sm">{pago.referencia}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {pago.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay pagos registrados para este contrato
                  </p>
                )}
              </div>

              {/* Información adicional */}
              {(selectedContract.destino || selectedContract.garantias || selectedContract.observaciones) && (
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Info size={20} className="text-[#2A9D8F]" />
                    Información Adicional
                  </h3>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {selectedContract.destino && (
                      <div className="mb-3">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Destino del Crédito:</span>
                        <p className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.destino}</p>
                      </div>
                    )}
                    {selectedContract.garantias && (
                      <div className="mb-3">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Garantías:</span>
                        <p className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.garantias}</p>
                      </div>
                    )}
                    {selectedContract.observaciones && (
                      <div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Observaciones:</span>
                        <p className={darkMode ? 'text-white' : 'text-gray-800'}>{selectedContract.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleDownloadContract(selectedContract)}
                  className="px-4 py-2 border border-[#2A9D8F] text-[#2A9D8F] rounded-lg hover:bg-[#2A9D8F] hover:text-white transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Descargar Contrato
                </button>
                <button
                  onClick={() => handlePrintContract(selectedContract)}
                  className="px-4 py-2 border border-[#2A9D8F] text-[#2A9D8F] rounded-lg hover:bg-[#2A9D8F] hover:text-white transition-colors flex items-center gap-2"
                >
                  <Printer size={18} />
                  Imprimir
                </button>
                {selectedContract.estado === "Activo" && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleRegisterPayment(selectedContract);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <CreditCard size={18} />
                    Registrar Pago
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para registrar pago */}
      {showPaymentModal && selectedContract && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Registrar Pago
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Contrato: {selectedContract.codigo} - {selectedContract.emprendedor}
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Monto a Pagar (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={selectedPayment.monto}
                      onChange={(e) => setSelectedPayment({...selectedPayment, monto: e.target.value})}
                      className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                      step="0.01"
                    />
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Cuota mensual: {formatCurrency(selectedContract.cuotaMensual)}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de Pago
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      value={selectedPayment.fecha}
                      onChange={(e) => setSelectedPayment({...selectedPayment, fecha: e.target.value})}
                      className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de Referencia *
                  </label>
                  <input
                    type="text"
                    value={selectedPayment.referencia}
                    onChange={(e) => setSelectedPayment({...selectedPayment, referencia: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    }`}
                    placeholder="Ingrese el número de referencia"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Observaciones
                  </label>
                  <textarea
                    value={selectedPayment.observaciones}
                    onChange={(e) => setSelectedPayment({...selectedPayment, observaciones: e.target.value})}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                    }`}
                    placeholder="Observaciones del pago..."
                  />
                </div>
              </div>
            </div>
            <div className={`p-6 border-t flex justify-end gap-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={savePayment}
                className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Check size={18} />
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={28} />
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Confirmar Eliminación
                </h2>
              </div>
            </div>
            <div className="p-6">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                ¿Está seguro de que desea eliminar este contrato? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className={`p-6 border-t flex justify-end gap-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditContracts;