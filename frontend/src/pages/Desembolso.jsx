import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import {
  DollarSign,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Send,
  History,
  Upload,
  FileImage,
  Trash2,
  Hourglass,
  PlusCircle
} from "lucide-react";

// Componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import DesembolsoAPI from '../services/api_desembolso';
import { uploadToImgBB } from '../services/imgbbService';

const Desembolso = () => {
  const navigate = useNavigate();

  // ============================================================
  // ESTADOS - UI y navegación
  // ============================================================
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("disbursements");

  // ============================================================
  // ESTADOS - Filtros y paginación
  // ============================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);

  // ============================================================
  // ESTADOS - Datos principales (DESEMBOLSOS)
  // ============================================================
  const [disbursementsData, setDisbursementsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // ESTADOS - Modal Crear Desembolso
  // ============================================================
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [captureImage, setCaptureImage] = useState(null);
  const [capturePreview, setCapturePreview] = useState(null);
  const [formDesembolso, setFormDesembolso] = useState({
    id_cont: "",
    fecha_desembolso: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // ESTADOS - Modal Confirmación
  // ============================================================
  const [showConfirmacionModal, setShowConfirmacionModal] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState(null);
  const [confirmacionImage, setConfirmacionImage] = useState(null);
  const [confirmacionPreview, setConfirmacionPreview] = useState(null);
  const [confirmando, setConfirmando] = useState(false);

  // ============================================================
  // ESTADOS - Modal Detalle
  // ============================================================
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedDisbursementDetail, setSelectedDisbursementDetail] = useState(null);

  // ============================================================
  // ESTADOS - Modal Contratos Pendientes
  // ============================================================
  const [showContratosModal, setShowContratosModal] = useState(false);
  const [contratosPendientes, setContratosPendientes] = useState([]);
  const [loadingContratos, setLoadingContratos] = useState(false);

  // ============================================================
  // DATOS DEL USUARIO
  // ============================================================
  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Gestión de Créditos",
    joinDate: "Enero 2024",
    pendingTasks: 8,
    completedTasks: 45,
    performance: "98%",
  };

  // ============================================================
  // CONFIGURACIÓN DE ESTADOS
  // ============================================================
  const STATUS_CONFIG = {
    "Pendiente": {
      color: "orange",
      icon: Clock,
      bgColor: "bg-orange-500",
      label: "Pendiente"
    },
    "Confirmado": {
      color: "green",
      icon: CheckCircle,
      bgColor: "bg-green-500",
      label: "Confirmado"
    },
    "Rechazado": {
      color: "red",
      icon: X,
      bgColor: "bg-red-500",
      label: "Rechazado"
    }
  };

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================
  const getMonedaNombre = (tipoMoneda) => {
    switch (tipoMoneda?.toLowerCase()) {
      case "usd": return "USD";
      case "eur": return "EUR";
      default: return "VES";
    }
  };

  const formatMonto = (monto) => {
    if (!monto && monto !== 0) return "0.00";
    return Number(monto).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // ============================================================
  // FUNCIONES API
  // ============================================================

  // Obtener todos los desembolsos
  const fetchDesembolsos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DesembolsoAPI.getAll();
      if (response.data.success) {
        setDisbursementsData(response.data.data);
      } else {
        throw new Error(response.data.error || 'Error al cargar desembolsos');
      }
    } catch (error) {
      console.error('Error fetching disbursements:', error);
      setError(error.response?.data?.error || error.message || 'No se pudieron cargar los desembolsos');
      setDisbursementsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener contratos pendientes por desembolso
  const fetchContratosPendientes = async () => {
    try {
      setLoadingContratos(true);
      // Asumiendo que tienes un endpoint para obtener contratos pendientes
      const response = await DesembolsoAPI.getAll();
      if (response.data.success) {
        setContratosPendientes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contratos pendientes:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los contratos pendientes',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingContratos(false);
    }
  };

  // Verificar si un contrato ya tiene desembolso
  const verificarDesembolsoExistente = async (id_cont) => {
    try {
      const response = await DesembolsoAPI.getAll(`/verificar/${id_cont}`);
      return response.data.existe;
    } catch (error) {
      console.error('Error verificando desembolso:', error);
      return false;
    }
  };

  // ============================================================
// HANDLERS - Confirmar Desembolso Directo (desde el modal de detalle)
// ============================================================
const confirmarDesembolsoDirecto = async (disbursement) => {
  const result = await Swal.fire({
    title: 'Verifica ',
    icon: 'question',
    showDenyButton: true,      // Botón Rechazar
    showCancelButton: true,    // Botón Cerrar/Cancelar
    confirmButtonColor: '#15c933',
    denyButtonColor: '#e2230a',
    cancelButtonColor: '#8b8d91',
    confirmButtonText: 'Confirmar',
    denyButtonText: 'Rechazar',      // Texto del botón Rechazar
    cancelButtonText: ' Cerrar',      // Texto del botón Cerrar
    reverseButtons: false,
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f3f4f6' : '#1f2937'
  });

  if (result.isDenied) {
    // Usuario quiere adjuntar comprobante - abrimos el modal de confirmación
    setSelectedDisbursement(disbursement);
    setShowConfirmacionModal(true);
    setConfirmacionImage(null);
    setConfirmacionPreview(null);
    return;
  }

  if (!result.isConfirmed) return;

  // Confirmar sin comprobante
  setConfirmando(true);
  
  Swal.fire({
    title: 'Confirmando desembolso...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const confirmacionData = {
      fecha_confirmacion: new Date().toISOString().split("T")[0],
      capture_confirmacion: null // Sin comprobante
    };

    const response = await DesembolsoAPI.confirmarPago(disbursement.id_desembolso, confirmacionData);
    
    if (response.data.success) {
      setDisbursementsData(prev => 
        prev.map(d => 
          d.id_desembolso === disbursement.id_desembolso 
            ? { ...d, ...response.data.data }
            : d
        )
      );
      
      Swal.fire({
        title: '¡Desembolso confirmado! 🎉',
        text: 'El desembolso ha sido confirmado exitosamente.',
        icon: 'success',
        confirmButtonColor: '#2A9D8F',
        confirmButtonText: 'Continuar',
        timer: 3000,
        timerProgressBar: true
      });

      setNotifications((prev) => [
        { 
          id: Date.now(), 
          text: `✅ Desembolso #${disbursement.id_desembolso} confirmado exitosamente`, 
          time: "Ahora", 
          read: false,
          type: "success"
        },
        ...prev,
      ]);

      await fetchDesembolsos();
    } else {
      throw new Error(response.data.error || "Error al confirmar desembolso");
    }
  } catch (error) {
    console.error('Error confirmando desembolso:', error);
    Swal.fire({
      title: 'Error al confirmar desembolso',
      text: error.response?.data?.error || error.message || 'Ocurrió un error inesperado',
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  } finally {
    setConfirmando(false);
  }
};

  // ============================================================
  // HANDLERS - Crear Desembolso
  // ============================================================
  
  const abrirModalCrear = () => {
    setFormDesembolso({
      id_cont: "",
      fecha_desembolso: new Date().toISOString().split("T")[0]
    });
    setCaptureImage(null);
    setCapturePreview(null);
    setFormErrors({});
    setShowCrearModal(true);
  };

  const abrirModalSeleccionarContrato = async () => {
    await fetchContratosPendientes();
    setShowContratosModal(true);
  };

  const seleccionarContrato = (contrato) => {
    setFormDesembolso({
      id_cont: contrato.id_contrato,
      fecha_desembolso: new Date().toISOString().split("T")[0],
    });
    setShowContratosModal(false);
    setShowCrearModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormDesembolso(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Error',
          text: 'La imagen no puede superar los 5MB',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturePreview(reader.result);
        setCaptureImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formDesembolso.id_cont) {
      errors.id_cont = "Debe seleccionar un contrato";
    }
    if (!formDesembolso.fecha_desembolso) {
      errors.fecha_desembolso = "La fecha de desembolso es requerida";
    }
    if (!captureImage) {
      errors.capture_desembolso = "Debe adjuntar el comprobante de desembolso";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const registrarDesembolso = async () => {
    if (!validateForm()) return;

    // Verificar si ya existe desembolso
    const existe = await verificarDesembolsoExistente(formDesembolso.id_cont);
    if (existe) {
      Swal.fire({
        title: 'Error',
        text: 'Este contrato ya tiene un desembolso registrado',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Registrar desembolso?',
      html: `
        <div style="text-align: left;">
          <div style="background: ${darkMode ? '#374151' : '#f8f9fa'}; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>📄 ID Contrato:</strong> ${formDesembolso.id_cont}</p>
            <p style="margin: 5px 0;"><strong>📅 Fecha Desembolso:</strong> ${formatDate(formDesembolso.fecha_desembolso)}</p>
          </div>
          <p style="color: #e67e22; font-size: 13px; text-align: center;">⚠️ Una vez registrado, el desembolso quedará pendiente de confirmación.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2A9D8F',
      cancelButtonColor: '#d33',
      confirmButtonText: '✅ Sí, registrar desembolso',
      cancelButtonText: '❌ Cancelar',
      reverseButtons: true,
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937'
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    
    Swal.fire({
      title: 'Subiendo imagen y registrando desembolso...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 🆕 1. Subir imagen a ImgBB primero
      let imageUrl = null;
      if (captureImage) {
        try {
          const uploadResult = await uploadToImgBB(captureImage);
          imageUrl = uploadResult.url; // URL de la imagen en ImgBB
          console.log('✅ Imagen subida a ImgBB:', imageUrl);
        } catch (uploadError) {
          console.error('Error al subir imagen a ImgBB:', uploadError);
          throw new Error('Error al subir la imagen. Por favor, intente nuevamente.');
        }
      }

      // 🆕 2. Enviar datos del desembolso con la URL de la imagen
      const desembolsoData = {
        id_cont: formDesembolso.id_cont,
        fecha_desembolso: formDesembolso.fecha_desembolso,
        estatus_desembolso: 'Pendiente',
        capture_desembolso: imageUrl // URL de ImgBB en lugar del archivo
      };

      const response = await DesembolsoAPI.create(desembolsoData);
      
      if (response.data.success) {
        const newDesembolso = response.data.data;
        setDisbursementsData(prev => [newDesembolso, ...prev]);
        
        Swal.fire({
          title: '¡Desembolso registrado! 🎉',
          html: `
            Se ha registrado el desembolso exitosamente.<br/>
            <strong>Estado:</strong> Pendiente de confirmación<br/>
            Se notificará cuando sea confirmado.
          `,
          icon: 'success',
          confirmButtonColor: '#2A9D8F',
          confirmButtonText: 'Continuar',
          timer: 3000,
          timerProgressBar: true
        });

        setNotifications((prev) => [
          { 
            id: Date.now(), 
            text: `💰 Desembolso registrado para contrato #${formDesembolso.id_cont} - Pendiente de confirmación`, 
            time: "Ahora", 
            read: false,
            type: "success"
          },
          ...prev,
        ]);

        setShowCrearModal(false);
        resetFormDesembolso();
        await fetchDesembolsos();
      } else {
        throw new Error(response.data.error || "Error al registrar desembolso");
      }
    } catch (error) {
      console.error('Error registrando desembolso:', error);
      Swal.fire({
        title: 'Error al registrar desembolso',
        text: error.response?.data?.error || error.message || 'Ocurrió un error inesperado',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
      setFormErrors({ submit: error.response?.data?.error || "Error al guardar el desembolso" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetFormDesembolso = () => {
    setFormDesembolso({
      id_cont: "",
      fecha_desembolso: new Date().toISOString().split("T")[0],
    });
    setCaptureImage(null);
    setCapturePreview(null);
    setFormErrors({});
  };

  const cerrarModalCrear = () => {
    setShowCrearModal(false);
    resetFormDesembolso();
  };

  // ============================================================
  // HANDLERS - Confirmar Desembolso
  // ============================================================
  const abrirConfirmacion = (disbursement) => {
    setSelectedDisbursement(disbursement);
    setShowConfirmacionModal(true);
    setConfirmacionImage(null);
    setConfirmacionPreview(null);
  };

  const handleConfirmacionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Error',
          text: 'La imagen no puede superar los 5MB',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfirmacionPreview(reader.result);
        setConfirmacionImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmarDesembolso = async () => {
    const result = await Swal.fire({
      title: '¿Confirmar desembolso?',
      html: `
        <div style="text-align: left;">
          <p><strong>ID Desembolso:</strong> #${selectedDisbursement.id_desembolso}</p>
          <p><strong>ID Contrato:</strong> ${selectedDisbursement.id_cont}</p>
          <p><strong>Emprendedor:</strong> ${selectedDisbursement.emprendedor || 'No especificado'}</p>
          <p><strong>Monto:</strong> ${formatMonto(selectedDisbursement.monto)} ${getMonedaNombre(selectedDisbursement.moneda)}</p>
          <p><strong>Fecha Desembolso:</strong> ${formatDate(selectedDisbursement.fecha_desembolso)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2A9D8F',
      cancelButtonColor: '#d33',
      confirmButtonText: '✅ Sí, confirmar desembolso',
      cancelButtonText: '❌ Cancelar',
      background: darkMode ? '#1f2937' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937'
    });

    if (!result.isConfirmed) return;

    setConfirmando(true);
    
    Swal.fire({
      title: 'Subiendo imagen y confirmando desembolso...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 🆕 Subir imagen de confirmación a ImgBB si existe
      let confirmacionUrl = null;
      if (confirmacionImage) {
        try {
          const uploadResult = await uploadToImgBB(confirmacionImage);
          confirmacionUrl = uploadResult.url;
          console.log('✅ Imagen de confirmación subida a ImgBB:', confirmacionUrl);
        } catch (uploadError) {
          console.error('Error al subir imagen de confirmación:', uploadError);
          throw new Error('Error al subir la imagen de confirmación.');
        }
      }

      // 🆕 Enviar datos con URLs de ImgBB
      const confirmacionData = {
        fecha_confirmacion: new Date().toISOString().split("T")[0],
        capture_confirmacion: confirmacionUrl
      };

      const response = await DesembolsoAPI.confirmarPago(selectedDisbursement.id_desembolso, confirmacionData);
      
      if (response.data.success) {
        setDisbursementsData(prev => 
          prev.map(d => 
            d.id_desembolso === selectedDisbursement.id_desembolso 
              ? { ...d, ...response.data.data }
              : d
          )
        );
        
        Swal.fire({
          title: '¡Desembolso confirmado! 🎉',
          text: 'El desembolso ha sido confirmado exitosamente.',
          icon: 'success',
          confirmButtonColor: '#2A9D8F',
          confirmButtonText: 'Continuar'
        });

        setNotifications((prev) => [
          { 
            id: Date.now(), 
            text: `✅ Desembolso #${selectedDisbursement.id_desembolso} confirmado exitosamente`, 
            time: "Ahora", 
            read: false,
            type: "success"
          },
          ...prev,
        ]);

        setShowConfirmacionModal(false);
        setSelectedDisbursement(null);
        await fetchDesembolsos();
      } else {
        throw new Error(response.data.error || "Error al confirmar desembolso");
      }
    } catch (error) {
      console.error('Error confirmando desembolso:', error);
      Swal.fire({
        title: 'Error al confirmar desembolso',
        text: error.response?.data?.error || error.message || 'Ocurrió un error inesperado',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setConfirmando(false);
    }
  };

  // ============================================================
  // HANDLERS - Ver Detalle
  // ============================================================
  const verDetalleDesembolso = (disbursement) => {
    setSelectedDisbursementDetail(disbursement);
    setShowDetalleModal(true);
  };

  // ============================================================
  // EFECTOS
  // ============================================================
  useEffect(() => {
    fetchDesembolsos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".notifications-menu") && !e.target.closest(".user-menu")) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ============================================================
  // RENDER - Datos de sección y estadísticas
  // ============================================================
  const desembolsosPendientes = disbursementsData.filter(d => d.estatus_desembolso === "Pendiente").length;
  const desembolsosConfirmados = disbursementsData.filter(d => d.estatus_desembolso === "Confirmado").length;
  const totalDesembolsos = disbursementsData.length;

  const sectionData = {
    disbursements: {
      title: "Gestión de Desembolsos",
      description: "Administración de desembolsos a emprendedores",
      stats: [
        { id: 1, title: "Total Desembolsos", value: totalDesembolsos, icon: DollarSign, color: "blue", bgColor: "bg-blue-50", textColor: "text-blue-600" },
        { id: 2, title: "Desembolsos Pendientes", value: desembolsosPendientes, icon: Hourglass, color: "yellow", bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
        { id: 3, title: "Desembolsos Confirmados", value: desembolsosConfirmados, icon: CheckCircle, color: "green", bgColor: "bg-green-50", textColor: "text-green-600" },
      ],
    },
  };

  const currentData = sectionData.disbursements;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filtrado y paginación
  const filteredDisbursements = disbursementsData.filter((disbursement) => {
    const searchFields = [
      disbursement.id_desembolso?.toString(), 
      disbursement.id_cont?.toString(),
      disbursement.emprendedor || '',
      disbursement.numero_contrato || '',
    ].join(" ").toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === "pendientes") {
      matchesFilter = disbursement.estatus_desembolso === "Pendiente";
    } else if (selectedFilter === "confirmados") {
      matchesFilter = disbursement.estatus_desembolso === "Confirmado";
    }
    
    return matchesSearch && matchesFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDisbursements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDisbursements.length / itemsPerPage);

  // ============================================================
  // RENDER - Componentes de UI
  // ============================================================
  const getStatusComponent = (disbursement) => {
    const statusConfig = STATUS_CONFIG[disbursement.estatus_desembolso];
    if (!statusConfig) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg text-sm font-medium">
          <AlertCircle size={14} />
          {disbursement.estatus_desembolso}
        </span>
      );
    }
    const IconComponent = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 ${statusConfig.bgColor} text-white rounded-lg text-sm font-medium`}>
        <IconComponent size={14} />
        {statusConfig.label}
      </span>
    );
  };

  const getActionButtons = (disbursement) => {
    const actions = [];
    
    actions.push(
      <button
        key="ver"
        onClick={() => verDetalleDesembolso(disbursement)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
      >
        <Eye size={14} /> Ver Detalle
      </button>
    );
    
    return <div className="flex items-center justify-center gap-2 flex-wrap">{actions}</div>;
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("rememberToken");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
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
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
          <div className="p-4 md:p-6 mt-16">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>Inicio</span>
                <ChevronRight size={14} />
                <span className={darkMode ? "text-gray-300" : "text-gray-700"}>Gestión de Desembolsos</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Gestión de Desembolsos</h1>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Administración de desembolsos a emprendedores</p>
                </div>
                {/* Botón para crear nuevo desembolso */}
                <button
                  onClick={abrirModalSeleccionarContrato}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <PlusCircle size={18} />
                  Nuevo Desembolso
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {currentData?.stats?.map((stat) => (
                <div key={stat.id} className={`p-6 rounded-xl ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"} shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={stat.textColor} size={22} />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {loading ? <Loader2 size={24} className="animate-spin" /> : stat.value}
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.title}</p>
                </div>
              ))}
            </div>

            <div className={`rounded-xl ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"} shadow-sm overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Listado de Desembolsos</h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{filteredDisbursements.length} desembolsos encontrados</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Buscar por ID, contrato, emprendedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
                      />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-lg border ${showFilters ? "bg-[#2A9D8F] text-white" : darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <Filter size={18} />
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <div className={`mt-4 p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Estado de Desembolso</label>
                        <select
                          value={selectedFilter}
                          onChange={(e) => setSelectedFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200"} focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] text-sm`}
                        >
                          <option value="all">Todos los desembolsos</option>
                          <option value="pendientes">Pendientes</option>
                          <option value="confirmados">Confirmados</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSelectedFilter("all");
                            setSearchTerm("");
                            setShowFilters(false);
                          }}
                          className={`w-full px-4 py-2 rounded-lg border ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-100"} transition-colors text-sm`}
                        >
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
                  <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Cargando desembolsos...</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <p className={`text-lg font-medium ${darkMode ? "text-red-400" : "text-red-600"} mb-2`}>Error al cargar los datos</p>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>{error}</p>
                  <button onClick={() => fetchDesembolsos()} className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#238b7e] transition-colors">
                    Reintentar
                  </button>
                </div>
              )}

              {!loading && !error && currentItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                  <DollarSign size={48} className="text-gray-400 mb-4" />
                  <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No hay desembolsos registrados</p>
                  <button
                    onClick={abrirModalSeleccionarContrato}
                    className="mt-4 px-6 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#238b7e] transition-colors"
                  >
                    Registrar primer desembolso
                  </button>
                </div>
              )}

              {!loading && !error && currentItems.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Desembolso</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID Contrato</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Emprendedor</th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Monto</th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                        {currentItems.map((disbursement) => (
                          <tr key={disbursement.id_desembolso} className={`${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} transition-colors`}>
                            <td className="px-6 py-4 text-sm font-semibold text-[#2A9D8F]">
                              #{disbursement.id_desembolso}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {disbursement.id_cont}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                                  <User size={16} className={darkMode ? "text-gray-300" : "text-blue-600"} />
                                </div>
                                <div>
                                  <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                                    {disbursement.emprendedor || 'No especificado'}
                                  </div>
                                  {disbursement.numero_contrato && (
                                    <div className="text-xs text-gray-500">N° {disbursement.numero_contrato}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div>
                                <span className="font-bold">{formatMonto(disbursement.monto)}</span>
                                <span className="text-xs ml-1">{getMonedaNombre(disbursement.moneda)}</span>
                              </div>
                             </td>
                            <td className="px-6 py-4 text-center text-sm">
                              {formatDate(disbursement.fecha_desembolso)}
                             </td>
                            <td className="px-6 py-4 text-center">
                              {getStatusComponent(disbursement)}
                             </td>
                            <td className="px-6 py-4">
                              {getActionButtons(disbursement)}
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={`px-6 py-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredDisbursements.length)} de {filteredDisbursements.length} desembolsos
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-2 rounded-lg border ${currentPage === 1 ? (darkMode ? "border-gray-600 text-gray-600 cursor-not-allowed" : "border-gray-200 text-gray-300 cursor-not-allowed") : (darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}`}>
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                          <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? "bg-[#2A9D8F] text-white" : (darkMode ? "text-gray-400 hover:bg-gray-700 border border-gray-600" : "text-gray-600 hover:bg-gray-100 border border-gray-200")}`}>
                            {page}
                          </button>
                        ))}
                        {totalPages > 5 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-2 rounded-lg border ${currentPage === totalPages ? (darkMode ? "border-gray-600 text-gray-600 cursor-not-allowed" : "border-gray-200 text-gray-300 cursor-not-allowed") : (darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50")}`}>
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

      {/* MODAL CREAR DESEMBOLSO */}
      {showCrearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={cerrarModalCrear} />
          <div className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? "bg-emerald-900/50" : "bg-emerald-50"}`}>
                  <Send size={24} className="text-[#2A9D8F]" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Registrar Desembolso</h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Complete la información del desembolso</p>
                </div>
              </div>
              <button onClick={cerrarModalCrear} className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}>
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); registrarDesembolso(); }}>
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      ID del Contrato <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formDesembolso.id_cont}
                      onChange={(e) => handleInputChange("id_cont", e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.id_cont ? "border-red-500 focus:ring-red-500" : (darkMode ? "border-gray-600 focus:ring-[#2A9D8F]" : "border-gray-200 focus:ring-[#2A9D8F]")} ${darkMode ? "bg-gray-700 text-white" : "bg-white"} focus:outline-none focus:ring-2 text-sm`}
                      placeholder="Ej: 1, 2, 3..."
                      type="number"
                    />
                    {formErrors.id_cont && <p className="mt-1 text-xs text-red-500">{formErrors.id_cont}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Fecha de Desembolso <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={formDesembolso.fecha_desembolso}
                        onChange={(e) => handleInputChange("fecha_desembolso", e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${formErrors.fecha_desembolso ? "border-red-500 focus:ring-red-500" : (darkMode ? "border-gray-600 focus:ring-[#2A9D8F]" : "border-gray-200 focus:ring-[#2A9D8F]")} ${darkMode ? "bg-gray-700 text-white" : "bg-white"} focus:outline-none focus:ring-2 text-sm`}
                      />
                    </div>
                    {formErrors.fecha_desembolso && <p className="mt-1 text-xs text-red-500">{formErrors.fecha_desembolso}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Comprobante de Desembolso <span className="text-red-500">*</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${capturePreview ? (darkMode ? "border-emerald-500 bg-emerald-900/20" : "border-emerald-500 bg-emerald-50") : (darkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400")} transition-colors cursor-pointer`}
                         onClick={() => document.getElementById("captureInput").click()}>
                      {capturePreview ? (
                        <div className="space-y-3">
                          <img src={capturePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                          <div className="flex items-center justify-center gap-2">
                            <FileImage size={16} className="text-emerald-500" />
                            <span className="text-sm text-emerald-500">Imagen cargada exitosamente</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCaptureImage(null);
                              setCapturePreview(null);
                            }}
                            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload size={48} className="mx-auto text-gray-400" />
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Haz clic para subir el comprobante
                          </p>
                          <p className="text-xs text-gray-500">Formatos: JPG, PNG, PDF (máx. 5MB)</p>
                        </div>
                      )}
                      <input
                        id="captureInput"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    {formErrors.capture_desembolso && <p className="mt-1 text-xs text-red-500">{formErrors.capture_desembolso}</p>}
                  </div>

                  {formErrors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500" />
                      <p className="text-sm text-red-600">{formErrors.submit}</p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={cerrarModalCrear} disabled={submitting} className={`px-6 py-2.5 rounded-lg border ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"} transition-colors text-sm font-medium disabled:opacity-50`}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Registrando...</> : <><Send size={16} /> Registrar Desembolso</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE DESEMBOLSO */}
      {showConfirmacionModal && selectedDisbursement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConfirmacionModal(false)} />
          <div className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? "bg-green-900/50" : "bg-green-50"}`}>
                  <CheckCircle size={24} className="text-green-500" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Confirmar Desembolso</h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Confirme el desembolso para completar el proceso</p>
                </div>
              </div>
              <button onClick={() => setShowConfirmacionModal(false)} className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}>
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-700/50 border border-gray-600" : "bg-yellow-50 border border-yellow-100"}`}>
                <div className="flex items-center gap-3">
                  <Clock size={24} className="text-yellow-500" />
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Este desembolso está pendiente de confirmación
                    </p>
                    <p className="text-xs text-yellow-600">Al confirmar, el desembolso quedará como confirmado</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                  <h4 className="text-sm font-semibold mb-3">Información del Desembolso</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={darkMode ? "text-gray-400" : "text-gray-500"}>ID Desembolso:</span>
                      <p className="font-semibold">#{selectedDisbursement.id_desembolso}</p>
                    </div>
                    <div>
                      <span className={darkMode ? "text-gray-400" : "text-gray-500"}>ID Contrato:</span>
                      <p>{selectedDisbursement.id_cont}</p>
                    </div>
                    <div>
                      <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Emprendedor:</span>
                      <p>{selectedDisbursement.emprendedor || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Monto:</span>
                      <p>{formatMonto(selectedDisbursement.monto)} {getMonedaNombre(selectedDisbursement.moneda)}</p>
                    </div>
                    <div>
                      <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Fecha:</span>
                      <p>{formatDate(selectedDisbursement.fecha_desembolso)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Comprobante de Confirmación (opcional)
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${confirmacionPreview ? (darkMode ? "border-emerald-500 bg-emerald-900/20" : "border-emerald-500 bg-emerald-50") : (darkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400")} transition-colors cursor-pointer`}
                       onClick={() => document.getElementById("confirmacionInput").click()}>
                    {confirmacionPreview ? (
                      <div className="space-y-3">
                        <img src={confirmacionPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <div className="flex items-center justify-center gap-2">
                          <FileImage size={16} className="text-emerald-500" />
                          <span className="text-sm text-emerald-500">Imagen cargada exitosamente</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmacionImage(null);
                            setConfirmacionPreview(null);
                          }}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={48} className="mx-auto text-gray-400" />
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Haz clic para subir el comprobante de confirmación
                        </p>
                        <p className="text-xs text-gray-500">Formatos: JPG, PNG, PDF (máx. 5MB)</p>
                      </div>
                    )}
                    <input
                      id="confirmacionInput"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleConfirmacionImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button onClick={() => setShowConfirmacionModal(false)} disabled={confirmando} className={`px-6 py-2.5 rounded-lg border ${darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"} transition-colors text-sm font-medium disabled:opacity-50`}>
                    Cancelar
                  </button>
                  <button onClick={confirmarDesembolso} disabled={confirmando} className="px-6 py-2.5 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                    {confirmando ? <><Loader2 size={16} className="animate-spin" /> Confirmando...</> : <><CheckCircle size={16} /> Confirmar Desembolso</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE DESEMBOLSO */}
      {showDetalleModal && selectedDisbursementDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDetalleModal(false)} />
          <div className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? "bg-blue-900/50" : "bg-blue-50"}`}>
                  <Eye size={24} className="text-[#2A9D8F]" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Detalle del Desembolso</h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    #{selectedDisbursementDetail.id_desembolso} - {selectedDisbursementDetail.emprendedor || 'Sin especificar'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowDetalleModal(false)} className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}>
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>ID Desembolso</p>
                      <p className="font-semibold">#{selectedDisbursementDetail.id_desembolso}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>ID Contrato</p>
                      <p>{selectedDisbursementDetail.id_cont}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Emprendedor</p>
                      <p>{selectedDisbursementDetail.emprendedor || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Monto</p>
                      <p className="font-bold text-[#2A9D8F]">{formatMonto(selectedDisbursementDetail.monto)} {getMonedaNombre(selectedDisbursementDetail.moneda)}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fecha de Desembolso</p>
                      <p>{formatDate(selectedDisbursementDetail.fecha_desembolso)}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Estado</p>
                      {getStatusComponent(selectedDisbursementDetail)}
                    </div>
                    {selectedDisbursementDetail.fecha_confirmacion && (
                      <div>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fecha de Confirmación</p>
                        <p>{formatDate(selectedDisbursementDetail.fecha_confirmacion)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección de comprobantes - Ahora muestra las imágenes directamente */}
                {(selectedDisbursementDetail.capture_desembolso || selectedDisbursementDetail.capture_confirmacion) && (
                  <div className="space-y-4">
                    {selectedDisbursementDetail.capture_desembolso && (
                      <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          <FileImage size={16} className="text-blue-500" />
                          Comprobante de Desembolso
                        </h4>
                        <div className={`rounded-lg overflow-hidden border ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                          <img 
                            src={selectedDisbursementDetail.capture_desembolso} 
                            alt="Comprobante de desembolso"
                            className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTAwIDEwMEM4OC45NTQzIDEwMCA4MCAxMDguOTU0IDgwIDEyMEM4MCAxMzEuMDQ2IDg4Ljk1NDMgMTQwIDEwMCAxNDBDMTExLjA0NiAxNDAgMTIwIDEzMS4wNDYgMTIwIDEyMEMxMjAgMTA4Ljk1NCAxMTEuMDQ2IDEwMCAxMDAgMTAwWk04MiAxMjBDODIgMTEwLjA1OCA5MC4wNTggMTAyIDEwMCAxMDJDMTEwLjA0MiAxMDIgMTE4IDExMC4wNTggMTE4IDEyMEMxMTggMTI5Ljk0MiAxMTAuMDQyIDEzOCAxMDAgMTM4QzkwLjA1OCAxMzggODIgMTI5Ljk0MiA4MiAxMjBaIiBmaWxsPSIjOUM5RkE2Ii8+PHBhdGggZD0iTTEwMCA2NEM4Mi4zMjcgNjQgNjggNzguMzI3IDY4IDk2QzY4IDExMy42NzMgODIuMzI3IDEyOCAxMDAgMTI4QzExNy42NzMgMTI4IDEzMiAxMTMuNjczIDEzMiA5NkMxMzIgNzguMzI3IDExNy42NzMgNjQgMTAwIDY0Wk03MCA5NkM3MCA3OS40MzEgODMuNDMxIDY2IDEwMCA2NkMxMTYuNTY5IDY2IDEzMCA3OS40MzEgMTMwIDk2QzEzMCAxMTIuNTY5IDExNi41NjkgMTI2IDEwMCAxMjZDODMuNDMxIDEyNiA3MCAxMTIuNTY5IDcwIDk2WiIgZmlsbD0iIzlDOUZBNiIvPjwvc3ZnPg==';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedDisbursementDetail.capture_confirmacion && (
                      <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          <FileImage size={16} className="text-emerald-500" />
                          Comprobante de Confirmación
                        </h4>
                        <div className={`rounded-lg overflow-hidden border ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                          <img 
                            src={selectedDisbursementDetail.capture_confirmacion} 
                            alt="Comprobante de confirmación"
                            className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTAwIDEwMEM4OC45NTQzIDEwMCA4MCAxMDguOTU0IDgwIDEyMEM4MCAxMzEuMDQ2IDg4Ljk1NDMgMTQwIDEwMCAxNDBDMTExLjA0NiAxNDAgMTIwIDEzMS4wNDYgMTIwIDEyMEMxMjAgMTA4Ljk1NCAxMTEuMDQ2IDEwMCAxMDAgMTAwWk04MiAxMjBDODIgMTEwLjA1OCA5MC4wNTggMTAyIDEwMCAxMDJDMTEwLjA0MiAxMDIgMTE4IDExMC4wNTggMTE4IDEyMEMxMTggMTI5Ljk0MiAxMTAuMDQyIDEzOCAxMDAgMTM4QzkwLjA1OCAxMzggODIgMTI5Ljk0MiA4MiAxMjBaIiBmaWxsPSIjOUM5RkE2Ii8+PHBhdGggZD0iTTEwMCA2NEM4Mi4zMjcgNjQgNjggNzguMzI3IDY4IDk2QzY4IDExMy42NzMgODIuMzI3IDEyOCAxMDAgMTI4QzExNy42NzMgMTI4IDEzMiAxMTMuNjczIDEzMiA5NkMxMzIgNzguMzI3IDExNy42NzMgNjQgMTAwIDY0Wk03MCA5NkM3MCA3OS40MzEgODMuNDMxIDY2IDEwMCA2NkMxMTYuNTY5IDY2IDEzMCA3OS40MzEgMTMwIDk2QzEzMCAxMTIuNTY5IDExNi41NjkgMTI2IDEwMCAxMjZDODMuNDMxIDEyNiA3MCAxMTIuNTY5IDcwIDk2WiIgZmlsbD0iIzlDOUZBNiIvPjwvc3ZnPg==';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedDisbursementDetail.estatus_desembolso === "Pendiente" && (
                  <button
                    onClick={() => {
                      setShowDetalleModal(false);
                      // Llamar directamente a confirmarDesembolso2 con Swal
                      confirmarDesembolsoDirecto(selectedDisbursementDetail);
                    }}
                    className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center gap-2 text-sm font-medium mr-3"
                  >
                    <CheckCircle size={16} /> Confirmar Desembolso
                  </button>
                )}
                <button onClick={() => setShowDetalleModal(false)} className="px-6 py-2.5 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SELECCIÓN DE CONTRATOS PENDIENTES */}
      {showContratosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowContratosModal(false)} />
          <div className={`relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? "bg-blue-900/50" : "bg-blue-50"}`}>
                  <FileText size={24} className="text-[#2A9D8F]" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Seleccionar Contrato</h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Seleccione un contrato para registrar el desembolso
                  </p>
                </div>
              </div>
              <button onClick={() => setShowContratosModal(false)} className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}>
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              {loadingContratos ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-[#2A9D8F] mb-4" />
                  <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Cargando contratos...</p>
                </div>
              ) : contratosPendientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FileText size={48} className="text-gray-400 mb-4" />
                  <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No hay contratos pendientes por desembolso</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">N° Contrato</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Emprendedor</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
                       </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                      {contratosPendientes.map((contrato) => (
                        <tr key={contrato.id_contrato} className={`${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} transition-colors`}>
                          <td className="px-4 py-3 text-sm">#{contrato.id_contrato}</td>
                          <td className="px-4 py-3 text-sm font-medium">{contrato.numero_contrato}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-400" />
                              <span className="text-sm">{contrato.emprendedor_nombre || 'No especificado'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold">{formatMonto(contrato.monto_moneda)}</span>
                            <span className="text-xs ml-1">{getMonedaNombre(contrato.moneda)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => seleccionarContrato(contrato)}
                              className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-sm hover:bg-[#238b7e] transition-colors flex items-center gap-1 mx-auto"
                            >
                              <PlusCircle size={14} /> Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desembolso;