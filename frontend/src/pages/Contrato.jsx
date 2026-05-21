// pages/Contrato.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  FileSignature,
  Clock,
  TrendingUp,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
  CheckCircle,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
  Loader2,
  User,
  Hourglass,
  Ban
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

// Importamos la API
import ContratoAPI from "../services/api_contrato";

const Contrato = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("contracts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [showDesembolsoModal, setShowDesembolsoModal] = useState(false);
  const [selectedContractForDesembolso, setSelectedContractForDesembolso] = useState(null);

  // Estados para el modal de desembolso
  const [formDesembolso, setFormDesembolso] = useState({
    referencia_bancaria: "",
  monto_pagado: "",
  fecha_desembolso: new Date().toISOString().split('T')[0],
  });
  const [desembolsoErrors, setDesembolsoErrors] = useState({});
  const [desembolsoSubmitting, setDesembolsoSubmitting] = useState(false);

  // Estados para el modal de gestión de contrato
  const [showGestionModal, setShowGestionModal] = useState(false);
  const [selectedContractForGestion, setSelectedContractForGestion] = useState(null);
  const [lastContractNumber, setLastContractNumber] = useState(0);
  const [formGestion, setFormGestion] = useState({
    numero_contrato: "",
    moneda: "Bolívares",
    monto_moneda: "",
    cambio: "",
    flat: "",
    interes: "",
    devolvimiento: "",
    numero_cuotas: "",
    inicio: "",
    cierre: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estados para los datos de la API
  const [contractsData, setContractsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definir el flujo de estados: Pendiente -> Pendiente por Desembolso -> Activo
  const STATUS_FLOW = {
    'Esperando contrato': {
      next: 'Pendiente',
      color: 'gray',
      icon: Hourglass,
      bgColor: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-500',
      label: 'Esperando contrato'
    },
    'Pendiente': {
      next: 'Pendiente por desembolso',
      color: 'yellow',
      icon: Clock,
      bgColor: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      label: 'Pendiente'
    },
    'Pendiente por desembolso': {
      next: 'Activo',
      color: 'orange',
      icon: DollarSign,
      bgColor: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      label: 'Pendiente por desembolso'
    },
    'Activo': {
      next: 'Finalizado',
      color: 'green',
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      label: 'Activo'
    },
    'Finalizado': {
      next: 'Cancelado',
      color: 'blue',
      icon: CheckCircle,
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      label: 'Finalizado'
    },
    'Cancelado': {
      next: 'Esperando contrato',
      color: 'red',
      icon: Ban,
      bgColor: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      label: 'Cancelado'
    }
  };

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

  // Cargar datos de la API y establecer valores por defecto
  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ContratoAPI.getAll();
        
        if (response.success) {
          // Mapear los datos agregando campos por defecto
          const dataConDefaults = response.data.map(item => ({
            ...item,
            numero_cuotas: item.numero_cuotas || "Sin definir",
            inicio: item.inicio || "Sin definir",
            cierre: item.cierre || "Sin definir",
            estatus: item.estatus || "Esperando contrato",
            emprendedor: item.emprendedor || "Sin definir",
            numero_contrato: item.numero_contrato || ""
          }));
          setContractsData(dataConDefaults);
        } else {
          setError(response.error || "Error al cargar los contratos");
        }
      } catch (err) {
        console.error("Error cargando contratos:", err);
        setError(err.error || "Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchContratos();
  }, []);

  // Cargar el último número de contrato
  useEffect(() => {
    const fetchLastContract = async () => {
      try {
        const response = await ContratoAPI.getLastContractNumber();
        if (response.success && response.data) {
          const lastNumber = response.data.numero_contrato;
          if (lastNumber) {
            const parts = lastNumber.split('-');
            if (parts.length === 3) {
              setLastContractNumber(parseInt(parts[2]) || 0);
            }
          }
        }
      } catch (error) {
        console.log("Usando número de contrato local");
        const contractsWithNumbers = contractsData.filter(c => 
          c.numero_contrato && c.numero_contrato.startsWith('IADEY-')
        );
        if (contractsWithNumbers.length > 0) {
          const numbers = contractsWithNumbers.map(c => {
            const parts = c.numero_contrato.split('-');
            return parseInt(parts[2]) || 0;
          });
          setLastContractNumber(Math.max(...numbers));
        }
      }
    };

    if (contractsData.length > 0) {
      fetchLastContract();
    }
  }, [contractsData]);

  // Contadores para estadísticas
  const contratosActivos = contractsData.filter(c => c.estatus === "Activo").length;
  const contratosPendientes = contractsData.filter(c => c.estatus === "Pendiente").length;
  const contratosPendientesDesembolso = contractsData.filter(c => c.estatus === "Pendiente por desembolso").length;
  const contratosEsperando = contractsData.filter(c => c.estatus === "Esperando contrato").length;

  // Datos específicos por sección
  const sectionData = {
    contracts: {
      title: "Gestión de Contratos",
      description: "Administración de contratos con manejo interno",
      stats: [
        { id: 1, title: "Contratos Activos", value: contratosActivos, icon: CheckCircle, color: "green", bgColor: "bg-green-50", textColor: "text-green-600" },
        { id: 2, title: "Pendientes", value: contratosPendientes, icon: Clock, color: "yellow", bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
        { id: 3, title: "Pend. Desembolso", value: contratosPendientesDesembolso, icon: DollarSign, color: "orange", bgColor: "bg-orange-50", textColor: "text-orange-600" },
        { id: 4, title: "Esperando Contrato", value: contratosEsperando, icon: Hourglass, color: "gray", bgColor: "bg-gray-50", textColor: "text-gray-600" },
      ]
    }
  };

  const currentData = sectionData.contracts;

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Función para avanzar al siguiente estado (Pendiente -> Pendiente por desembolso)
  const avanzarEstado = async (id, currentStatus) => {
    const statusInfo = STATUS_FLOW[currentStatus];
    if (!statusInfo) return;
    
    const nextStatus = statusInfo.next;
    
    try {
      // Llamar a la API para actualizar el estatus
      const response = await ContratoAPI.updateStatus(id, nextStatus);
      
      if (response.success) {
        // Actualizar el estado en la lista local
        setContractsData(prevData => 
          prevData.map(contract => 
            contract.id_aprobacion === id 
              ? { ...contract, estatus: nextStatus }
              : contract
          )
        );
        
        // Notificación de éxito
        setNotifications(prev => [
          { 
            id: Date.now(), 
            text: `Contrato #${id} avanzó a estado: ${nextStatus}`, 
            time: "Ahora", 
            read: false
          },
          ...prev
        ]);
      } else {
        throw new Error(response.error || 'Error al cambiar el estado');
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      
      // Notificación de error
      setNotifications(prev => [
        { 
          id: Date.now(), 
          text: `Error al cambiar estado del contrato #${id}: ${error.message || 'Error desconocido'}`, 
          time: "Ahora", 
          read: false,
          type: 'error'
        },
        ...prev
      ]);
    }
  };

  // Función para abrir modal de gestión de contrato
  const gestionarContrato = (contract) => {
    setSelectedContractForGestion(contract);
    setShowGestionModal(true);
    
    // Calcular el siguiente número de contrato
    const currentYear = new Date().getFullYear();
    const nextNumber = lastContractNumber + 1;
    const formattedNumber = String(nextNumber).padStart(3, '0');
    const numeroContratoAuto = `IADEY-${currentYear}-${formattedNumber}`;
    
    // Inicializar el formulario con el número de contrato automático
    setFormGestion({
      numero_contrato: numeroContratoAuto,
      moneda: "Bolívares",
      monto_moneda: "",
      cambio: "",
      flat: "",
      interes: "",
      devolvimiento: "",
      numero_cuotas: contract.numero_cuotas !== "Sin definir" ? contract.numero_cuotas : "",
      inicio: contract.inicio !== "Sin definir" ? contract.inicio : new Date().toISOString().split('T')[0],
      cierre: contract.cierre !== "Sin definir" ? contract.cierre : "",
    });
    setFormErrors({});
  };

  // Función para abrir modal de desembolso
  // Función para abrir modal de desembolso
const abrirDesembolso = (contract) => {
  setSelectedContractForDesembolso(contract);
  setFormDesembolso({
    referencia_bancaria: "",
    monto_pagado: "",
    fecha_desembolso: new Date().toISOString().split('T')[0],
    observaciones: ""
  });
  setDesembolsoErrors({});
  setShowDesembolsoModal(true);
};

  // Manejar cambios en el formulario de desembolso
  // Manejar cambios en el formulario de desembolso
const handleDesembolsoChange = (field, value) => {
  setFormDesembolso(prev => ({
    ...prev,
    [field]: value
  }));
  
  if (desembolsoErrors[field]) {
    setDesembolsoErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  }
};

  // Validar formulario de desembolso
const validateDesembolsoForm = () => {
  const errors = {};
  
  if (!formDesembolso.referencia_bancaria.trim()) {
    errors.referencia_bancaria = "La referencia bancaria es requerida";
  } else if (formDesembolso.referencia_bancaria.length > 6) {
    errors.referencia_bancaria = "La referencia bancaria debe tener máximo 6 caracteres";
  } else if (!/^[A-Z0-9]+$/i.test(formDesembolso.referencia_bancaria)) {
    errors.referencia_bancaria = "Solo letras y números permitidos";
  }
  
  if (!formDesembolso.monto_pagado.trim()) {
    errors.monto_pagado = "El monto pagado es requerido";
  } else if (isNaN(formDesembolso.monto_pagado) || Number(formDesembolso.monto_pagado) <= 0) {
    errors.monto_pagado = "Ingrese un monto válido";
  }
  
  if (!formDesembolso.fecha_desembolso) {
    errors.fecha_desembolso = "La fecha es requerida";
  }
  
  setDesembolsoErrors(errors);
  return Object.keys(errors).length === 0;
};

  // Función para realizar desembolso usando la API
const realizarDesembolso = async () => {
  if (!validateDesembolsoForm()) {
    return;
  }
  
  setDesembolsoSubmitting(true);
  
  try {
    const desembolsoData = {
      referencia_bancaria: formDesembolso.referencia_bancaria.toUpperCase(),
      monto_pagado: formDesembolso.monto_pagado,
      fecha_desembolso: formDesembolso.fecha_desembolso,
      estatus: "Pendiente" // Estatus inicial del desembolso
    };
    
    // Llamar a la API de desembolso (actualizar la llamada según tu API)
    const response = await ContratoAPI.realizarDesembolso(
      selectedContractForDesembolso.id_aprobacion, 
      desembolsoData
    );
    
    if (response.success) {
      // Actualizar el estado del contrato a "Activo" en la lista local
      setContractsData(prevData => 
        prevData.map(contract => 
          contract.id_aprobacion === selectedContractForDesembolso.id_aprobacion 
            ? { ...contract, estatus: "Activo" }
            : contract
        )
      );
      
      // Notificación de éxito
      setNotifications(prev => [
        { 
          id: Date.now(), 
          text: `Desembolso registrado exitosamente para contrato #${selectedContractForDesembolso.id_aprobacion}. Referencia: ${desembolsoData.referencia_bancaria}`, 
          time: "Ahora", 
          read: false 
        },
        ...prev
      ]);
      
      // Cerrar modal
      setShowDesembolsoModal(false);
      setSelectedContractForDesembolso(null);
    } else {
      throw new Error(response.error || 'Error al registrar el desembolso');
    }
  } catch (error) {
    console.error("Error al realizar desembolso:", error);
    
    setDesembolsoErrors({
      submit: error.error || error.message || "Error al procesar el desembolso"
    });
    
    setNotifications(prev => [
      { 
        id: Date.now(), 
        text: `Error al registrar desembolso: ${error.message || 'Error desconocido'}`, 
        time: "Ahora", 
        read: false,
        type: 'error'
      },
      ...prev
    ]);
  } finally {
    setDesembolsoSubmitting(false);
  }
};

  // Funciones para el formulario de gestión
  const validateForm = () => {
    const errors = {};
    
    if (!formGestion.numero_contrato.trim()) {
      errors.numero_contrato = "El número de contrato es requerido";
    }
    
    if (!formGestion.moneda.trim()) {
      errors.moneda = "La moneda es requerida";
    }
    
    if (!formGestion.monto_moneda.trim()) {
      errors.monto_moneda = "El monto en moneda es requerido";
    } else if (isNaN(formGestion.monto_moneda) || Number(formGestion.monto_moneda) <= 0) {
      errors.monto_moneda = "Ingrese un monto válido";
    }
    
    if (!formGestion.cambio.trim()) {
      errors.cambio = "El cambio es requerido";
    } else if (isNaN(formGestion.cambio) || Number(formGestion.cambio) <= 0) {
      errors.cambio = "Ingrese un cambio válido";
    }
    
    if (!formGestion.flat.trim()) {
      errors.flat = "El flat es requerido";
    } else if (isNaN(formGestion.flat) || Number(formGestion.flat) < 0) {
      errors.flat = "Ingrese un valor válido";
    }
    
    if (!formGestion.interes.trim()) {
      errors.interes = "El interés es requerido";
    } else if (isNaN(formGestion.interes) || Number(formGestion.interes) < 0) {
      errors.interes = "Ingrese un interés válido";
    }
    
    if (!formGestion.devolvimiento.trim()) {
      errors.devolvimiento = "El devolvimiento es requerido";
    } else if (isNaN(formGestion.devolvimiento) || Number(formGestion.devolvimiento) <= 0) {
      errors.devolvimiento = "Ingrese un devolvimiento válido";
    }
    
    if (!formGestion.numero_cuotas.trim()) {
      errors.numero_cuotas = "El número de cuotas es requerido";
    } else if (isNaN(formGestion.numero_cuotas) || Number(formGestion.numero_cuotas) <= 0) {
      errors.numero_cuotas = "Ingrese un número válido";
    }
    
    if (!formGestion.inicio) {
      errors.inicio = "La fecha de inicio es requerida";
    }
    
    if (!formGestion.cierre) {
      errors.cierre = "La fecha de cierre es requerida";
    } else if (formGestion.inicio && formGestion.cierre < formGestion.inicio) {
      errors.cierre = "La fecha de cierre debe ser posterior al inicio";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormGestion(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const confirmarGestion = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setFormErrors({});
    
    try {
      // Preparar datos para enviar a la API
      const contratoData = {
        id_aprob: selectedContractForGestion.id_aprobacion,
        id_config: selectedContractForGestion.id_config || 1,
        numero_contrato: formGestion.numero_contrato,
        moneda: formGestion.moneda,
        monto_moneda: formGestion.monto_moneda,
        cambio: formGestion.cambio,
        flat: formGestion.flat,
        interes: formGestion.interes,
        devolvimiento: formGestion.devolvimiento,
        numero_cuotas: formGestion.numero_cuotas,
        inicio: formGestion.inicio,
        cierre: formGestion.cierre
      };

      // Llamar a la API para registrar el contrato
      const response = await ContratoAPI.create(contratoData);
      
      if (response.success) {
        // Actualizar el estado del contrato en la lista a "Pendiente"
        setContractsData(prevData => 
          prevData.map(contract => 
            contract.id_aprobacion === selectedContractForGestion.id_aprobacion 
              ? { 
                  ...contract, 
                  estatus: "Pendiente",
                  numero_cuotas: formGestion.numero_cuotas,
                  inicio: formGestion.inicio,
                  cierre: formGestion.cierre,
                  numero_contrato: formGestion.numero_contrato
                }
              : contract
          )
        );
        
        // Incrementar el contador para el próximo contrato
        setLastContractNumber(prev => prev + 1);
        
        // Notificación
        setNotifications(prev => [
          { 
            id: Date.now(), 
            text: `Contrato ${formGestion.numero_contrato} registrado exitosamente - Estado: Pendiente`, 
            time: "Ahora", 
            read: false 
          },
          ...prev
        ]);
        
        // Cerrar modal
        setShowGestionModal(false);
        setSelectedContractForGestion(null);
      } else {
        throw new Error(response.error || 'Error al registrar el contrato');
      }
      
    } catch (error) {
      console.error("Error al gestionar contrato:", error);
      setFormErrors({ 
        submit: error.error || error.message || "Error al guardar el contrato. Intente nuevamente." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cerrarModalGestion = () => {
    setShowGestionModal(false);
    setSelectedContractForGestion(null);
    setFormErrors({});
  };

  // Filtrado de contratos
  const filteredContracts = contractsData.filter(contract => {
    const searchFields = [
      contract.id_aprobacion?.toString(),
      contract.emprendedor,
      contract.estatus
    ].join(" ").toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
                         contract.estatus?.toLowerCase() === selectedFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  // Marcar notificaciones como leídas
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
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

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  // Función para obtener el componente de estatus según el estado
  const getStatusComponent = (contract) => {
    const statusInfo = STATUS_FLOW[contract.estatus];
    if (!statusInfo) return null;

    const IconComponent = statusInfo.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 ${statusInfo.bgColor} text-white rounded-lg text-sm font-medium`}>
        <IconComponent size={14} />
        {statusInfo.label}
      </span>
    );
  };

  // Función para obtener las acciones disponibles según el estado
  const getActionButtons = (contract) => {
    const actions = [];

    // Botón Gestionar Contrato - Solo cuando está "Esperando contrato"
    if (contract.estatus === "Esperando contrato") {
      actions.push(
        <button
          key="gestionar"
          onClick={() => gestionarContrato(contract)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title="Gestionar contrato"
        >
          <FileText size={14} />
          Gestionar
        </button>
      );
    }

    // Botón Avanzar Estado - Para estados que no son "Esperando contrato", "Pendiente por desembolso" ni "Cancelado"
    if (contract.estatus !== "Esperando contrato" && 
        contract.estatus !== "Pendiente por desembolso" && 
        contract.estatus !== "Cancelado") {
      const statusInfo = STATUS_FLOW[contract.estatus];
      const IconComponent = statusInfo.icon;
      const nextStatus = statusInfo.next;
      
      actions.push(
        <button
          key="avanzar"
          onClick={() => avanzarEstado(contract.id_aprobacion, contract.estatus)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          title={`Avanzar a ${nextStatus}`}
        >
          <TrendingUp size={14} />
          Avanzar
        </button>
      );
    }

    // Botón Realizar Desembolso - Solo cuando está "Pendiente por desembolso"
    if (contract.estatus === "Pendiente por desembolso") {
      actions.push(
        <button
          key="desembolsar"
          onClick={() => abrirDesembolso(contract)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
          title="Realizar desembolso"
        >
          <CreditCard size={14} />
          Desembolsar
        </button>
      );
    }

    // Si no hay acciones, mostrar un mensaje
    if (actions.length === 0) {
      return (
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Sin acciones
        </span>
      );
    }

    return <div className="flex items-center justify-center gap-2 flex-wrap">{actions}</div>;
  };

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
            
            {/* ============ ENCABEZADO DE PÁGINA ============ */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Inicio</span>
                <ChevronRight size={14} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Gestión de Contratos
                </span>
              </div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Gestión de Contratos
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Administración de contratos con manejo interno
              </p>
            </div>

            {/* ============ TARJETAS DE ESTADÍSTICAS ============ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {currentData?.stats?.map((stat) => (
                <div 
                  key={stat.id}
                  className={`p-6 rounded-xl ${
                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
                  } shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={stat.textColor} size={22} />
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {loading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                </div>
              ))}
            </div>

            {/* ============ TABLA DE CONTRATOS ============ */}
            <div className={`rounded-xl ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
            } shadow-sm overflow-hidden`}>
              
              {/* Encabezado de la tabla */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Listado de Contratos - Manejo Interno
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {filteredContracts.length} contratos encontrados
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Buscador */}
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Buscar por ID, emprendedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-200 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
                      />
                    </div>

                    {/* Botón Filtros */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2.5 rounded-lg border ${
                        showFilters 
                          ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]' 
                          : darkMode 
                            ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <Filter size={18} />
                    </button>
                  </div>
                </div>

                {/* Filtros expandibles */}
                {showFilters && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Estatus
                        </label>
                        <select
                          value={selectedFilter}
                          onChange={(e) => setSelectedFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
                        >
                          <option value="all">Todos los estados</option>
                          <option value="activo">Activo</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="pendiente por desembolso">Pendiente por Desembolso</option>
                          <option value="esperando contrato">Esperando contrato</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Cuotas
                        </label>
                        <select
                          className={`w-full px-3 py-2 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
                        >
                          <option value="all">Todas</option>
                          <option value="definido">Definidas</option>
                          <option value="sin-definir">Sin definir</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSelectedFilter("all");
                            setSearchTerm("");
                            setShowFilters(false);
                          }}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                              : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                          } transition-colors text-sm`}
                        >
                          Limpiar Filtros
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Estado de carga */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-[#2A9D8F] mb-4" />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cargando contratos...
                  </p>
                </div>
              )}

              {/* Estado de error */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <p className={`text-lg font-medium ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>
                    Error al cargar los datos
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#238b7e] transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* Mensaje sin registros */}
              {!loading && !error && currentItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <FileText size={48} className="text-gray-400 mb-4" />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No se encontraron contratos
                  </p>
                </div>
              )}

              {/* Tabla con datos */}
              {!loading && !error && currentItems.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID Aprobación
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Emprendedor
                          </th>
                          <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            N° Cuotas
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Inicio
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Cierre
                          </th>
                          <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Estatus
                          </th>
                          <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {currentItems.map((contract) => (
                          <tr 
                            key={contract.id_aprobacion}
                            className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}
                          >
                            {/* ID Aprobación */}
                            <td className={`px-6 py-4 text-sm font-semibold ${darkMode ? 'text-[#2A9D8F]' : 'text-[#2A9D8F]'}`}>
                              #{contract.id_aprobacion}
                            </td>

                            {/* Emprendedor */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                                  <User size={16} className={darkMode ? 'text-gray-300' : 'text-blue-600'} />
                                </div>
                                <div>
                                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {contract.emprendedor}
                                  </span>
                                  {contract.numero_contrato && (
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Contrato: {contract.numero_contrato}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* N° Cuotas */}
                            <td className="px-6 py-4 text-center">
                              {contract.numero_cuotas === "Sin definir" ? (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  Sin definir
                                </span>
                              ) : (
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                                  darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-700'
                                }`}>
                                  {contract.numero_cuotas}
                                </span>
                              )}
                            </td>

                            {/* Inicio */}
                            <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {contract.inicio === "Sin definir" ? (
                                  <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Sin definir</span>
                                ) : (
                                  contract.inicio
                                )}
                              </div>
                            </td>

                            {/* Cierre */}
                            <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {contract.cierre === "Sin definir" ? (
                                  <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Sin definir</span>
                                ) : (
                                  contract.cierre
                                )}
                              </div>
                            </td>

                            {/* Estatus */}
                            <td className="px-6 py-4 text-center">
                              {getStatusComponent(contract)}
                            </td>

                            {/* Acciones */}
                            <td className="px-6 py-4">
                              {getActionButtons(contract)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredContracts.length)} de {filteredContracts.length} contratos
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg border ${
                            currentPage === 1
                              ? darkMode 
                                ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                              : darkMode
                                ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-[#2A9D8F] text-white'
                                : darkMode
                                  ? 'text-gray-400 hover:bg-gray-700 border border-gray-600'
                                  : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg border ${
                            currentPage === totalPages
                              ? darkMode 
                                ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                              : darkMode
                                ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* ============ MODAL DE GESTIÓN DE CONTRATO ============ */}
      {showGestionModal && selectedContractForGestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={cerrarModalGestion} 
          />
          <div className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            
            {/* Encabezado del Modal */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Gestionar Contrato
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Complete los datos del contrato para el emprendedor
                </p>
              </div>
              <button
                onClick={cerrarModalGestion}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <X size={22} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>

            {/* Información del Emprendedor */}
            <div className={`p-4 rounded-lg mb-6 ${
              darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-blue-50 border border-blue-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                  <User size={24} className={darkMode ? 'text-gray-300' : 'text-blue-600'} />
                </div>
                <div>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {selectedContractForGestion.emprendedor}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    ID Aprobación: <span className="font-semibold text-[#2A9D8F]">#{selectedContractForGestion.id_aprobacion}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={(e) => { e.preventDefault(); confirmarGestion(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                
                {/* Número de Contrato - AUTOMÁTICO */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de Contrato <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileSignature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formGestion.numero_contrato}
                      readOnly
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed' 
                          : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                      } focus:outline-none text-sm font-medium`}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`p-1 rounded ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                      <FileText size={12} className="text-blue-500" />
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Formato: <span className="font-semibold">IADEY-AAAA-NNN</span> (generado automáticamente)
                    </p>
                  </div>
                </div>

                {/* Moneda */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Moneda <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formGestion.moneda}
                    onChange={(e) => handleInputChange('moneda', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      formErrors.moneda 
                        ? 'border-red-500 focus:ring-red-500' 
                        : darkMode 
                          ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                          : 'border-gray-200 focus:ring-[#2A9D8F]'
                    } ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                    } focus:outline-none focus:ring-2 text-sm`}
                  >
                    <option value="Bolívares">Bolívares (VES)</option>
                    <option value="Dólares">Dólares (USD)</option>
                    <option value="Euros">Euros (EUR)</option>
                    <option value="Pesos">Pesos (COP)</option>
                  </select>
                  {formErrors.moneda && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.moneda}</p>
                  )}
                </div>

                {/* Monto Moneda */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Monto en Moneda <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formGestion.monto_moneda}
                      onChange={(e) => handleInputChange('monto_moneda', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        formErrors.monto_moneda 
                          ? 'border-red-500 focus:ring-red-500' 
                          : darkMode 
                            ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                            : 'border-gray-200 focus:ring-[#2A9D8F]'
                      } ${
                        darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'
                      } focus:outline-none focus:ring-2 text-sm`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.monto_moneda && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.monto_moneda}</p>
                  )}
                </div>

                {/* Cambio */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cambio (Tasa) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.0001"
                      value={formGestion.cambio}
                      onChange={(e) => handleInputChange('cambio', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        formErrors.cambio 
                          ? 'border-red-500 focus:ring-red-500' 
                          : darkMode 
                            ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                            : 'border-gray-200 focus:ring-[#2A9D8F]'
                      } ${
                        darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'
                      } focus:outline-none focus:ring-2 text-sm`}
                      placeholder="0.0000"
                    />
                  </div>
                  {formErrors.cambio && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.cambio}</p>
                  )}
                </div>

                {/* Flat */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Flat (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formGestion.flat}
                      onChange={(e) => handleInputChange('flat', e.target.value)}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-lg border ${
                        formErrors.flat 
                          ? 'border-red-500 focus:ring-red-500' 
                          : darkMode 
                            ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                            : 'border-gray-200 focus:ring-[#2A9D8F]'
                      } ${
                        darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'
                      } focus:outline-none focus:ring-2 text-sm`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.flat && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.flat}</p>
                  )}
                </div>

                {/* Interés */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Interés (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formGestion.interes}
                      onChange={(e) => handleInputChange('interes', e.target.value)}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-lg border ${
                        formErrors.interes 
                          ? 'border-red-500 focus:ring-red-500' 
                          : darkMode 
                            ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                            : 'border-gray-200 focus:ring-[#2A9D8F]'
                      } ${
                        darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'
                      } focus:outline-none focus:ring-2 text-sm`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.interes && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.interes}</p>
                  )}
                </div>

                {/* Devolvimiento */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Devolvimiento <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      value={formGestion.devolvimiento}
                      onChange={(e) => handleInputChange('devolvimiento', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        formErrors.devolvimiento 
                          ? 'border-red-500 focus:ring-red-500' 
                          : darkMode 
                            ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                            : 'border-gray-200 focus:ring-[#2A9D8F]'
                      } ${
                        darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'
                      } focus:outline-none focus:ring-2 text-sm`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.devolvimiento && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.devolvimiento}</p>
                  )}
                </div>

                {/* Número de Cuotas */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de Cuotas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formGestion.numero_cuotas}
                    onChange={(e) => handleInputChange('numero_cuotas', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      formErrors.numero_cuotas 
                        ? 'border-red-500 focus:ring-red-500' 
                        : darkMode 
                          ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                          : 'border-gray-200 focus:ring-[#2A9D8F]'
                    } ${
                      darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'
                    } focus:outline-none focus:ring-2 text-sm`}
                    placeholder="Ej: 12"
                  />
                  {formErrors.numero_cuotas && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.numero_cuotas}</p>
                  )}
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      value={formGestion.inicio}
                      onChange={(e) => handleInputChange('inicio', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        formErrors.inicio 
                          ? 'border-red-500 focus:ring-red-500' 
                          : darkMode 
                            ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                            : 'border-gray-200 focus:ring-[#2A9D8F]'
                      } ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                      } focus:outline-none focus:ring-2 text-sm`}
                    />
                  </div>
                  {formErrors.inicio && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.inicio}</p>
                  )}
                </div>

                {/* Fecha Cierre */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de Cierre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      value={formGestion.cierre}
                      onChange={(e) => handleInputChange('cierre', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                        formErrors.cierre 
                          ? 'border-red-500 focus:ring-red-500' 
                          : darkMode 
                            ? 'border-gray-600 focus:ring-[#2A9D8F]' 
                            : 'border-gray-200 focus:ring-[#2A9D8F]'
                      } ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                      } focus:outline-none focus:ring-2 text-sm`}
                    />
                  </div>
                  {formErrors.cierre && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.cierre}</p>
                  )}
                </div>
              </div>

              {/* Error de submit */}
              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-sm text-red-600">{formErrors.submit}</p>
                </div>
              )}

              {/* Resumen */}
              <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resumen del Contrato
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contrato:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formGestion.numero_contrato || "—"}
                    </span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Moneda:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formGestion.moneda || "—"}
                    </span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formGestion.monto_moneda || "—"}
                    </span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuotas:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formGestion.numero_cuotas || "—"}
                    </span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inicio:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formGestion.inicio || "—"}
                    </span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cierre:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formGestion.cierre || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={cerrarModalGestion}
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-lg border ${
                    darkMode 
                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  } transition-colors text-sm font-medium disabled:opacity-50`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FileSignature size={16} />
                      Guardar Contrato
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL DE DESEMBOLSO ============ */}
{showDesembolsoModal && selectedContractForDesembolso && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDesembolsoModal(false)} />
    <div className={`relative w-full max-w-lg mx-4 p-6 rounded-xl shadow-2xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Registrar Desembolso
        </h3>
        <button
          onClick={() => setShowDesembolsoModal(false)}
          className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
        >
          <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); realizarDesembolso(); }}>
        <div className="space-y-4 mb-6">
          {/* Información del Contrato */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-blue-50'}`}>
                <User size={20} className={darkMode ? 'text-gray-300' : 'text-blue-600'} />
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedContractForDesembolso.emprendedor}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Contrato {selectedContractForDesembolso.numero_contrato || `#${selectedContractForDesembolso.id_aprobacion}`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuotas:</span>
                <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedContractForDesembolso.numero_cuotas}
                </span>
              </div>
              <div>
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inicio:</span>
                <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedContractForDesembolso.inicio}
                </span>
              </div>
              <div>
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cierre:</span>
                <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedContractForDesembolso.cierre}
                </span>
              </div>
              <div>
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Estatus:</span>
                <span className="ml-2 inline-flex items-center gap-1 text-sm font-medium text-orange-600">
                  <DollarSign size={12} />
                  Pendiente por desembolso
                </span>
              </div>
            </div>
          </div>

          {/* Referencia Bancaria */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Referencia Bancaria <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                maxLength="6"
                value={formDesembolso.referencia_bancaria}
                onChange={(e) => handleDesembolsoChange('referencia_bancaria', e.target.value.toUpperCase())}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  desembolsoErrors.referencia_bancaria 
                    ? 'border-red-500 focus:ring-red-500' 
                    : darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm uppercase`}
                placeholder="Ej: ABC123"
              />
            </div>
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Máximo 6 caracteres (letras y números)
            </p>
            {desembolsoErrors.referencia_bancaria && (
              <p className="mt-1 text-xs text-red-500">{desembolsoErrors.referencia_bancaria}</p>
            )}
          </div>

          {/* Monto Pagado */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Monto Pagado <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                step="0.01"
                value={formDesembolso.monto_pagado}
                onChange={(e) => handleDesembolsoChange('monto_pagado', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  desembolsoErrors.monto_pagado 
                    ? 'border-red-500 focus:ring-red-500' 
                    : darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
                placeholder="0.00"
              />
            </div>
            {desembolsoErrors.monto_pagado && (
              <p className="mt-1 text-xs text-red-500">{desembolsoErrors.monto_pagado}</p>
            )}
          </div>

          {/* Fecha de Desembolso */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Fecha de Desembolso <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={formDesembolso.fecha_desembolso}
                onChange={(e) => handleDesembolsoChange('fecha_desembolso', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                  desembolsoErrors.fecha_desembolso 
                    ? 'border-red-500 focus:ring-red-500' 
                    : darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
              />
            </div>
            {desembolsoErrors.fecha_desembolso && (
              <p className="mt-1 text-xs text-red-500">{desembolsoErrors.fecha_desembolso}</p>
            )}
          </div>

          {/* Observaciones (opcional) */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Observaciones
            </label>
            <textarea
              rows={3}
              value={formDesembolso.observaciones}
              onChange={(e) => handleDesembolsoChange('observaciones', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
              placeholder="Observaciones adicionales del desembolso..."
            />
          </div>

          {/* Error de submit */}
          {desembolsoErrors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-sm text-red-600">{desembolsoErrors.submit}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setShowDesembolsoModal(false)}
            disabled={desembolsoSubmitting}
            className={`px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            } transition-colors text-sm disabled:opacity-50`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={desembolsoSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {desembolsoSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Registrar Desembolso
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default Contrato;