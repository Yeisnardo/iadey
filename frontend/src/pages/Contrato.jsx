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
  CheckCircle,
  X,
  CreditCard,
  DollarSign,
  AlertCircle,
  Loader2,
  User,
  Hourglass,
  Ban,
  RefreshCw,
  Eye
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

// Importamos la API
import ContratoAPI from "../services/api_contrato";
import configuracionContratoAPI from "../services/api_configuracion_contrato";

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

  // Estados para el modal de consulta de contrato
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [selectedContractForConsulta, setSelectedContractForConsulta] = useState(null);

  // Estados para el modal de desembolso
  const [formDesembolso, setFormDesembolso] = useState({
    referencia_bancaria: "",
    monto_pagado: "",
    fecha_desembolso: new Date().toISOString().split('T')[0],
    observaciones: ""
  });
  const [desembolsoErrors, setDesembolsoErrors] = useState({});
  const [desembolsoSubmitting, setDesembolsoSubmitting] = useState(false);

  // Estados para el modal de gestión de contrato
  const [showGestionModal, setShowGestionModal] = useState(false);
  const [selectedContractForGestion, setSelectedContractForGestion] = useState(null);
  const [lastContractNumber, setLastContractNumber] = useState(0);
  const [montoBolivares, setMontoBolivares] = useState({
    bruto: 0,
    flatMonto: 0,
    neto: 0
  });
  const [formGestion, setFormGestion] = useState({
    numero_contrato: "",
    moneda: "usd",
    monto_moneda: "",
    cambio: "",
    flat: "",
    interes_porcentaje: "",
    devolvimiento: "",
    numero_cuotas: "",
    inicio: "",
    cierre: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estados para la configuración del contrato
  const [configuracionContrato, setConfiguracionContrato] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Estados para las tasas de cambio de DolarApi
  const [tasasCambio, setTasasCambio] = useState({
    dolares: null,
    euros: null
  });
  const [loadingTasas, setLoadingTasas] = useState(false);
  const [errorTasas, setErrorTasas] = useState(null);

  // Estados para los datos de la API
  const [contractsData, setContractsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener el nombre de la moneda
  const getMonedaNombre = (tipoMoneda) => {
    switch (tipoMoneda) {
      case 'usd':
        return 'USD';
      case 'eur':
        return 'EUR';
      default:
        return 'VES';
    }
  };

  // Función para calcular la fecha de cierre
  const calcularFechaCierre = (fechaInicio, numeroCuotas, frecuenciaPago) => {
    if (!fechaInicio || !numeroCuotas || !frecuenciaPago) return "";
    
    const fecha = new Date(fechaInicio);
    const cuotas = parseInt(numeroCuotas);
    
    if (isNaN(cuotas) || cuotas <= 0) return "";
    
    switch (frecuenciaPago) {
      case 'semanal':
        fecha.setDate(fecha.getDate() + (cuotas * 7));
        break;
      case 'quincenal':
        fecha.setDate(fecha.getDate() + (cuotas * 15));
        break;
      case 'mensual':
        fecha.setMonth(fecha.getMonth() + cuotas);
        break;
      case 'bimestral':
        fecha.setMonth(fecha.getMonth() + (cuotas * 2));
        break;
      case 'trimestral':
        fecha.setMonth(fecha.getMonth() + (cuotas * 3));
        break;
      case 'semestral':
        fecha.setMonth(fecha.getMonth() + (cuotas * 6));
        break;
      case 'anual':
        fecha.setFullYear(fecha.getFullYear() + cuotas);
        break;
      default:
        fecha.setMonth(fecha.getMonth() + cuotas);
    }
    
    return fecha.toISOString().split('T')[0];
  };

  // Función para recalcular la fecha de cierre
  const recalcularFechaCierre = () => {
    if (formGestion.inicio && formGestion.numero_cuotas && configuracionContrato?.frecuencia_pago) {
      const fechaCierre = calcularFechaCierre(
        formGestion.inicio, 
        formGestion.numero_cuotas, 
        configuracionContrato.frecuencia_pago
      );
      if (fechaCierre) {
        setFormGestion(prev => ({ ...prev, cierre: fechaCierre }));
      }
    }
  };

  // Función para calcular el monto en bolívares
  const calcularMontoBolivares = (monto, cambio, flatPorcentaje) => {
    if (!monto || !cambio) return { bruto: 0, flatMonto: 0, neto: 0 };
    const montoNum = parseFloat(monto);
    const cambioNum = parseFloat(cambio);
    if (isNaN(montoNum) || isNaN(cambioNum)) return { bruto: 0, flatMonto: 0, neto: 0 };
    
    const resultadoBruto = montoNum * cambioNum;
    
    if (flatPorcentaje && !isNaN(parseFloat(flatPorcentaje))) {
      const flatDecimal = parseFloat(flatPorcentaje) / 100;
      const descuentoFlat = resultadoBruto * flatDecimal;
      const resultadoNeto = resultadoBruto - descuentoFlat;
      
      return {
        bruto: resultadoBruto,
        flatMonto: descuentoFlat,
        neto: resultadoNeto
      };
    }
    
    return {
      bruto: resultadoBruto,
      flatMonto: 0,
      neto: resultadoBruto
    };
  };

  // Función para calcular el devolvimiento
  const calcularDevolvimiento = (montoMoneda, porcentajeInteres) => {
    if (!montoMoneda) return 0;
    const montoNum = parseFloat(montoMoneda);
    if (isNaN(montoNum)) return 0;
    
    if (porcentajeInteres && !isNaN(parseFloat(porcentajeInteres))) {
      const interesDecimal = parseFloat(porcentajeInteres) / 100;
      return montoNum + (montoNum * interesDecimal);
    }
    
    return montoNum;
  };

  // Función para formatear números
  const formatMonto = (monto) => {
    return monto.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Definir el flujo de estados
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

  // Función para obtener el texto de la frecuencia de pago
  const getFrecuenciaPagoTexto = (frecuencia) => {
    switch (frecuencia) {
      case 'semanal':
        return 'Semanal';
      case 'quincenal':
        return 'Quincenal';
      case 'mensual':
        return 'Mensual';
      case 'bimestral':
        return 'Bimestral';
      case 'trimestral':
        return 'Trimestral';
      case 'semestral':
        return 'Semestral';
      case 'anual':
        return 'Anual';
      default:
        return frecuencia || 'No definida';
    }
  };

  // Función para ver detalles del contrato (consulta)
  const verDetallesContrato = (contract) => {
    setSelectedContractForConsulta(contract);
    setShowConsultaModal(true);
  };

  // Cargar configuración del contrato
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        setLoadingConfig(true);
        const response = await configuracionContratoAPI.getCurrent();
        
        if (response.success && response.data) {
          setConfiguracionContrato(response.data);
        } else {
          console.warn('No se pudo cargar la configuración actual');
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
        setNotifications(prev => [
          { 
            id: Date.now(), 
            text: 'Error al cargar la configuración del contrato', 
            time: "Ahora", 
            read: false,
            type: 'error'
          },
          ...prev
        ]);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfiguracion();
  }, []);

  // Cargar tasas de cambio
  useEffect(() => {
    const fetchTasasCambio = async () => {
      try {
        setLoadingTasas(true);
        setErrorTasas(null);
        
        const [dolaresResponse, eurosResponse] = await Promise.all([
          fetch('https://ve.dolarapi.com/v1/dolares'),
          fetch('https://ve.dolarapi.com/v1/euros')
        ]);
        
        if (!dolaresResponse.ok || !eurosResponse.ok) {
          throw new Error('Error al obtener las tasas de cambio');
        }
        
        const dolaresData = await dolaresResponse.json();
        const eurosData = await eurosResponse.json();
        
        let tasaDolar = null;
        let tasaEuro = null;
        
        if (Array.isArray(dolaresData) && dolaresData.length > 0) {
          const tasaBCV = dolaresData.find(d => d.nombre?.toLowerCase().includes('bcv'));
          tasaDolar = tasaBCV?.promedio || dolaresData[0]?.promedio || dolaresData[0]?.valor || null;
        }
        
        if (Array.isArray(eurosData) && eurosData.length > 0) {
          const tasaBCV = eurosData.find(d => d.nombre?.toLowerCase().includes('bcv'));
          tasaEuro = tasaBCV?.promedio || eurosData[0]?.promedio || eurosData[0]?.valor || null;
        }
        
        setTasasCambio({
          dolares: tasaDolar,
          euros: tasaEuro
        });
        
      } catch (error) {
        console.error('Error al cargar tasas de cambio:', error);
        setErrorTasas(error.message);
        
        setNotifications(prev => [
          { 
            id: Date.now(), 
            text: 'No se pudieron cargar las tasas de cambio actualizadas', 
            time: "Ahora", 
            read: false,
            type: 'warning'
          },
          ...prev
        ]);
      } finally {
        setLoadingTasas(false);
      }
    };

    fetchTasasCambio();
    const interval = setInterval(fetchTasasCambio, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar datos de la API
  useEffect(() => {
    const fetchContratos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ContratoAPI.getAll();
        
        if (response.success) {
          const dataConDefaults = response.data.map(item => ({
            ...item,
            numero_cuotas: item.numero_cuotas || "Sin definir",
            inicio: item.inicio || "Sin definir",
            cierre: item.cierre || "Sin definir",
            estatus: item.estatus || "Esperando contrato",
            emprendedor: item.emprendedor || "Sin definir",
            numero_contrato: item.numero_contrato || "",
            moneda: item.moneda || "usd",
            monto_moneda: item.monto_moneda || null,
            cambio: item.cambio || null,
            flat: item.flat || null,
            interes_porcentaje: item.interes_porcentaje || null,
            devolvimiento: item.devolvimiento || null
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

  // Inicializar formulario cuando se abre el modal de gestión
  useEffect(() => {
    if (showGestionModal && selectedContractForGestion && configuracionContrato) {
      const currentYear = new Date().getFullYear();
      const nextNumber = lastContractNumber + 1;
      const formattedNumber = String(nextNumber).padStart(3, '0');
      const numeroContratoAuto = `IADEY-${currentYear}-${formattedNumber}`;
      
      const monedaConfig = configuracionContrato.tipo_moneda || "usd";
      
      let tasaCambio = "";
      if (monedaConfig === 'usd' && tasasCambio.dolares) {
        tasaCambio = tasasCambio.dolares.toString();
      } else if (monedaConfig === 'eur' && tasasCambio.euros) {
        tasaCambio = tasasCambio.euros.toString();
      } else {
        tasaCambio = "";
      }
      
      const fechaInicioDefault = new Date().toISOString().split('T')[0];
      
      const cuotasObligatorias = configuracionContrato.cuotas_obligatorias?.toString() || 
        (selectedContractForGestion.numero_cuotas !== "Sin definir" ? selectedContractForGestion.numero_cuotas : "");
      
      let fechaCierreDefault = "";
      if (fechaInicioDefault && cuotasObligatorias && configuracionContrato.frecuencia_pago) {
        fechaCierreDefault = calcularFechaCierre(
          fechaInicioDefault, 
          cuotasObligatorias, 
          configuracionContrato.frecuencia_pago
        );
      }
      
      const newFormGestion = {
        numero_contrato: numeroContratoAuto,
        moneda: monedaConfig,
        monto_moneda: "",
        cambio: tasaCambio,
        flat: configuracionContrato.flat_porcentaje?.toString() || "",
        interes_porcentaje: configuracionContrato.interes_porcentaje?.toString() || "",
        devolvimiento: "",
        numero_cuotas: cuotasObligatorias,
        inicio: fechaInicioDefault,
        cierre: fechaCierreDefault,
      };
      
      setFormGestion(newFormGestion);
      setMontoBolivares({ bruto: 0, flatMonto: 0, neto: 0 });
      setFormErrors({});
    }
  }, [showGestionModal, selectedContractForGestion, lastContractNumber, configuracionContrato, tasasCambio]);

  // Contadores para estadísticas
  const contratosActivos = contractsData.filter(c => c.estatus === "Activo").length;
  const contratosPendientes = contractsData.filter(c => c.estatus === "Pendiente").length;
  const contratosPendientesDesembolso = contractsData.filter(c => c.estatus === "Pendiente por desembolso").length;
  const contratosEsperando = contractsData.filter(c => c.estatus === "Esperando contrato").length;

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
  const unreadCount = notifications.filter(n => !n.read).length;

  // Función para avanzar al siguiente estado
  const avanzarEstado = async (id, currentStatus) => {
    const statusInfo = STATUS_FLOW[currentStatus];
    if (!statusInfo) return;
    
    const nextStatus = statusInfo.next;
    
    try {
      const response = await ContratoAPI.updateStatus(id, nextStatus);
      
      if (response.success) {
        setContractsData(prevData => 
          prevData.map(contract => 
            contract.id_aprobacion === id 
              ? { ...contract, estatus: nextStatus }
              : contract
          )
        );
        
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
      setNotifications(prev => [
        { 
          id: Date.now(), 
          text: `Error al cambiar estado del contrato #${id}: ${error.message}`, 
          time: "Ahora", 
          read: false,
          type: 'error'
        },
        ...prev
      ]);
    }
  };

  const gestionarContrato = (contract) => {
    setSelectedContractForGestion(contract);
    setShowGestionModal(true);
  };

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

  const handleDesembolsoChange = (field, value) => {
    setFormDesembolso(prev => ({ ...prev, [field]: value }));
    if (desembolsoErrors[field]) {
      setDesembolsoErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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

  const realizarDesembolso = async () => {
    if (!validateDesembolsoForm()) return;
    
    setDesembolsoSubmitting(true);
    
    try {
      const desembolsoData = {
        referencia_bancaria: formDesembolso.referencia_bancaria.toUpperCase(),
        monto_pagado: formDesembolso.monto_pagado,
        fecha_desembolso: formDesembolso.fecha_desembolso,
        estatus: "Pendiente"
      };
      
      const response = await ContratoAPI.realizarDesembolso(
        selectedContractForDesembolso.id_aprobacion, 
        desembolsoData
      );
      
      if (response.success) {
        setContractsData(prevData => 
          prevData.map(contract => 
            contract.id_aprobacion === selectedContractForDesembolso.id_aprobacion 
              ? { ...contract, estatus: "Activo" }
              : contract
          )
        );
        
        setNotifications(prev => [
          { 
            id: Date.now(), 
            text: `Desembolso registrado exitosamente para contrato #${selectedContractForDesembolso.id_aprobacion}`, 
            time: "Ahora", 
            read: false 
          },
          ...prev
        ]);
        
        setShowDesembolsoModal(false);
        setSelectedContractForDesembolso(null);
      } else {
        throw new Error(response.error || 'Error al registrar el desembolso');
      }
    } catch (error) {
      console.error("Error al realizar desembolso:", error);
      setDesembolsoErrors({ submit: error.message || "Error al procesar el desembolso" });
    } finally {
      setDesembolsoSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formGestion.numero_contrato.trim()) {
      errors.numero_contrato = "El número de contrato es requerido";
    }
    
    if (!formGestion.monto_moneda.trim()) {
      errors.monto_moneda = "El monto en moneda es requerido";
    } else if (isNaN(formGestion.monto_moneda) || Number(formGestion.monto_moneda) <= 0) {
      errors.monto_moneda = "Ingrese un monto válido";
    }
    
    if (!formGestion.cambio.trim()) {
      errors.cambio = "El cambio (tasa) es requerido";
    } else if (isNaN(formGestion.cambio) || Number(formGestion.cambio) <= 0) {
      errors.cambio = "Ingrese un cambio válido";
    }
    
    if (!formGestion.flat.trim()) {
      errors.flat = "El flat es requerido";
    } else if (isNaN(formGestion.flat) || Number(formGestion.flat) < 0) {
      errors.flat = "Ingrese un valor válido";
    }
    
    if (!formGestion.interes_porcentaje.trim()) {
      errors.interes_porcentaje = "El porcentaje de interés es requerido";
    } else if (isNaN(formGestion.interes_porcentaje) || Number(formGestion.interes_porcentaje) < 0) {
      errors.interes_porcentaje = "Ingrese un porcentaje válido";
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
    if (field === 'flat') {
      handleFlatChange(value);
    } else if (field === 'interes_porcentaje') {
      handleInteresPorcentajeChange(value);
    } else if (field === 'numero_cuotas') {
      handleNumeroCuotasChange(value);
    } else if (field === 'inicio') {
      handleFechaInicioChange(value);
    } else {
      setFormGestion(prev => {
        const updated = { ...prev, [field]: value };
        return updated;
      });
    }
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const confirmarGestion = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const interesValor = parseFloat(formGestion.monto_moneda) * (parseFloat(formGestion.interes_porcentaje) / 100);
      
      const contratoData = {
        id_aprob: selectedContractForGestion.id_aprobacion,
        id_config: selectedContractForGestion.id_config || 1,
        numero_contrato: formGestion.numero_contrato,
        moneda: formGestion.moneda,
        monto_moneda: parseFloat(formGestion.monto_moneda),
        cambio: parseFloat(formGestion.cambio),
        flat: parseFloat(formGestion.flat),
        interes_porcentaje: parseFloat(formGestion.interes_porcentaje),
        interes: interesValor,
        devolvimiento: parseFloat(formGestion.devolvimiento),
        numero_cuotas: parseInt(formGestion.numero_cuotas),
        inicio: formGestion.inicio,
        cierre: formGestion.cierre
      };

      const response = await ContratoAPI.create(contratoData);
      
      if (response.success) {
        setContractsData(prevData => 
          prevData.map(contract => 
            contract.id_aprobacion === selectedContractForGestion.id_aprobacion 
              ? { 
                  ...contract, 
                  estatus: "Pendiente",
                  numero_cuotas: formGestion.numero_cuotas,
                  inicio: formGestion.inicio,
                  cierre: formGestion.cierre,
                  numero_contrato: formGestion.numero_contrato,
                  moneda: formGestion.moneda,
                  monto_moneda: parseFloat(formGestion.monto_moneda),
                  cambio: parseFloat(formGestion.cambio),
                  flat: parseFloat(formGestion.flat),
                  interes_porcentaje: parseFloat(formGestion.interes_porcentaje),
                  devolvimiento: parseFloat(formGestion.devolvimiento)
                }
              : contract
          )
        );
        
        setLastContractNumber(prev => prev + 1);
        
        setNotifications(prev => [
          { 
            id: Date.now(), 
            text: `Contrato ${formGestion.numero_contrato} registrado exitosamente`, 
            time: "Ahora", 
            read: false 
          },
          ...prev
        ]);
        
        setShowGestionModal(false);
        setSelectedContractForGestion(null);
        setMontoBolivares({ bruto: 0, flatMonto: 0, neto: 0 });
      } else {
        throw new Error(response.error || 'Error al registrar el contrato');
      }
    } catch (error) {
      console.error("Error al gestionar contrato:", error);
      setFormErrors({ submit: error.message || "Error al guardar el contrato" });
    } finally {
      setSubmitting(false);
    }
  };

  const cerrarModalGestion = () => {
    setShowGestionModal(false);
    setSelectedContractForGestion(null);
    setFormErrors({});
    setMontoBolivares({ bruto: 0, flatMonto: 0, neto: 0 });
  };

  // Funciones para el modal de gestión
  const handleMontoMonedaChange = (value) => {
    setFormGestion(prev => ({ ...prev, monto_moneda: value }));
    
    if (value && formGestion.cambio) {
      const montoCalculado = calcularMontoBolivares(value, formGestion.cambio, formGestion.flat);
      setMontoBolivares(montoCalculado);
    } else {
      setMontoBolivares({ bruto: 0, flatMonto: 0, neto: 0 });
    }
    
    if (value && formGestion.interes_porcentaje) {
      const devolvimientoCalculado = calcularDevolvimiento(value, formGestion.interes_porcentaje);
      setFormGestion(prev => ({ ...prev, devolvimiento: devolvimientoCalculado.toString() }));
    } else if (value && !formGestion.interes_porcentaje) {
      setFormGestion(prev => ({ ...prev, devolvimiento: value }));
    } else if (!value) {
      setFormGestion(prev => ({ ...prev, devolvimiento: "" }));
    }
    
    if (formErrors.monto_moneda) {
      setFormErrors(prev => ({ ...prev, monto_moneda: undefined }));
    }
  };

  const handleCambioChange = (value) => {
    setFormGestion(prev => ({ ...prev, cambio: value }));
    
    if (formGestion.monto_moneda && value) {
      const montoCalculado = calcularMontoBolivares(formGestion.monto_moneda, value, formGestion.flat);
      setMontoBolivares(montoCalculado);
    } else {
      setMontoBolivares({ bruto: 0, flatMonto: 0, neto: 0 });
    }
    
    if (formErrors.cambio) {
      setFormErrors(prev => ({ ...prev, cambio: undefined }));
    }
  };

  const handleFlatChange = (value) => {
    setFormGestion(prev => ({ ...prev, flat: value }));
    
    if (formGestion.monto_moneda && formGestion.cambio) {
      const montoCalculado = calcularMontoBolivares(formGestion.monto_moneda, formGestion.cambio, value);
      setMontoBolivares(montoCalculado);
    }
    
    if (formErrors.flat) {
      setFormErrors(prev => ({ ...prev, flat: undefined }));
    }
  };

  const handleInteresPorcentajeChange = (value) => {
    setFormGestion(prev => ({ ...prev, interes_porcentaje: value }));
    
    if (formGestion.monto_moneda && value) {
      const devolvimientoCalculado = calcularDevolvimiento(formGestion.monto_moneda, value);
      setFormGestion(prev => ({ ...prev, devolvimiento: devolvimientoCalculado.toString() }));
    } else if (formGestion.monto_moneda && !value) {
      setFormGestion(prev => ({ ...prev, devolvimiento: formGestion.monto_moneda }));
    }
    
    if (formErrors.interes_porcentaje) {
      setFormErrors(prev => ({ ...prev, interes_porcentaje: undefined }));
    }
  };

  const handleNumeroCuotasChange = (value) => {
    setFormGestion(prev => ({ ...prev, numero_cuotas: value }));
    
    if (formGestion.inicio && value && configuracionContrato?.frecuencia_pago) {
      const fechaCierre = calcularFechaCierre(
        formGestion.inicio, 
        value, 
        configuracionContrato.frecuencia_pago
      );
      if (fechaCierre) {
        setFormGestion(prev => ({ ...prev, cierre: fechaCierre }));
      }
    }
    
    if (formErrors.numero_cuotas) {
      setFormErrors(prev => ({ ...prev, numero_cuotas: undefined }));
    }
  };

  const handleFechaInicioChange = (value) => {
    setFormGestion(prev => ({ ...prev, inicio: value }));
    
    if (value && formGestion.numero_cuotas && configuracionContrato?.frecuencia_pago) {
      const fechaCierre = calcularFechaCierre(
        value, 
        formGestion.numero_cuotas, 
        configuracionContrato.frecuencia_pago
      );
      if (fechaCierre) {
        setFormGestion(prev => ({ ...prev, cierre: fechaCierre }));
      }
    } else if (!value) {
      setFormGestion(prev => ({ ...prev, cierre: "" }));
    }
    
    if (formErrors.inicio) {
      setFormErrors(prev => ({ ...prev, inicio: undefined }));
    }
  };

  const filteredContracts = contractsData.filter(contract => {
    const searchFields = [
      contract.id_aprobacion?.toString(),
      contract.emprendedor,
      contract.estatus,
      contract.numero_contrato
    ].join(" ").toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         contract.estatus?.toLowerCase() === selectedFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

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

  const getActionButtons = (contract) => {
    const actions = [];

    actions.push(
      <button
        key="ver"
        onClick={() => verDetallesContrato(contract)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
        }`}
        title="Ver detalles del contrato"
      >
        <Eye size={14} />
        Ver
      </button>
    );

    if (contract.estatus === "Esperando contrato") {
      actions.push(
        <button
          key="gestionar"
          onClick={() => gestionarContrato(contract)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <FileText size={14} />
          Gestionar
        </button>
      );
    }

    if (contract.estatus === "Pendiente") {
      actions.push(
        <button
          key="desembolsar"
          onClick={() => abrirDesembolso(contract)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <CreditCard size={14} />
          Desembolsar
        </button>
      );
    }

    if (actions.length === 0) {
      return <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sin acciones</span>;
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
            {/* Encabezado */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Inicio</span>
                <ChevronRight size={14} />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Gestión de Contratos</span>
              </div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Gestión de Contratos</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Administración de contratos con manejo interno</p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {currentData?.stats?.map((stat) => (
                <div key={stat.id} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={stat.textColor} size={22} />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {loading ? <Loader2 size={24} className="animate-spin" /> : stat.value}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Tabla de contratos */}
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} shadow-sm overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Listado de Contratos</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filteredContracts.length} contratos encontrados</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Buscar por ID, emprendedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
                      />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-lg border ${showFilters ? 'bg-[#2A9D8F] text-white' : darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <Filter size={18} />
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estatus</label>
                        <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}>
                          <option value="all">Todos los estados</option>
                          <option value="activo">Activo</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="pendiente por desembolso">Pendiente por Desembolso</option>
                          <option value="esperando contrato">Esperando contrato</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button onClick={() => { setSelectedFilter("all"); setSearchTerm(""); setShowFilters(false); }} className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'} transition-colors text-sm`}>
                          Limpiar Filtros
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-[#2A9D8F] mb-4" />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cargando contratos...</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <p className={`text-lg font-medium ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>Error al cargar los datos</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{error}</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#238b7e] transition-colors">Reintentar</button>
                </div>
              )}

              {!loading && !error && currentItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <FileText size={48} className="text-gray-400 mb-4" />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No se encontraron contratos</p>
                </div>
              )}

              {!loading && !error && currentItems.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Aprobación</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Emprendedor</th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">N° Cuotas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Inicio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cierre</th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Estatus</th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {currentItems.map((contract) => (
                          <tr key={contract.id_aprobacion} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                            <td className="px-6 py-4 text-sm font-semibold text-[#2A9D8F]">#{contract.id_aprobacion}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                                  <User size={16} className={darkMode ? 'text-gray-300' : 'text-blue-600'} />
                                </div>
                                <div>
                                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{contract.emprendedor}</span>
                                  {contract.numero_contrato && <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contrato: {contract.numero_contrato}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {contract.numero_cuotas === "Sin definir" ? (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Sin definir</span>
                              ) : (
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>{contract.numero_cuotas}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {contract.inicio === "Sin definir" ? <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Sin definir</span> : contract.inicio}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {contract.cierre === "Sin definir" ? <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Sin definir</span> : contract.cierre}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">{getStatusComponent(contract)}</td>
                            <td className="px-6 py-4">{getActionButtons(contract)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredContracts.length)} de {filteredContracts.length} contratos
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-2 rounded-lg border ${currentPage === 1 ? (darkMode ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-gray-200 text-gray-300 cursor-not-allowed') : (darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}`}>
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-[#2A9D8F] text-white' : (darkMode ? 'text-gray-400 hover:bg-gray-700 border border-gray-600' : 'text-gray-600 hover:bg-gray-100 border border-gray-200')}`}>
                            {page}
                          </button>
                        ))}
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-2 rounded-lg border ${currentPage === totalPages ? (darkMode ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-gray-200 text-gray-300 cursor-not-allowed') : (darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}`}>
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

      {/* MODAL DE CONSULTA DE CONTRATO */}
      {showConsultaModal && selectedContractForConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowConsultaModal(false)} />
          <div className={`relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
                  <FileText size={24} className="text-[#2A9D8F]" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Detalles del Contrato</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Información completa del contrato</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConsultaModal(false)} 
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Encabezado con estado */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FileSignature size={32} className="text-[#2A9D8F]" />
                  </div>
                  <div>
                    <p className={`text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Número de Contrato</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.numero_contrato || 'No asignado'}
                    </p>
                  </div>
                </div>
                {(() => {
                  const statusInfo = STATUS_FLOW[selectedContractForConsulta.estatus];
                  if (!statusInfo) return null;
                  const IconComponent = statusInfo.icon;
                  return (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 ${statusInfo.bgColor} text-white rounded-lg text-sm font-medium`}>
                      <IconComponent size={14} />
                      {statusInfo.label}
                    </span>
                  );
                })()}
              </div>

              {/* Información del Emprendedor */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <User size={16} />
                  Información del Emprendedor
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nombre</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContractForConsulta.emprendedor}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID Aprobación</p>
                    <p className={`font-medium text-[#2A9D8F]`}>#{selectedContractForConsulta.id_aprobacion}</p>
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <DollarSign size={16} />
                  Información Financiera
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Moneda</p>
                    <p className={`font-medium uppercase ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.moneda ? getMonedaNombre(selectedContractForConsulta.moneda) : getMonedaNombre('usd')}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto en Moneda</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.monto_moneda ? 
                        `${selectedContractForConsulta.monto_moneda} ${selectedContractForConsulta.moneda?.toUpperCase() || 'USD'}` : 
                        'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasa de Cambio</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.cambio ? 
                        `${selectedContractForConsulta.cambio} Bs.` : 
                        'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Flat (%)</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.flat ? `${selectedContractForConsulta.flat}%` : 'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>% Interés</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.interes_porcentaje ? `${selectedContractForConsulta.interes_porcentaje}%` : 'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Devolvimiento</p>
                    <p className={`font-bold text-green-600 dark:text-green-400`}>
                      {selectedContractForConsulta.devolvimiento ? 
                        `${selectedContractForConsulta.devolvimiento} ${selectedContractForConsulta.moneda?.toUpperCase() || 'USD'}` : 
                        'No definido'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Plazo */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Calendar size={16} />
                  Información de Plazo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Número de Cuotas</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.numero_cuotas !== "Sin definir" ? 
                        `${selectedContractForConsulta.numero_cuotas} cuotas` : 
                        'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Frecuencia de Pago</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {configuracionContrato ? getFrecuenciaPagoTexto(configuracionContrato.frecuencia_pago) : 'No definida'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Inicio</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.inicio !== "Sin definir" ? 
                        selectedContractForConsulta.inicio : 
                        'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Cierre</p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedContractForConsulta.cierre !== "Sin definir" ? 
                        selectedContractForConsulta.cierre : 
                        'No definido'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de cierre */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowConsultaModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <X size={16} />
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GESTIÓN DE CONTRATO */}
      {showGestionModal && selectedContractForGestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={cerrarModalGestion} />
          <div className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Gestionar Contrato</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Complete los datos del contrato para el emprendedor</p>
              </div>
              <button onClick={cerrarModalGestion} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                <X size={22} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>

            {/* Información del Emprendedor y Configuración */}
            <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-blue-50 border border-blue-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                  <User size={24} className={darkMode ? 'text-gray-300' : 'text-blue-600'} />
                </div>
                <div>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContractForGestion.emprendedor}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID Aprobación: <span className="font-semibold text-[#2A9D8F]">#{selectedContractForGestion.id_aprobacion}</span></p>
                </div>
              </div>
              {configuracionContrato && (
                <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-blue-200'} text-sm`}>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Frecuencia de Pago:</span>
                      <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getFrecuenciaPagoTexto(configuracionContrato.frecuencia_pago)}</span>
                    </div>
                    <div>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuotas Obligatorias:</span>
                      <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{configuracionContrato.cuotas_obligatorias}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); confirmarGestion(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Número de Contrato - AUTOMÁTICO */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Número de Contrato <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <FileSignature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={formGestion.numero_contrato} 
                      readOnly 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'} focus:outline-none text-sm font-medium`} 
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

                {/* Información de moneda desde la configuración */}
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/30 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Moneda (Configuración)</label>
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-[#2A9D8F]" />
                    <span className={`text-lg font-semibold uppercase ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getMonedaNombre(formGestion.moneda)}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Moneda configurada en el sistema</p>
                </div>

                {/* Monto en Moneda */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monto en Moneda <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formGestion.monto_moneda} 
                      onChange={(e) => handleMontoMonedaChange(e.target.value)} 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${formErrors.monto_moneda ? 'border-red-500 focus:ring-red-500' : (darkMode ? 'border-gray-600 focus:ring-[#2A9D8F]' : 'border-gray-200 focus:ring-[#2A9D8F]')} ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'} focus:outline-none focus:ring-2 text-sm`} 
                      placeholder="0.00" 
                    />
                  </div>
                  {formErrors.monto_moneda && <p className="mt-1 text-xs text-red-500">{formErrors.monto_moneda}</p>}
                </div>

                {/* Cambio (Tasa) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cambio (Tasa) <span className="text-red-500">*</span>
                    {loadingTasas && (
                      <span className="ml-2 inline-flex items-center text-xs text-blue-500">
                        <Loader2 size={12} className="animate-spin mr-1" />
                        Actualizando...
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      step="0.0001" 
                      value={formGestion.cambio} 
                      onChange={(e) => handleCambioChange(e.target.value)} 
                      className={`w-full pl-10 pr-12 py-2.5 rounded-lg border ${formErrors.cambio ? 'border-red-500 focus:ring-red-500' : (darkMode ? 'border-gray-600 focus:ring-[#2A9D8F]' : 'border-gray-200 focus:ring-[#2A9D8F]')} ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'} focus:outline-none focus:ring-2 text-sm`} 
                      placeholder="0.0000" 
                    />
                    
                    {montoBolivares.neto > 0 && formGestion.monto_moneda && (
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                        Neto: Bs. {formatMonto(montoBolivares.neto)}
                      </div>
                    )}
                    
                    {(tasasCambio.dolares || tasasCambio.euros) && (
                      <button 
                        type="button" 
                        onClick={() => { 
                          const tasa = formGestion.moneda === 'usd' ? tasasCambio.dolares : formGestion.moneda === 'eur' ? tasasCambio.euros : null; 
                          if (tasa) handleCambioChange(tasa.toString()); 
                        }} 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                        title="Usar tasa actualizada"
                      >
                        <RefreshCw size={14} className="text-blue-500" />
                      </button>
                    )}
                  </div>
                  {formErrors.cambio && <p className="mt-1 text-xs text-red-500">{formErrors.cambio}</p>}
                  
                  <div className="mt-1 flex gap-4">
                    {tasasCambio.dolares && (
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        USD: {Number(tasasCambio.dolares).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                      </span>
                    )}
                    {tasasCambio.euros && (
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        EUR: {Number(tasasCambio.euros).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                      </span>
                    )}
                    {errorTasas && (
                      <span className="text-xs text-yellow-500">Usando tasas por defecto</span>
                    )}
                  </div>
                </div>

                {/* Flat */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Flat (%) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formGestion.flat} 
                      onChange={(e) => handleFlatChange(e.target.value)} 
                      className={`w-full pl-4 pr-10 py-2.5 rounded-lg border ${formErrors.flat ? 'border-red-500 focus:ring-red-500' : (darkMode ? 'border-gray-600 focus:ring-[#2A9D8F]' : 'border-gray-200 focus:ring-[#2A9D8F]')} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} focus:outline-none focus:ring-2 text-sm`} 
                      placeholder="0.00" 
                    />
                  </div>
                  {formErrors.flat && <p className="mt-1 text-xs text-red-500">{formErrors.flat}</p>}
                  {montoBolivares.flatMonto > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className={`p-1 rounded ${darkMode ? 'bg-red-900/50' : 'bg-red-50'}`}>
                        <TrendingUp size={12} className="text-red-500" />
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Descuento Flat: <span className="font-semibold">- Bs. {formatMonto(montoBolivares.flatMonto)}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* % Interés */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    % Interés <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formGestion.interes_porcentaje} 
                      onChange={(e) => handleInteresPorcentajeChange(e.target.value)} 
                      className={`w-full pl-4 pr-10 py-2.5 rounded-lg border ${formErrors.interes_porcentaje ? 'border-red-500 focus:ring-red-500' : (darkMode ? 'border-gray-600 focus:ring-[#2A9D8F]' : 'border-gray-200 focus:ring-[#2A9D8F]')} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} focus:outline-none focus:ring-2 text-sm`} 
                      placeholder="0.00" 
                    />
                  </div>
                  {formErrors.interes_porcentaje && <p className="mt-1 text-xs text-red-500">{formErrors.interes_porcentaje}</p>}
                  {formGestion.monto_moneda && formGestion.interes_porcentaje && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Interés calculado: {parseFloat(formGestion.monto_moneda) * (parseFloat(formGestion.interes_porcentaje) / 100)} {getMonedaNombre(formGestion.moneda)}
                    </p>
                  )}
                </div>

                {/* Devolvimiento */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Devolvimiento <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-green-600">(Monto + Interés)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formGestion.devolvimiento} 
                      readOnly
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'} focus:outline-none text-sm font-medium`} 
                      placeholder="Se calcula automáticamente" 
                    />
                  </div>
                </div>

                {/* Número de Cuotas */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de Cuotas <span className="text-red-500">*</span>
                    {configuracionContrato && (
                      <span className="ml-2 text-xs text-gray-500">(Config: {configuracionContrato.cuotas_obligatorias})</span>
                    )}
                  </label>
                  <input 
                    type="number" 
                    value={formGestion.numero_cuotas} 
                    onChange={(e) => handleNumeroCuotasChange(e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.numero_cuotas ? 'border-red-500 focus:ring-red-500' : (darkMode ? 'border-gray-600 focus:ring-[#2A9D8F]' : 'border-gray-200 focus:ring-[#2A9D8F]')} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} focus:outline-none focus:ring-2 text-sm`} 
                    placeholder="Ej: 12" 
                  />
                  {formErrors.numero_cuotas && <p className="mt-1 text-xs text-red-500">{formErrors.numero_cuotas}</p>}
                </div>

                {/* Frecuencia de Pago (solo lectura) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Frecuencia de Pago</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={configuracionContrato ? getFrecuenciaPagoTexto(configuracionContrato.frecuencia_pago) : "Cargando..."} 
                      readOnly
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'} focus:outline-none text-sm`} 
                    />
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    La fecha de cierre se calcula según esta frecuencia
                  </p>
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fecha de Inicio <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      value={formGestion.inicio} 
                      onChange={(e) => handleFechaInicioChange(e.target.value)} 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${formErrors.inicio ? 'border-red-500 focus:ring-red-500' : (darkMode ? 'border-gray-600 focus:ring-[#2A9D8F]' : 'border-gray-200 focus:ring-[#2A9D8F]')} ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} focus:outline-none focus:ring-2 text-sm`} 
                    />
                  </div>
                  {formErrors.inicio && <p className="mt-1 text-xs text-red-500">{formErrors.inicio}</p>}
                </div>

                {/* Fecha Cierre */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de Cierre <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-blue-500">(Calculada)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      value={formGestion.cierre} 
                      readOnly
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'} focus:outline-none text-sm font-medium`} 
                    />
                  </div>
                  {formGestion.inicio && formGestion.numero_cuotas && configuracionContrato?.frecuencia_pago && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Calculado: {formGestion.numero_cuotas} cuota(s) {getFrecuenciaPagoTexto(configuracionContrato.frecuencia_pago).toLowerCase()} desde {formGestion.inicio}
                    </p>
                  )}
                  {formErrors.cierre && <p className="mt-1 text-xs text-red-500">{formErrors.cierre}</p>}
                </div>
              </div>

              {/* Resumen del Contrato */}
              <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Resumen del Contrato</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contrato:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formGestion.numero_contrato || "—"}</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Moneda:</span>
                    <span className={`ml-2 font-medium uppercase ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getMonedaNombre(formGestion.moneda)}</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formGestion.monto_moneda || "0"} {getMonedaNombre(formGestion.moneda)}
                    </span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasa:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formGestion.cambio || "0"} Bs.</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>% Interés:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formGestion.interes_porcentaje || "0"}%</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Devolvimiento:</span>
                    <span className={`ml-2 font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formGestion.devolvimiento || "0"} {getMonedaNombre(formGestion.moneda)}
                    </span>
                  </div>
                  {montoBolivares.neto > 0 && (
                    <div className="col-span-2 md:col-span-3">
                      <div className="space-y-1 mt-2 p-3 rounded-lg bg-white dark:bg-gray-600">
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monto Bruto:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Bs. {formatMonto(montoBolivares.bruto)}
                          </span>
                        </div>
                        {montoBolivares.flatMonto > 0 && (
                          <div className="flex justify-between">
                            <span className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>Flat ({formGestion.flat}%):</span>
                            <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                              - Bs. {formatMonto(montoBolivares.flatMonto)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-500 pt-2 mt-2">
                          <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Total Neto:</span>
                          <span className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            Bs. {formatMonto(montoBolivares.neto)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuotas:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formGestion.numero_cuotas || "—"}</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Frecuencia:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{configuracionContrato ? getFrecuenciaPagoTexto(configuracionContrato.frecuencia_pago) : "—"}</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inicio:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formGestion.inicio || "—"}</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cierre:</span>
                    <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formGestion.cierre || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Error de submit */}
              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-sm text-red-600">{formErrors.submit}</p>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={cerrarModalGestion} 
                  disabled={submitting} 
                  className={`px-6 py-2.5 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors text-sm font-medium disabled:opacity-50`}
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

      {/* MODAL DE DESEMBOLSO */}
      {showDesembolsoModal && selectedContractForDesembolso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDesembolsoModal(false)} />
          <div className={`relative w-full max-w-lg mx-4 p-6 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Registrar Desembolso</h3>
              <button onClick={() => setShowDesembolsoModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); realizarDesembolso(); }}>
              <div className="space-y-4 mb-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-blue-50'}`}><User size={20} /></div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContractForDesembolso.emprendedor}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contrato {selectedContractForDesembolso.numero_contrato || `#${selectedContractForDesembolso.id_aprobacion}`}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuotas:</span><span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContractForDesembolso.numero_cuotas}</span></div>
                    <div><span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inicio:</span><span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContractForDesembolso.inicio}</span></div>
                    <div><span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cierre:</span><span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContractForDesembolso.cierre}</span></div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Referencia Bancaria <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" maxLength="6" value={formDesembolso.referencia_bancaria} onChange={(e) => handleDesembolsoChange('referencia_bancaria', e.target.value.toUpperCase())} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${desembolsoErrors.referencia_bancaria ? 'border-red-500' : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm uppercase`} placeholder="Ej: ABC123" />
                  </div>
                  {desembolsoErrors.referencia_bancaria && <p className="mt-1 text-xs text-red-500">{desembolsoErrors.referencia_bancaria}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monto Pagado <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input type="number" step="0.01" value={formDesembolso.monto_pagado} onChange={(e) => handleDesembolsoChange('monto_pagado', e.target.value)} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${desembolsoErrors.monto_pagado ? 'border-red-500' : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`} placeholder="0.00" />
                  </div>
                  {desembolsoErrors.monto_pagado && <p className="mt-1 text-xs text-red-500">{desembolsoErrors.monto_pagado}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fecha de Desembolso <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input type="date" value={formDesembolso.fecha_desembolso} onChange={(e) => handleDesembolsoChange('fecha_desembolso', e.target.value)} className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${desembolsoErrors.fecha_desembolso ? 'border-red-500' : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`} />
                  </div>
                  {desembolsoErrors.fecha_desembolso && <p className="mt-1 text-xs text-red-500">{desembolsoErrors.fecha_desembolso}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Observaciones</label>
                  <textarea rows={3} value={formDesembolso.observaciones} onChange={(e) => handleDesembolsoChange('observaciones', e.target.value)} className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`} placeholder="Observaciones adicionales..." />
                </div>

                {desembolsoErrors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <p className="text-sm text-red-600">{desembolsoErrors.submit}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowDesembolsoModal(false)} disabled={desembolsoSubmitting} className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors text-sm disabled:opacity-50`}>Cancelar</button>
                <button type="submit" disabled={desembolsoSubmitting} className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                  {desembolsoSubmitting ? <><Loader2 size={16} className="animate-spin" /> Procesando...</> : <><CreditCard size={16} /> Registrar Desembolso</>}
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