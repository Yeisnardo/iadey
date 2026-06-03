import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardCheck,
  User,
  Mail,
  FileCheck,
  FileX,
  Loader,
  Filter,
  Info,
  RefreshCw,
  Image,
  Building2,
  CreditCard,
  SearchIcon,
  ThumbsUp,
  ThumbsDown,
  Circle,
  ArrowRight,
} from "lucide-react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import aprobacionAPI from "../services/api_aprobacion";
import requisitosAPI from "../services/api_requisitos";
import inspeccionAPI from "../services/api_inspeccion";
import { uploadMultipleToImgBB, uploadToImgBB } from "../services/imgbbService";

import InspectionFormCompleto from "../components/InspectionFormCompleto";
import Inspeccion2 from "../components/inspeccion2";

const Aprobacion = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Nueva aprobación pendiente de revisión",
      time: "5 min",
      read: false,
    },
    {
      id: 2,
      text: "Inspección de emprendimiento programada",
      time: "1 hora",
      read: false,
    },
    {
      id: 3,
      text: "Solicitud de crédito en revisión",
      time: "3 horas",
      read: true,
    },
    { id: 4, text: "Contrato listo para firma", time: "1 día", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("aprobaciones");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [aprobaciones, setAprobaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAprobacion, setSelectedAprobacion] = useState(null);

  const [showVerificacionModal, setShowVerificacionModal] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);
  const [requisitosExpediente, setRequisitosExpediente] = useState([]);
  const [loadingRequisitos, setLoadingRequisitos] = useState(false);
  const [savingRequisitos, setSavingRequisitos] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [seleccionManejo, setSeleccionManejo] = useState("");
  const [idInspeccion, setIdInspeccion] = useState("");

  // Estados para el estatus de la solicitud de crédito y la inspección
  const [estatusCredito, setEstatusCredito] = useState("");
  const [estatusInspeccion, setEstatusInspeccion] = useState("");

  // Definir los pasos del progreso - NUEVO ORDEN: Requisitos → Inspección → Crédito → Tipo de Manejo
  const pasosProgreso = [
    { id: 1, nombre: "Verificación de Requisitos", icono: ClipboardCheck },
    { id: 2, nombre: "Inspección de Emprendimiento", icono: SearchIcon },
    { id: 3, nombre: "Decisión Final de Crédito", icono: CreditCard },
    { id: 4, nombre: "Tipo de Manejo", icono: Building2 },
  ];

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

  // Cargar aprobaciones (expedientes)
  const loadAprobaciones = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Cargando expedientes...");
      const response = await aprobacionAPI.getAll();

      if (response.success) {
        console.log("Expedientes cargados:", response.data.length);
        setAprobaciones(response.data);
      } else {
        setError(response.error || "Error desconocido al cargar expedientes");
      }
    } catch (err) {
      console.error("Error completo:", err);
      setError("Error de conexión al cargar los expedientes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función mejorada para obtener las imágenes de un requisito específico
  const obtenerImagenesRequisito = (aprobacion, requisitoId) => {
    if (!aprobacion || !requisitoId) {
      console.log("⚠️ obtenerImagenesRequisito: faltan datos", { aprobacion, requisitoId });
      return [];
    }

    console.log("🔍 Buscando imágenes para requisito ID:", requisitoId);
    console.log("📦 Estructura completa de aprobacion:", JSON.stringify(aprobacion, null, 2));

    const parseJSON = (data) => {
      if (!data) return null;
      if (typeof data === 'object') return data;
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    // 1. Revisar urls_imagenes en el expediente
    if (aprobacion.expediente?.urls_imagenes) {
      console.log("📁 Revisando expediente.urls_imagenes:", aprobacion.expediente.urls_imagenes);
      let urlsImagenes = parseJSON(aprobacion.expediente.urls_imagenes);
      if (urlsImagenes) {
        const imagenesRequisito = urlsImagenes[String(requisitoId)];
        if (imagenesRequisito && (Array.isArray(imagenesRequisito) || typeof imagenesRequisito === 'string')) {
          console.log(`✅ Imágenes encontradas en expediente.urls_imagenes[${requisitoId}]:`, imagenesRequisito);
          return Array.isArray(imagenesRequisito) ? imagenesRequisito : [imagenesRequisito];
        }
      }
    }

    // 2. Revisar documentos en el expediente
    if (aprobacion.expediente?.documentos) {
      console.log("📁 Revisando expediente.documentos:", aprobacion.expediente.documentos);
      let documentos = parseJSON(aprobacion.expediente.documentos);
      if (documentos) {
        const imagenesRequisito = documentos[String(requisitoId)];
        if (imagenesRequisito && (Array.isArray(imagenesRequisito) || typeof imagenesRequisito === 'string')) {
          console.log(`✅ Imágenes encontradas en expediente.documentos[${requisitoId}]:`, imagenesRequisito);
          return Array.isArray(imagenesRequisito) ? imagenesRequisito : [imagenesRequisito];
        }
      }
    }

    // 3. Revisar urls_imagenes directamente
    if (aprobacion.urls_imagenes) {
      console.log("📁 Revisando urls_imagenes directo:", aprobacion.urls_imagenes);
      let urlsImagenes = parseJSON(aprobacion.urls_imagenes);
      if (urlsImagenes) {
        const imagenesRequisito = urlsImagenes[String(requisitoId)];
        if (imagenesRequisito && (Array.isArray(imagenesRequisito) || typeof imagenesRequisito === 'string')) {
          console.log(`✅ Imágenes encontradas en urls_imagenes[${requisitoId}]:`, imagenesRequisito);
          return Array.isArray(imagenesRequisito) ? imagenesRequisito : [imagenesRequisito];
        }
      }
    }

    // 4. Revisar documentos directamente
    if (aprobacion.documentos) {
      console.log("📁 Revisando documentos directo:", aprobacion.documentos);
      let documentos = parseJSON(aprobacion.documentos);
      if (documentos) {
        const imagenesRequisito = documentos[String(requisitoId)];
        if (imagenesRequisito && (Array.isArray(imagenesRequisito) || typeof imagenesRequisito === 'string')) {
          console.log(`✅ Imágenes encontradas en documentos[${requisitoId}]:`, imagenesRequisito);
          return Array.isArray(imagenesRequisito) ? imagenesRequisito : [imagenesRequisito];
        }
      }
    }

    // 5. Buscar recursivamente
    const buscarRecursivo = (obj, profundidad = 0) => {
      if (profundidad > 4 || !obj || typeof obj !== "object") return null;
      
      const directMatch = obj[String(requisitoId)];
      if (directMatch && (Array.isArray(directMatch) || typeof directMatch === 'string')) {
        return Array.isArray(directMatch) ? directMatch : [directMatch];
      }
      
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const resultado = buscarRecursivo(value, profundidad + 1);
          if (resultado) return resultado;
        }
        if (Array.isArray(value) && value.length > 0) {
          if (value.some(item => typeof item === 'string' && (item.startsWith('http') || item.startsWith('https')))) {
            console.log(`🔍 Posible array de imágenes encontrado en ${key}:`, value);
            if (key.includes(String(requisitoId)) || String(requisitoId).includes(key)) {
              return value;
            }
          }
        }
      }
      return null;
    };

    const resultadoBusqueda = buscarRecursivo(aprobacion);
    if (resultadoBusqueda && resultadoBusqueda.length > 0) {
      console.log(`✅ Imágenes encontradas mediante búsqueda recursiva:`, resultadoBusqueda);
      return resultadoBusqueda;
    }

    console.log(`❌ No se encontraron imágenes para el requisito ID: ${requisitoId}`);
    return [];
  };

  // Cargar todos los requisitos disponibles
  const loadTodosRequisitos = async () => {
    try {
      const response = await requisitosAPI.getAll();
      if (response.success) {
        const requisitosFormateados = response.data.map((req) => ({
          id_requisito: req.id_requisitos || req.id_requisito,
          nombre: req.nombre_requisito || req.nombre,
          descripcion: req.descripcion || "",
          estado_verificacion: "pendiente",
          observacion_no_valido: "",
        }));
        return requisitosFormateados;
      }
      return [];
    } catch (err) {
      console.error("Error al cargar requisitos:", err);
      return [];
    }
  };

  // Calcular el paso actual del progreso - NUEVO ORDEN
  const calcularPasoActual = () => {
    const progresoRequisitos = calcularProgreso(requisitosExpediente);
    
    if (requisitosExpediente.length === 0) return 1;
    if (progresoRequisitos < 100) return 1;           // Paso 1: Verificación de Requisitos
    if (!estatusInspeccion) return 2;                 // Paso 2: Inspección de Emprendimiento
    if (!estatusCredito) return 3;                    // Paso 3: Decisión Final de Crédito
    if (!seleccionManejo) return 4;                   // Paso 4: Tipo de Manejo
    return 4; // Completado
  };

  // Calcular el porcentaje de progreso general
  const calcularProgresoGeneral = () => {
    const pasoActual = calcularPasoActual();
    const progresoRequisitos = calcularProgreso(requisitosExpediente);
    
    // Cada paso completado = 25%
    let progreso = 0;
    
    // Paso 1: Verificación de requisitos (0-25%)
    if (pasoActual === 1) {
      progreso = (progresoRequisitos / 100) * 25;
    } 
    else {
      progreso = 25; // Paso 1 completado
      
      // Paso 2: Inspección (25-50%)
      if (pasoActual === 2) {
        progreso += estatusInspeccion ? 25 : 0;
      }
      else {
        progreso += 25; // +25 = 50% (Paso 2 completado)
        
        // Paso 3: Decisión de crédito (50-75%)
        if (pasoActual === 3) {
          progreso += estatusCredito ? 25 : 0;
        }
        else {
          progreso += 25; // +25 = 75% (Paso 3 completado)
          
          // Paso 4: Tipo de manejo (75-100%)
          if (pasoActual === 4) {
            progreso += seleccionManejo ? 25 : 0;
          }
        }
      }
    }
    
    return Math.min(Math.round(progreso), 100);
  };

  // Verificar si un paso está completado
  const isPasoCompletado = (pasoId) => {
    switch(pasoId) {
      case 1: // Verificación de requisitos
        return calcularProgreso(requisitosExpediente) === 100;
      case 2: // Inspección
        return calcularProgreso(requisitosExpediente) === 100 && 
               estatusInspeccion !== "";
      case 3: // Decisión final de crédito
        return calcularProgreso(requisitosExpediente) === 100 && 
               estatusInspeccion !== "" && 
               estatusCredito !== "";
      case 4: // Tipo de manejo
        return calcularProgreso(requisitosExpediente) === 100 && 
               estatusInspeccion !== "" && 
               estatusCredito !== "" && 
               seleccionManejo !== "";
      default:
        return false;
    }
  };

  // Verificar si un paso está activo
  const isPasoActivo = (pasoId) => {
    return calcularPasoActual() === pasoId;
  };

  // Abrir modal de detalle
  const handleOpenDetail = (aprobacion) => {
    setSelectedAprobacion(aprobacion);
    setShowDetailModal(true);
  };

  // Abrir modal de verificación
  const handleOpenVerificacion = async (aprobacion) => {
    setSelectedAprobacion(aprobacion);
    setObservaciones(aprobacion.observaciones || "");
    setSeleccionManejo(aprobacion.seleccion_manejo || "");
    setIdInspeccion(
      aprobacion.id_inspeccion
        ? aprobacion.id_inspeccion.toString()
        : aprobacion.id_expediente.toString(),
    );
    
    // Cargar estados existentes
    setEstatusCredito(aprobacion.estatus_aprobacion || "");
    setEstatusInspeccion(aprobacion.estatus_inspeccion || "");
    
    setLoadingRequisitos(true);

    try {
      console.log("Abriendo verificación para expediente:", aprobacion.id_expediente);
      console.log("Datos completos de aprobacion:", aprobacion);

      let datosCompletos = { ...aprobacion };
      
      if (aprobacion.id_expediente && !aprobacion.expediente?.documentos) {
        try {
          console.log("Intentando cargar datos completos del expediente...");
          const responseExpediente = await aprobacionAPI.getById(aprobacion.id_expediente);
          if (responseExpediente.success && responseExpediente.data) {
            console.log("Datos del expediente cargados:", responseExpediente.data);
            datosCompletos = {
              ...datosCompletos,
              ...responseExpediente.data,
              expediente: {
                ...datosCompletos.expediente,
                ...responseExpediente.data.expediente,
              }
            };
          }
        } catch (err) {
          console.error("Error al cargar datos del expediente:", err);
        }
      }

      setSelectedAprobacion(datosCompletos);

      if (
        datosCompletos.verificacion_requisitos &&
        Array.isArray(datosCompletos.verificacion_requisitos) &&
        datosCompletos.verificacion_requisitos.length > 0
      ) {
        console.log("Usando requisitos ya verificados");
        const requisitosActualizados = datosCompletos.verificacion_requisitos.map(req => ({
          ...req,
          estado_verificacion: req.estado_verificacion || (req.verificado ? 'verificado' : 'pendiente'),
          observacion_no_valido: req.observacion_no_valido || '',
        }));
        setRequisitosExpediente(requisitosActualizados);
      }
      else if (
        datosCompletos.requisitos_expediente &&
        Array.isArray(datosCompletos.requisitos_expediente) &&
        datosCompletos.requisitos_expediente.length > 0
      ) {
        console.log("Usando requisitos del expediente");
        const requisitosConEstado = datosCompletos.requisitos_expediente.map(
          (req) => ({
            ...req,
            estado_verificacion: "pendiente",
            observacion_no_valido: "",
          }),
        );
        setRequisitosExpediente(requisitosConEstado);
      }
      else {
        console.log("Cargando todos los requisitos");
        const requisitos = await loadTodosRequisitos();
        setRequisitosExpediente(requisitos);
      }

      setShowVerificacionModal(true);
    } catch (err) {
      console.error("Error al abrir modal de verificación:", err);
      alert("Error al cargar los requisitos");
    } finally {
      setLoadingRequisitos(false);
    }
  };

  // Cerrar modales
  const handleCloseModals = () => {
    setShowDetailModal(false);
    setShowVerificacionModal(false);
    setSelectedAprobacion(null);
    setRequisitosExpediente([]);
    setObservaciones("");
    setSeleccionManejo("");
    setIdInspeccion("");
    setEstatusCredito("");
    setEstatusInspeccion("");
  };

  // Cambiar el estado de verificación del requisito
  const cambiarEstadoVerificacion = (index, nuevoEstado) => {
    const nuevosRequisitos = [...requisitosExpediente];
    nuevosRequisitos[index] = {
      ...nuevosRequisitos[index],
      estado_verificacion: nuevoEstado,
      observacion_no_valido: nuevoEstado !== 'no_valido' ? '' : nuevosRequisitos[index].observacion_no_valido,
    };
    setRequisitosExpediente(nuevosRequisitos);
  };

  // Actualizar la observación cuando no es válido
  const actualizarObservacionNoValido = (index, observacion) => {
    const nuevosRequisitos = [...requisitosExpediente];
    nuevosRequisitos[index] = {
      ...nuevosRequisitos[index],
      observacion_no_valido: observacion,
    };
    setRequisitosExpediente(nuevosRequisitos);
  };

  // Guardar verificación de requisitos
  // Guardar verificación de requisitos
const handleSaveVerificacion = async () => {
  if (!selectedAprobacion) {
    alert("❌ No hay expediente seleccionado");
    return;
  }

  // Validaciones existentes...
  if (idInspeccion && idInspeccion.trim() !== "") {
    if (isNaN(parseInt(idInspeccion))) {
      alert("❌ El ID de inspección debe ser un número válido");
      return;
    }
  }

  if (!selectedAprobacion.id_expediente) {
    alert("❌ Error: El expediente no tiene un ID válido");
    return;
  }

  const requisitosInvalidos = requisitosExpediente.some(
    (r) => !r.id_requisito || !r.nombre,
  );
  if (requisitosInvalidos) {
    alert("❌ Hay requisitos sin ID o nombre");
    return;
  }

  const requisitosSinObservacion = requisitosExpediente.filter(
    (r) => r.estado_verificacion === 'no_valido' && !r.observacion_no_valido?.trim()
  );
  if (requisitosSinObservacion.length > 0) {
    alert(`⚠️ Los siguientes requisitos están marcados como "No Válido" pero no tienen observación:\n${requisitosSinObservacion.map(r => r.nombre).join('\n')}`);
    return;
  }

  // Validación de decisión final
  const progresoGeneral = calcularProgresoGeneral();
  if (progresoGeneral === 100) {
    if (!estatusCredito) {
      alert("⚠️ Debe seleccionar si la solicitud de crédito es Aprobada o Rechazada");
      return;
    }
    if (!estatusInspeccion) {
      alert("⚠️ Debe seleccionar si la inspección es Aprobada o Rechazada");
      return;
    }
  }

  setSavingRequisitos(true);

  try {
    // Preparar datos de requisitos correctamente
    const requisitosParaEnviar = requisitosExpediente.map((req) => ({
      id_requisito: req.id_requisito,
      nombre: req.nombre,
      verificado: req.estado_verificacion === 'verificado',  // ← Convertir a booleano
      estado_verificacion: req.estado_verificacion,
      observacion_no_valido: req.observacion_no_valido || null
    }));

    const datosVerificacion = {
      requisitos: requisitosParaEnviar,
      observaciones: observaciones,
      seleccion_manejo: seleccionManejo,
      id_inspeccion: idInspeccion && idInspeccion.trim() !== "" ? parseInt(idInspeccion) : null,
      estatus_aprobacion: estatusCredito,  // ← Aprobado/Rechazado para crédito
      estatus_inspeccion: estatusInspeccion || null  // ← IMPORTANTE: Enviar siempre estatus_inspeccion
    };

    console.log("📤 Enviando datos al servidor:", JSON.stringify(datosVerificacion, null, 2));

    const response = await aprobacionAPI.verificarRequisitos(
      selectedAprobacion.id_expediente,
      datosVerificacion,
    );

    if (response.success) {
      alert(
        "✅ Requisitos verificados y guardados exitosamente\n" +
          (response.message || ""),
      );
      handleCloseModals();
      loadAprobaciones();
    } else {
      alert("❌ Error: " + (response.error || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error al guardar:", err);
    alert(
      `❌ Error al guardar la verificación de requisitos: ${err.message}`,
    );
  } finally {
    setSavingRequisitos(false);
  }
};

  // Calcular progreso de verificación
  const calcularProgreso = (requisitos) => {
    if (!requisitos || requisitos.length === 0) return 0;
    const verificados = requisitos.filter((r) => r.estado_verificacion === 'verificado').length;
    return Math.round((verificados / requisitos.length) * 100);
  };

  // Cargar datos al iniciar
  useEffect(() => {
    if (activeTab === "aprobaciones") {
      loadAprobaciones();
    }
  }, [activeTab]);

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("rememberToken");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  // Marcar notificación como leída
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".notifications-menu") &&
        !e.target.closest(".user-menu")
      ) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filtrar aprobaciones
  const filteredAprobaciones = aprobaciones.filter((aprob) => {
    const matchesSearch =
      searchTerm === "" ||
      aprob.codigo_expediente
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      aprob.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aprob.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aprob.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      aprob.estatus_aprobacion === selectedFilter ||
      aprob.estatus === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAprobaciones = filteredAprobaciones.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredAprobaciones.length / itemsPerPage);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  // Color según estatus
  const getStatusColor = (estatus) => {
    const colors = {
      Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "En Proceso": "bg-blue-100 text-blue-800 border-blue-300",
      Aprobado: "bg-green-100 text-green-800 border-green-300",
      Rechazado: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[estatus] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Icono según estatus
  const getStatusIcon = (estatus) => {
    const icons = {
      Pendiente: <Clock size={20} className="text-yellow-600" />,
      "En Proceso": <FileText size={20} className="text-blue-600" />,
      Aprobado: <CheckCircle size={20} className="text-green-600" />,
      Rechazado: <AlertCircle size={20} className="text-red-600" />,
    };
    return (
      icons[estatus] || <AlertCircle size={20} className="text-gray-600" />
    );
  };

  // Color según tipo de manejo
  const getManejoColor = (manejo) => {
    const colors = {
      Interno: "bg-purple-100 text-purple-800 border-purple-300",
      Banco: "bg-indigo-100 text-indigo-800 border-indigo-300",
    };
    return colors[manejo] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Icono según tipo de manejo
  const getManejoIcon = (manejo) => {
    switch (manejo) {
      case "Interno":
        return "🏢";
      case "Banco":
        return "🏦";
      default:
        return "❓";
    }
  };

  // Estadísticas
  const stats = {
    total: aprobaciones.length,
    pendientes: aprobaciones.filter(
      (a) => a.estatus_aprobacion === "Pendiente" || a.estatus === "Pendiente",
    ).length,
    enProceso: aprobaciones.filter(
      (a) =>
        a.estatus_aprobacion === "En Proceso" || a.estatus === "En Proceso",
    ).length,
    aprobados: aprobaciones.filter(
      (a) => a.estatus_aprobacion === "Aprobado" || a.estatus === "Aprobado",
    ).length,
    rechazados: aprobaciones.filter(
      (a) => a.estatus_aprobacion === "Rechazado" || a.estatus === "Rechazado",
    ).length,
  };

  // Contador de notificaciones no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Estilos para scroll en modales */
        .modal-scroll-content {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E0 transparent;
        }
        
        .modal-scroll-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .modal-scroll-content::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        
        .modal-scroll-content::-webkit-scrollbar-thumb {
          background-color: #CBD5E0;
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        
        .modal-scroll-content::-webkit-scrollbar-thumb:hover {
          background-color: #A0AEC0;
        }
        
        .dark .modal-scroll-content::-webkit-scrollbar-thumb {
          background-color: #4A5568;
        }
        
        .dark .modal-scroll-content::-webkit-scrollbar-thumb:hover {
          background-color: #718096;
        }

        /* Estilos legacy para compatibilidad */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #CBD5E0;
          border-radius: 3px;
          transition: background-color 0.2s;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #A0AEC0;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4A5568;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #718096;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E0 transparent;
        }
        
        .dark .custom-scrollbar {
          scrollbar-color: #4A5568 transparent;
        }
      `}</style>

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

        <main
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}
        >
          <div className="p-4 md:p-6 mt-16">
            {/* Título */}
            <div className="mb-6">
              <h1
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
              >
                Gestión de Aprobaciones
              </h1>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Verificación de requisitos y aprobación de expedientes
              </p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Briefcase className="text-blue-600" size={20} />
                  </div>
                  <h3
                    className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {stats.total}
                  </h3>
                </div>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Expedientes
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <Clock className="text-yellow-600" size={20} />
                  </div>
                  <h3
                    className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {stats.pendientes}
                  </h3>
                </div>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Pendientes
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <h3
                    className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {stats.enProceso}
                  </h3>
                </div>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  En Proceso
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-50">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <h3
                    className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {stats.aprobados}
                  </h3>
                </div>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Aprobados
                </p>
              </div>

              <div
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-50">
                    <AlertCircle className="text-red-600" size={20} />
                  </div>
                  <h3
                    className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
                  >
                    {stats.rechazados}
                  </h3>
                </div>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Rechazados
                </p>
              </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por código, nombre o email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedFilter}
                  onChange={(e) => {
                    setSelectedFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                >
                  <option value="all">Todos los estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>

                <button
                  onClick={loadAprobaciones}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw
                    size={20}
                    className={loading ? "animate-spin" : ""}
                  />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Tabla de Expedientes */}
            <div
              className={`rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg overflow-hidden`}
            >
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F] mx-auto"></div>
                  <p
                    className={`mt-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Cargando expedientes...
                  </p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <AlertCircle
                    className="mx-auto text-red-500 mb-4"
                    size={48}
                  />
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={loadAprobaciones}
                    className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                        >
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-700">
                            Expediente
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-700">
                            Solicitante
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-700">
                            Manejo
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-700">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-700">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                      >
                        {currentAprobaciones.length > 0 ? (
                          currentAprobaciones.map((aprobacion) => (
                            <tr
                              key={aprobacion.id_expediente}
                              className={`${
                                darkMode
                                  ? "hover:bg-gray-700/50"
                                  : "hover:bg-gray-50"
                              } transition-colors`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-700 text-gray-700">
                                {aprobacion.codigo_expediente}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-700 text-gray-700">
                                <div>
                                  <p className="font-medium">
                                    {aprobacion.nombres} {aprobacion.apellidos}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {aprobacion.email}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {aprobacion.seleccion_manejo ? (
                                  <span
                                    className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getManejoColor(aprobacion.seleccion_manejo)}`}
                                  >
                                    {getManejoIcon(
                                      aprobacion.seleccion_manejo,
                                    )}{" "}
                                    {aprobacion.seleccion_manejo}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    No definido
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(aprobacion.estatus_aprobacion || aprobacion.estatus)}`}
                                >
                                  {getStatusIcon(
                                    aprobacion.estatus_aprobacion || "Sin definir"
                                  )}
                                  {aprobacion.estatus_aprobacion || "Sin definir"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleOpenVerificacion(aprobacion)
                                    }
                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                    title="Verificar/Editar requisitos"
                                  >
                                    <ClipboardCheck size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOpenDetail(aprobacion)
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Ver detalles"
                                  >
                                    <Eye size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-8 text-center text-sm dark:text-gray-400 text-gray-500"
                            >
                              No se encontraron expedientes
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {filteredAprobaciones.length > 0 && (
                    <div
                      className={`px-6 py-4 flex items-center justify-between border-t dark:border-gray-700 border-gray-200`}
                    >
                      <div className="text-sm dark:text-gray-400 text-gray-600">
                        Mostrando {indexOfFirstItem + 1} a{" "}
                        {Math.min(indexOfLastItem, filteredAprobaciones.length)}{" "}
                        de {filteredAprobaciones.length} expedientes
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg ${
                            currentPage === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : darkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <ChevronLeft size={20} />
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              currentPage === index + 1
                                ? "bg-[#2A9D8F] text-white"
                                : darkMode
                                  ? "text-gray-300 hover:bg-gray-700"
                                  : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed"
                              : darkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* ==================== MODAL DE VERIFICACIÓN DE REQUISITOS ==================== */}
      {showVerificacionModal && selectedAprobacion && (
        <div className="fixed inset-0 z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            {/* Fondo */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={handleCloseModals}
            />

            {/* Modal */}
            <div
              className={`relative w-full max-w-6xl rounded-2xl shadow-xl flex flex-col ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ========== HEADER FIJO ========== */}
              <div
                className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${
                  darkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <div>
                  <h3
                    className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Proceso de Aprobación
                  </h3>
                  <p
                    className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Expediente: {selectedAprobacion.codigo_expediente} | ID: #
                    {selectedAprobacion.id_expediente}
                  </p>
                </div>
                <button
                  onClick={handleCloseModals}
                  className={`p-1 rounded-lg ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  } transition-colors`}
                >
                  <X
                    size={20}
                    className={darkMode ? "text-gray-400" : "text-gray-500"}
                  />
                </button>
              </div>

              {/* ========== BARRA DE PROGRESO GENERAL ========== */}
              <div className={`flex-shrink-0 px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Progreso General del Proceso
                    </h4>
                    <span className={`text-sm font-bold ${darkMode ? "text-[#2A9D8F]" : "text-[#2A9D8F]"}`}>
                      {calcularProgresoGeneral()}%
                    </span>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#264653] to-[#2A9D8F] transition-all duration-500 ease-out"
                      style={{ width: `${calcularProgresoGeneral()}%` }}
                    />
                  </div>
                </div>

                {/* Pasos del progreso - NUEVO ORDEN */}
                <div className="grid grid-cols-4 gap-2">
                  {pasosProgreso.map((paso) => {
                    const IconoPaso = paso.icono;
                    const completado = isPasoCompletado(paso.id);
                    const activo = isPasoActivo(paso.id);
                    
                    return (
                      <div key={paso.id} className="flex flex-col items-center">
                        <div
                          className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                            completado
                              ? "bg-[#2A9D8F] border-[#2A9D8F]"
                              : activo
                              ? "border-[#2A9D8F] bg-[#2A9D8F]/10 animate-pulse-slow"
                              : darkMode
                              ? "border-gray-600 bg-gray-700"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {completado ? (
                            <CheckCircle size={18} className="text-white" />
                          ) : (
                            <IconoPaso
                              size={18}
                              className={
                                activo
                                  ? "text-[#2A9D8F]"
                                  : darkMode
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }
                            />
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p
                            className={`text-xs font-medium leading-tight ${
                              completado
                                ? "text-[#2A9D8F]"
                                : activo
                                ? darkMode
                                  ? "text-white"
                                  : "text-gray-900"
                                : darkMode
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {paso.nombre}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              completado
                                ? "text-green-500"
                                : activo
                                ? "text-[#2A9D8F]"
                                : darkMode
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            {completado
                              ? "✓ Completado"
                              : activo
                              ? "En progreso..."
                              : "Pendiente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========== CONTENIDO CON SCROLL - NUEVO ORDEN DE SECCIONES ========== */}
              <div 
                className="flex-1 overflow-y-auto px-6 py-5 modal-scroll-content"
                style={{ minHeight: 0 }}
              >
                {/* Sección 1: Información del Solicitante */}
                <div className="mb-8">
                  <h3
                    className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Información del Solicitante
                  </h3>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg ${
                      darkMode ? "bg-gray-700/50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User
                        size={18}
                        className={darkMode ? "text-gray-400" : "text-gray-500"}
                      />
                      <div>
                        <p
                          className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Solicitante
                        </p>
                        <p
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {selectedAprobacion.nombres}{" "}
                          {selectedAprobacion.apellidos}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail
                        size={18}
                        className={darkMode ? "text-gray-400" : "text-gray-500"}
                      />
                      <div>
                        <p
                          className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Email
                        </p>
                        <p
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {selectedAprobacion.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock
                        size={18}
                        className={darkMode ? "text-gray-400" : "text-gray-500"}
                      />
                      <div>
                        <p
                          className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Fecha de Solicitud
                        </p>
                        <p
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {formatDate(selectedAprobacion.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Verificación de Requisitos - PASO 1 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Paso 1: Verificación de Requisitos
                    </h3>
                    {calcularProgreso(requisitosExpediente) === 100 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        ✓ Completado
                      </span>
                    )}
                  </div>

                  {/* Barra de Progreso de Requisitos */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Progreso de verificación
                      </span>
                      <span
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {requisitosExpediente.filter((r) => r.estado_verificacion === 'verificado').length} de{" "}
                        {requisitosExpediente.length}
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
                    >
                      <div
                        className="h-2 rounded-full bg-[#2A9D8F] transition-all"
                        style={{
                          width: `${calcularProgreso(requisitosExpediente)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Tabla de requisitos */}
                  {loadingRequisitos ? (
                    <div className="text-center py-8">
                      <Loader
                        className="animate-spin mx-auto text-[#2A9D8F]"
                        size={28}
                      />
                      <p
                        className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Cargando requisitos...
                      </p>
                    </div>
                  ) : requisitosExpediente.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr
                            className={`${
                              darkMode ? "bg-gray-700/50" : "bg-gray-100"
                            }`}
                          >
                            <th
                              className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                              style={{ width: "45%" }}
                            >
                              <div className="flex items-center gap-2">
                                <ClipboardCheck size={16} />
                                Verificación de Requisito
                              </div>
                            </th>
                            <th
                              className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                              style={{ width: "55%" }}
                            >
                              <div className="flex items-center gap-2">
                                <Image size={16} />
                                Documentos / Imágenes Adjuntas
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {requisitosExpediente.map((requisito, index) => {
                            const imagenesRequisito = obtenerImagenesRequisito(
                              selectedAprobacion,
                              requisito.id_requisito,
                            );

                            return (
                              <tr
                                key={requisito.id_requisito || index}
                                className={`border-b ${
                                  darkMode ? "border-gray-700" : "border-gray-200"
                                } ${
                                  requisito.estado_verificacion === 'verificado'
                                    ? darkMode
                                      ? "bg-green-900/10"
                                      : "bg-green-50/50"
                                    : requisito.estado_verificacion === 'no_valido'
                                    ? darkMode
                                      ? "bg-red-900/10"
                                      : "bg-red-50/50"
                                    : ""
                                }`}
                              >
                                {/* COLUMNA 1: Opciones de verificación */}
                                <td className="px-4 py-3 align-top">
                                  <div className="space-y-3">
                                    <div className="flex flex-col gap-2">
                                      {/* Opción 1: Verificado */}
                                      <label
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                          requisito.estado_verificacion === 'verificado'
                                            ? darkMode
                                              ? 'bg-green-900/20 border border-green-700'
                                              : 'bg-green-50 border border-green-200'
                                            : darkMode
                                              ? 'hover:bg-gray-700 border border-transparent'
                                              : 'hover:bg-gray-100 border border-transparent'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`requisito-${index}`}
                                          checked={requisito.estado_verificacion === 'verificado'}
                                          onChange={() => cambiarEstadoVerificacion(index, 'verificado')}
                                          className="sr-only"
                                        />
                                        <div
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            requisito.estado_verificacion === 'verificado'
                                              ? 'border-green-500 bg-green-500'
                                              : darkMode
                                                ? 'border-gray-500'
                                                : 'border-gray-400'
                                          }`}
                                        >
                                          {requisito.estado_verificacion === 'verificado' && (
                                            <CheckCircle size={12} className="text-white" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <p className={`text-sm font-medium ${
                                            requisito.estado_verificacion === 'verificado'
                                              ? 'text-green-700 dark:text-green-400'
                                              : darkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                          }`}>
                                            {requisito.nombre}
                                          </p>
                                          {requisito.descripcion && (
                                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                              {requisito.descripcion}
                                            </p>
                                          )}
                                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                                            requisito.estado_verificacion === 'verificado'
                                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                          }`}>
                                            {requisito.estado_verificacion === 'verificado' ? '✓ Verificado' : 'Seleccionar'}
                                          </span>
                                        </div>
                                      </label>

                                      {/* Opción 2: Requisito No Válido */}
                                      <label
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                          requisito.estado_verificacion === 'no_valido'
                                            ? darkMode
                                              ? 'bg-red-900/20 border border-red-700'
                                              : 'bg-red-50 border border-red-200'
                                            : darkMode
                                              ? 'hover:bg-gray-700 border border-transparent'
                                              : 'hover:bg-gray-100 border border-transparent'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`requisito-${index}`}
                                          checked={requisito.estado_verificacion === 'no_valido'}
                                          onChange={() => cambiarEstadoVerificacion(index, 'no_valido')}
                                          className="sr-only"
                                        />
                                        <div
                                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            requisito.estado_verificacion === 'no_valido'
                                              ? 'border-red-500 bg-red-500'
                                              : darkMode
                                                ? 'border-gray-500'
                                                : 'border-gray-400'
                                          }`}
                                        >
                                          {requisito.estado_verificacion === 'no_valido' && (
                                            <X size={12} className="text-white" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <p className={`text-sm font-medium ${
                                            requisito.estado_verificacion === 'no_valido'
                                              ? 'text-red-700 dark:text-red-400'
                                              : darkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                          }`}>
                                            Requisito No Válido
                                          </p>
                                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                                            requisito.estado_verificacion === 'no_valido'
                                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                          }`}>
                                            {requisito.estado_verificacion === 'no_valido' ? '✗ No Válido' : 'Seleccionar'}
                                          </span>
                                        </div>
                                      </label>
                                    </div>

                                    {/* Campo de observación */}
                                    {requisito.estado_verificacion === 'no_valido' && (
                                      <div className="ml-8 animate-fadeIn">
                                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                          Observación del porqué no es válido <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                          value={requisito.observacion_no_valido || ''}
                                          onChange={(e) => actualizarObservacionNoValido(index, e.target.value)}
                                          placeholder="Explique por qué este requisito no es válido..."
                                          rows={3}
                                          className={`w-full px-3 py-2 text-sm rounded-lg border resize-none ${
                                            darkMode
                                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500'
                                              : 'bg-white border-gray-200 placeholder-gray-400 focus:border-red-500'
                                          } focus:ring-1 focus:ring-red-500 transition-colors`}
                                        />
                                        {!requisito.observacion_no_valido?.trim() && (
                                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            ⚠️ Este campo es obligatorio para requisitos no válidos
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* COLUMNA 2: Imágenes del requisito */}
                                <td className="px-4 py-3 align-top">
                                  {imagenesRequisito.length > 0 ? (
                                    <div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {imagenesRequisito.map((url, imgIndex) => (
                                          <div
                                            key={imgIndex}
                                            className="group relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => window.open(url, "_blank")}
                                          >
                                            <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                                              <img
                                                src={url}
                                                alt={`${requisito.nombre} - ${imgIndex + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src =
                                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzliOWU5YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==";
                                                }}
                                              />
                                            </div>
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                              <div className="opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(url, "_blank");
                                                  }}
                                                  className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                                                  title="Ver imagen completa"
                                                >
                                                  <Eye
                                                    size={16}
                                                    className="text-blue-600"
                                                  />
                                                </button>
                                              </div>
                                            </div>
                                            <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                                              {imgIndex + 1}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <p
                                        className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                      >
                                        📸 {imagenesRequisito.length} imagen(es)
                                        adjunta(s)
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-full min-h-[80px]">
                                      <div className="text-center">
                                        <FileX
                                          size={24}
                                          className={`mx-auto mb-1 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                                        />
                                        <p
                                          className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                                        >
                                          Sin imágenes adjuntas
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileX
                        size={36}
                        className={`mx-auto mb-2 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                      />
                      <p
                        className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        No hay requisitos configurados para este expediente
                      </p>
                    </div>
                  )}
                </div>

                {/* Sección 3: Inspección de Emprendimiento - PASO 2 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Paso 2: Inspección de Emprendimiento
                    </h3>
                    {estatusInspeccion && (
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        estatusInspeccion === "Aprobado"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {estatusInspeccion === "Aprobado" ? "✓ Aprobada" : "✗ Rechazada"}
                      </span>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-xl">📊</div>
                      <div>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Estatus actual de la inspección
                        </p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedAprobacion.estatus_inspeccion || "No realizada"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Cambiar estatus de la inspección:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setEstatusInspeccion("Aprobado")}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                            estatusInspeccion === "Aprobado"
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : darkMode
                                ? "border-gray-600 hover:border-green-500"
                                : "border-gray-200 hover:border-green-500"
                          }`}
                        >
                          <ThumbsUp size={18} className={estatusInspeccion === "Aprobado" ? "text-green-600" : ""} />
                          <span className={`text-sm font-medium ${
                            estatusInspeccion === "Aprobado"
                              ? "text-green-700 dark:text-green-400"
                              : darkMode ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Aprobar Inspección
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEstatusInspeccion("Rechazado")}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                            estatusInspeccion === "Rechazado"
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : darkMode
                                ? "border-gray-600 hover:border-red-500"
                                : "border-gray-200 hover:border-red-500"
                          }`}
                        >
                          <ThumbsDown size={18} className={estatusInspeccion === "Rechazado" ? "text-red-600" : ""} />
                          <span className={`text-sm font-medium ${
                            estatusInspeccion === "Rechazado"
                              ? "text-red-700 dark:text-red-400"
                              : darkMode ? "text-gray-300" : "text-gray-700"
                          }`}>
                            Rechazar Inspección
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`block text-xs ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                      >
                        ℹ️ La inspección se visualiza en el módulo de inspección
                      </span>
                      <button
                        onClick={() => {
                          window.location.href = "/Inspeccion";
                        }}
                        className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          darkMode
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        <span>🔍</span>
                        Ir al módulo de inspección
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sección 4: Decisión Final de Crédito - PASO 3 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Paso 3: Decisión Final de Crédito
                    </h3>
                    {estatusCredito && (
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        estatusCredito === "Aprobado"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {estatusCredito === "Aprobado" ? "✓ Aprobado" : "✗ Rechazado"}
                      </span>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-xl">💰</div>
                        <div>
                          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Monto solicitado
                          </p>
                          <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            ${selectedAprobacion.monto_solicitado?.toLocaleString() || "0"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-xl">📊</div>
                        <div>
                          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Estatus actual
                          </p>
                          <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedAprobacion.estatus_aprobacion || "Pendiente"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Decisión final sobre la solicitud de crédito:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setEstatusCredito("Aprobado")}
                          className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                            estatusCredito === "Aprobado"
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg"
                              : darkMode
                                ? "border-gray-600 hover:border-green-500 hover:shadow-lg"
                                : "border-gray-200 hover:border-green-500 hover:shadow-lg"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            estatusCredito === "Aprobado" ? "bg-green-500" : "bg-green-100"
                          }`}>
                            <ThumbsUp size={16} className={estatusCredito === "Aprobado" ? "text-white" : "text-green-600"} />
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-bold ${
                              estatusCredito === "Aprobado"
                                ? "text-green-700 dark:text-green-400"
                                : darkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                              APROBAR CRÉDITO
                            </p>
                            <p className="text-xs text-gray-500">
                              La solicitud será aprobada
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEstatusCredito("Rechazado")}
                          className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                            estatusCredito === "Rechazado"
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg"
                              : darkMode
                                ? "border-gray-600 hover:border-red-500 hover:shadow-lg"
                                : "border-gray-200 hover:border-red-500 hover:shadow-lg"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            estatusCredito === "Rechazado" ? "bg-red-500" : "bg-red-100"
                          }`}>
                            <ThumbsDown size={16} className={estatusCredito === "Rechazado" ? "text-white" : "text-red-600"} />
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-bold ${
                              estatusCredito === "Rechazado"
                                ? "text-red-700 dark:text-red-400"
                                : darkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                              RECHAZAR CRÉDITO
                            </p>
                            <p className="text-xs text-gray-500">
                              La solicitud será rechazada
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 5: Tipo de Manejo - PASO 4 (ÚLTIMO) */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Paso 4: Tipo de Manejo del Crédito
                    </h3>
                    {seleccionManejo && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        ✓ Completado
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSeleccionManejo("Interno")}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        seleccionManejo === "Interno"
                          ? "border-[#2A9D8F] bg-[#2A9D8F]/5"
                          : darkMode
                            ? "border-gray-700 bg-gray-800"
                            : "border-gray-200 bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          seleccionManejo === "Interno"
                            ? "border-[#2A9D8F] bg-[#2A9D8F]"
                            : darkMode
                              ? "border-gray-600"
                              : "border-gray-300"
                        }`}
                      >
                        {seleccionManejo === "Interno" && (
                          <CheckCircle size={12} className="text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span>🏢</span>
                          <p
                            className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            Manejo Interno
                          </p>
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                          El crédito será manejado internamente por IADEY
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSeleccionManejo("Banco")}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        seleccionManejo === "Banco"
                          ? "border-[#2A9D8F] bg-[#2A9D8F]/5"
                          : darkMode
                            ? "border-gray-700 bg-gray-800"
                            : "border-gray-200 bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          seleccionManejo === "Banco"
                            ? "border-[#2A9D8F] bg-[#2A9D8F]"
                            : darkMode
                              ? "border-gray-600"
                              : "border-gray-300"
                        }`}
                      >
                        {seleccionManejo === "Banco" && (
                          <CheckCircle size={12} className="text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span>🏦</span>
                          <p
                            className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            Banco
                          </p>
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                          El crédito será manejado a través de una entidad
                          bancaria
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sección 6: Observaciones Generales */}
                <div className="mb-6">
                  <h4
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Observaciones Generales de la Verificación
                  </h4>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Agregar observaciones sobre la verificación de requisitos (opcional)"
                    rows={3}
                    className={`w-full px-3 py-2 text-sm rounded-lg border resize-none ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-200 placeholder-gray-400"
                    } focus:ring-1 focus:ring-[#2A9D8F] focus:border-[#2A9D8F]`}
                  />
                </div>

                {/* ID de Inspección (oculto) */}
                <input
                  type="hidden"
                  value={idInspeccion}
                  onChange={(e) => setIdInspeccion(e.target.value)}
                />
              </div>

              {/* ========== FOOTER FIJO ========== */}
              <div
                className={`flex-shrink-0 flex justify-between items-center px-6 py-4 border-t ${
                  darkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {calcularProgresoGeneral() === 100
                    ? "✅ Todos los pasos completados"
                    : `⚠️ Completado: ${calcularProgresoGeneral()}%`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCloseModals}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSaveVerificacion}
                    disabled={savingRequisitos || requisitosExpediente.length === 0}
                    className={`px-6 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      calcularProgresoGeneral() === 100
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-[#2A9D8F] hover:bg-[#238b7e] text-white"
                    }`}
                  >
                    {savingRequisitos ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <ClipboardCheck size={16} />
                        {calcularProgresoGeneral() === 100
                          ? "Finalizar Proceso"
                          : "Guardar Progreso"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DE DETALLE ==================== */}
      {showDetailModal && selectedAprobacion && (
        <div className="fixed inset-0 z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={handleCloseModals}
            />
            <div
              className={`relative w-full max-w-2xl rounded-2xl shadow-xl flex flex-col ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
              style={{ maxHeight: '85vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header fijo */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Detalle del Expediente #{selectedAprobacion.id_expediente}
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Código: {selectedAprobacion.codigo_expediente}
                  </p>
                </div>
                <button
                  onClick={handleCloseModals}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                >
                  <X size={20} className={darkMode ? "text-gray-400" : "text-gray-600"} />
                </button>
              </div>

              {/* Contenido con scroll */}
              <div 
                className="flex-1 overflow-y-auto px-6 py-6 modal-scroll-content"
                style={{ minHeight: 0 }}
              >
                <div className="space-y-6">
                  <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <h4 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Información del Solicitante
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Nombre Completo</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedAprobacion.nombres} {selectedAprobacion.apellidos}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Cédula</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedAprobacion.cedula || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Email</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedAprobacion.email}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Teléfono</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {selectedAprobacion.telefono || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <h4 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Estado del Expediente
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Estado</p>
                        <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border mt-1 ${getStatusColor(selectedAprobacion.estatus_aprobacion || selectedAprobacion.estatus)}`}>
                          {getStatusIcon(selectedAprobacion.estatus_aprobacion || selectedAprobacion.estatus)}
                          {selectedAprobacion.estatus_aprobacion || selectedAprobacion.estatus}
                        </span>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Tipo de Manejo</p>
                        {selectedAprobacion.seleccion_manejo ? (
                          <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border mt-1 ${getManejoColor(selectedAprobacion.seleccion_manejo)}`}>
                            {getManejoIcon(selectedAprobacion.seleccion_manejo)} {selectedAprobacion.seleccion_manejo}
                          </span>
                        ) : (
                          <p className={`font-medium mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>No definido</p>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Fecha de Creación</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {formatDate(selectedAprobacion.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Última Actualización</p>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {formatDate(selectedAprobacion.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer fijo */}
              <div className="flex-shrink-0 flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseModals}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprobacion;