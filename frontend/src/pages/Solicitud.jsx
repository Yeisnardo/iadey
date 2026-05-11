// pages/SolicitudesPersona.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building,
  ChevronLeft,
  X,
  Check,
  Briefcase,
  AlertCircle,
} from "lucide-react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import clasidEmprendAPI from "../services/api_clasificacion_emprendimiento";
import SolicitudAPI from "../services/api_solicitud";
import EmprendimientoAPI from "../services/api_emprendimiento";
import usuarioAPI from "../services/api_usuario";

const SolicitudesPersona = () => {
  const navigate = useNavigate();
  const { personaId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [clasificaciones, setClasificaciones] = useState([]);
  const [loadingClasificaciones, setLoadingClasificaciones] = useState(false);
  const [sectoresUnicos, setSectoresUnicos] = useState([]);
  const [actividadesPorSector, setActividadesPorSector] = useState({});

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    cedula_persona: "",
    solicitud: "",
    monto_solicitado: "",
    fecha_solicitud: "",
    nombre_emprendimiento: "",
    direccion_empredimiento: "",
    cedula_emprendimiento: "",
    anos_experiencia: "",
    id_clasificacion: "",
    sectorEconomico: "",
    subsector: "",
  });

  const [persona, setPersona] = useState({
    id: "",
    tipoPersona: "",
    nombreCompleto: "",
    cedula: "",
    rif: "",
    telefono: "",
    telefono2: "",
    email: "",
    email2: "",
    direccion: "",
    municipio: "",
    estado: "",
    fechaRegistro: "",
    ocupacion: "",
    estadoCivil: "",
    fechaNacimiento: "",
    nacionalidad: "",
  });

  const añosOperando = [
    "Menos de 1 año",
    "1 a 3 años",
    "3 a 5 años",
    "5 a 10 años",
    "Más de 10 años",
  ];

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Notificaciones del sistema", time: "5 min", read: false },
  ]);

  useEffect(() => {
    cargarUsuarioYPersona();
    cargarClasificaciones();
    cargarSolicitudes();
  }, []);

  const cargarUsuarioYPersona = async () => {
    const usuarioLogueado = usuarioAPI.getCurrentUser();
    setCurrentUser(usuarioLogueado);

    if (usuarioLogueado && usuarioLogueado.cedula_usuario) {
      setFormData((prev) => ({
        ...prev,
        cedula_persona: usuarioLogueado.cedula_usuario,
        cedula_emprendimiento: usuarioLogueado.cedula_usuario,
      }));
      await cargarPersona(usuarioLogueado.cedula_usuario);
    } else {
      navigate("/login");
    }
  };

  const cargarPersona = async (cedula) => {
    try {
      const PersonaAPI = (await import("../services/api_persona")).default;
      const response = await PersonaAPI.getByCedula(cedula);

      if (response.success && response.data) {
        setPersona({
          id: response.data.id_persona,
          tipoPersona: response.data.tipo_persona || "Natural",
          nombreCompleto:
            response.data.nombre_completo ||
            response.data.nombres + " " + response.data.apellidos,
          cedula: response.data.cedula,
          rif: response.data.rif || "",
          telefono: response.data.telefono || "",
          telefono2: response.data.telefono2 || "",
          email: response.data.email || "",
          email2: response.data.email2 || "",
          direccion: response.data.direccion || "",
          municipio: response.data.municipio || "",
          estado: response.data.estado || "",
          fechaRegistro: response.data.fecha_registro,
          ocupacion: response.data.ocupacion || "",
          estadoCivil: response.data.estado_civil || "",
          fechaNacimiento: response.data.fecha_nacimiento,
          nacionalidad: response.data.nacionalidad || "Venezolana",
        });
      }
    } catch (error) {
      console.error("Error cargando persona:", error);
    }
  };

  const cargarClasificaciones = async () => {
    setLoadingClasificaciones(true);
    try {
      const response = await clasidEmprendAPI.getAll();
      if (response.success && response.data) {
        setClasificaciones(response.data);

        const sectores = [];
        const actividadesMap = {};

        response.data.forEach((item) => {
          if (!sectores.includes(item.sector)) {
            sectores.push(item.sector);
            actividadesMap[item.sector] = [];
          }
          if (
            item.actividad &&
            !actividadesMap[item.sector].includes(item.actividad)
          ) {
            actividadesMap[item.sector].push(item.actividad);
          }
        });

        setSectoresUnicos(sectores);
        setActividadesPorSector(actividadesMap);
      }
    } catch (error) {
      console.error("Error cargando clasificaciones:", error);
    } finally {
      setLoadingClasificaciones(false);
    }
  };

  const cargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const usuarioLogueado = usuarioAPI.getCurrentUser();
      if (usuarioLogueado && usuarioLogueado.cedula_usuario) {
        const response = await SolicitudAPI.getByCedula(
          usuarioLogueado.cedula_usuario,
        );

        if (response && response.success && response.data) {
          const solicitudesFormateadas = response.data.map((sol) => ({
            id: sol.id_solicitud,
            fechaSolicitud: sol.fecha_solicitud,
            emprendimiento: sol.nombre_emprendimiento || "Sin especificar",
            rifEmprendimiento: sol.cedula_emprendimiento || sol.cedula_persona,
            montoSolicitado: parseFloat(sol.monto_solicitado) || 0,
            estatus: sol.estatus || "Pendiente",
            motivo_rechazo: sol.motivo_rechazo,
            destino: sol.solicitud,
            analista: "Por asignar",
            clasificacion:
              sol.sector && sol.actividad
                ? `${sol.sector} - ${sol.actividad}`
                : "No especificada",
            anos_experiencia: sol.anos_experiencia || "No especificado",
            direccion_emprendimiento:
              sol.direccion_empredimiento || "No especificada",
          }));

          setSolicitudes(solicitudesFormateadas);
        } else {
          setSolicitudes([]);
        }
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      setSolicitudes([]);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const obtenerIdClasificacion = (sector, actividad) => {
    const clasificacion = clasificaciones.find(
      (c) => c.sector === sector && c.actividad === actividad,
    );
    return clasificacion ? clasificacion.id_clasificacion : null;
  };

  const stats = {
    totalSolicitudes: solicitudes.length,
    montoTotal: solicitudes.reduce(
      (acc, s) => acc + (s.montoSolicitado || 0),
      0,
    ),
    solicitudesPendientes: solicitudes.filter((s) => s.estatus === "Pendiente")
      .length,
    solicitudesAprobadas: solicitudes.filter((s) => s.estatus === "Aprobado")
      .length,
    solicitudesRechazadas: solicitudes.filter((s) => s.estatus === "Rechazado")
      .length,
  };

  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const matchesSearch =
      solicitud.emprendimiento
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      solicitud.id?.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "todos" || solicitud.estatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "sectorEconomico") {
      setFormData((prev) => ({ ...prev, subsector: "", id_clasificacion: "" }));
    }

    if (name === "subsector") {
      const id_clasificacion = obtenerIdClasificacion(
        formData.sectorEconomico,
        value,
      );
      setFormData((prev) => ({
        ...prev,
        id_clasificacion: id_clasificacion || "",
      }));
    }
  };

  const handleNuevaSolicitud = () => {
    const usuarioLogueado = usuarioAPI.getCurrentUser();
    if (!usuarioLogueado || !usuarioLogueado.cedula_usuario) {
      alert("Debe iniciar sesión para crear una solicitud");
      navigate("/login");
      return;
    }

    setShowModal(true);
    setCurrentStep(1);
    setFormData({
      cedula_persona: usuarioLogueado.cedula_usuario,
      solicitud: "",
      monto_solicitado: "",
      fecha_solicitud: new Date().toISOString().split("T")[0],
      nombre_emprendimiento: "",
      direccion_empredimiento: "",
      cedula_emprendimiento: usuarioLogueado.cedula_usuario,
      anos_experiencia: "",
      id_clasificacion: "",
      sectorEconomico: "",
      subsector: "",
    });
  };

  const handleGuardarSolicitud = async () => {
    const usuarioLogueado = usuarioAPI.getCurrentUser();

    if (!usuarioLogueado || !usuarioLogueado.cedula_usuario) {
      alert("No se ha detectado un usuario logueado");
      navigate("/login");
      return;
    }

    if (
      !formData.solicitud ||
      !formData.monto_solicitado ||
      !formData.fecha_solicitud
    ) {
      alert("Por favor completa los datos del crédito");
      setCurrentStep(1);
      return;
    }

    if (
      !formData.nombre_emprendimiento ||
      !formData.direccion_empredimiento ||
      !formData.anos_experiencia ||
      !formData.id_clasificacion
    ) {
      alert("Por favor completa todos los datos del emprendimiento");
      setCurrentStep(2);
      return;
    }

    setSaving(true);

    try {
      const solicitudData = {
        cedula_persona: usuarioLogueado.cedula_usuario,
        solicitud: formData.solicitud,
        fecha_solicitud: formData.fecha_solicitud,
        monto_solicitado: formData.monto_solicitado,
        estatus: "Pendiente",
      };

      const solicitudResponse = await SolicitudAPI.create(solicitudData);

      if (!solicitudResponse.success) {
        throw new Error(
          solicitudResponse.error || "Error al crear la solicitud",
        );
      }

      const nuevaSolicitud = solicitudResponse.data;
      const id_solicitud = nuevaSolicitud.id_solicitud;

      const emprendimientoData = {
        id_solicitud: id_solicitud,
        id_clasificacion: parseInt(formData.id_clasificacion),
        cedula_emprendimiento: usuarioLogueado.cedula_usuario,
        anos_experiencia: formData.anos_experiencia,
        nombre_emprendimiento: formData.nombre_emprendimiento,
        direccion_empredimiento: formData.direccion_empredimiento,
      };

      const emprendimientoResponse =
        await EmprendimientoAPI.create(emprendimientoData);

      if (!emprendimientoResponse.success) {
        await SolicitudAPI.delete(id_solicitud);
        throw new Error(
          emprendimientoResponse.error || "Error al crear el emprendimiento",
        );
      }

      const clasificacion = clasificaciones.find(
        (c) => c.id_clasificacion === parseInt(formData.id_clasificacion),
      );

      const nuevaSolicitudLocal = {
        id: nuevaSolicitud.id_solicitud,
        fechaSolicitud: formData.fecha_solicitud,
        emprendimiento: formData.nombre_emprendimiento,
        rifEmprendimiento: usuarioLogueado.cedula_usuario,
        montoSolicitado: parseFloat(formData.monto_solicitado) || 0,
        estatus: "Pendiente",
        motivo_rechazo: null,
        destino: formData.solicitud,
        analista: "Por asignar",
        clasificacion: clasificacion
          ? `${clasificacion.sector} - ${clasificacion.actividad}`
          : "No especificada",
        anos_experiencia: formData.anos_experiencia,
        direccion_emprendimiento: formData.direccion_empredimiento,
      };

      setSolicitudes([nuevaSolicitudLocal, ...solicitudes]);
      setShowModal(false);
      alert("Solicitud guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleVerDetalle = (solicitudId) => {
    navigate(`/solicitud/${solicitudId}`);
  };

  const handleAprobarSolicitud = async (solicitudId) => {
    if (!window.confirm("¿Estás seguro de aprobar esta solicitud?")) return;

    setUpdatingStatus(true);
    try {
      const response = await SolicitudAPI.updateEstatus(
        solicitudId,
        "Aprobado",
        null,
      );

      if (response.success) {
        setSolicitudes((prevSolicitudes) =>
          prevSolicitudes.map((sol) =>
            sol.id === solicitudId
              ? { ...sol, estatus: "Aprobado", motivo_rechazo: null }
              : sol,
          ),
        );
        alert("Solicitud aprobada exitosamente");
      }
    } catch (error) {
      alert(`Error al aprobar: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRechazarSolicitud = (solicitudId) => {
    setSelectedSolicitudId(solicitudId);
    setMotivoRechazo("");
    setShowRejectModal(true);
  };

  const handleConfirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      alert("Por favor, ingrese el motivo del rechazo");
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await SolicitudAPI.updateEstatus(
        selectedSolicitudId,
        "Rechazado",
        motivoRechazo,
      );

      if (response.success) {
        setSolicitudes((prevSolicitudes) =>
          prevSolicitudes.map((sol) =>
            sol.id === selectedSolicitudId
              ? { ...sol, estatus: "Rechazado", motivo_rechazo: motivoRechazo }
              : sol,
          ),
        );
        setShowRejectModal(false);
        setMotivoRechazo("");
        setSelectedSolicitudId(null);
        alert("Solicitud rechazada");
      }
    } catch (error) {
      alert(`Error al rechazar: ${error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleVolver = () => navigate(-1);

  const getStatusColor = (estatus) => {
    const colores = {
      Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
      Aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Rechazado: "bg-red-50 text-red-700 border-red-200",
    };
    return colores[estatus] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (estatus) => {
    switch (estatus) {
      case "Pendiente":
        return <Clock size={12} />;
      case "Aprobado":
        return <CheckCircle size={12} />;
      case "Rechazado":
        return <XCircle size={12} />;
      default:
        return null;
    }
  };

  const formatMonto = (monto) => {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
};

  const formatFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const user = {
    name: currentUser?.nombre_completo || "Usuario",
    email: currentUser?.cedula_usuario || "",
    role: currentUser?.rol === "admin" ? "Administrador" : "Emprendedor",
    avatar: null,
  };

  const cardStyle = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const inputStyle = darkMode
    ? "bg-gray-700 border-gray-600 text-white focus:border-indigo-500"
    : "bg-white border-gray-300 text-gray-900 focus:border-indigo-500";
  const labelStyle = darkMode ? "text-gray-300" : "text-gray-700";

  return (
    <div
      className={`min-h-screen flex flex-col ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
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
          activeTab="creditos"
          setActiveTab={() => {}}
          darkMode={darkMode}
        />

        <main
          className={`flex-1 transition-all duration-200 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}
        >
          <div className="p-4 md:p-6 mt-16">

            {/* Título de la sección */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Solicitud de credito
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Realiza tu nueva solicitud
              </p>
            </div>


            {/* Header Section with Back Button and New Request Button */}
            <div className="flex justify-between items-center mb-5">
              <button
                onClick={handleVolver}
                className={`flex items-center gap-1.5 text-sm ${textSecondary} hover:${textPrimary} transition-colors`}
              >
                <ChevronLeft size={18} />
                <span>Volver</span>
              </button>

              <button
                onClick={handleNuevaSolicitud}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus size={16} />
                Nueva Solicitud
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                />
                <input
                  type="text"
                  placeholder="Buscar por emprendimiento o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
              >
                <option value="todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* Table */}
            <div
              className={`${cardStyle} rounded-lg border shadow-sm overflow-hidden`}
            >
              {loadingSolicitudes ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                  <p className={`text-sm ${textSecondary} mt-3`}>
                    Cargando solicitudes...
                  </p>
                </div>
              ) : filteredSolicitudes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      className={`${darkMode ? "bg-gray-700/50" : "bg-gray-50"} border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                    >
                      <tr>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}
                        >
                          ID
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}
                        >
                          Fecha
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}
                        >
                          Emprendimiento
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}
                        >
                          RIF
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}
                        >
                          Monto
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}
                        >
                          Estatus
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}
                    >
                      {filteredSolicitudes.map((solicitud) => (
                        <tr
                          key={solicitud.id}
                          className={`${darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} transition-colors`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-sm font-mono ${textPrimary}`}
                            >
                              {solicitud.id}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-sm ${textSecondary}`}>
                              {formatFecha(solicitud.fechaSolicitud)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${textPrimary}`}
                            >
                              {solicitud.emprendimiento}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${textSecondary}`}>
                              {solicitud.rifEmprendimiento}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${textPrimary}`}
                            >
                              {formatMonto(solicitud.montoSolicitado)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(solicitud.estatus)}`}
                            >
                              {getStatusIcon(solicitud.estatus)}
                              {solicitud.estatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <ActionButton
                                icon={Eye}
                                onClick={() => handleVerDetalle(solicitud.id)}
                                tooltip="Ver detalles"
                                darkMode={darkMode}
                              />
                              {solicitud.estatus === "Pendiente" && (
                                <>
                                  <ActionButton
                                    icon={CheckCircle}
                                    onClick={() =>
                                      handleAprobarSolicitud(solicitud.id)
                                    }
                                    tooltip="Aprobar"
                                    variant="success"
                                    darkMode={darkMode}
                                  />
                                  <ActionButton
                                    icon={XCircle}
                                    onClick={() =>
                                      handleRechazarSolicitud(solicitud.id)
                                    }
                                    tooltip="Rechazar"
                                    variant="danger"
                                    darkMode={darkMode}
                                  />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState onNew={handleNuevaSolicitud} darkMode={darkMode} />
              )}
            </div>
          </div>

          {/* Modal - New Request */}
          {showModal && (
            <Modal
              title="Nueva Solicitud de Crédito"
              onClose={() => setShowModal(false)}
              darkMode={darkMode}
            >
              <div className="space-y-5">
                {/* User info banner */}
                <div
                  className={`p-3 rounded-md ${darkMode ? "bg-indigo-900/30" : "bg-indigo-50"} text-sm`}
                >
                  <p
                    className={darkMode ? "text-indigo-300" : "text-indigo-800"}
                  >
                    Solicitante:{" "}
                    {persona.nombreCompleto || currentUser?.cedula_usuario}
                  </p>
                </div>

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className={`text-base font-semibold ${textPrimary}`}>
                      Datos de la Solicitud
                    </h3>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Motivo / Descripción{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="solicitud"
                        value={formData.solicitud}
                        onChange={handleChange}
                        rows="3"
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="Describa el motivo del préstamo..."
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Monto Solicitado (Bs.){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="monto_solicitado"
                        value={formData.monto_solicitado}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Fecha de Solicitud{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fecha_solicitud"
                        value={formData.fecha_solicitud}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className={`text-base font-semibold ${textPrimary}`}>
                      Datos del Emprendimiento
                    </h3>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Nombre del Emprendimiento{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre_emprendimiento"
                        value={formData.nombre_emprendimiento}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="Ej: Panadería La Espiga"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="direccion_empredimiento"
                        value={formData.direccion_empredimiento}
                        onChange={handleChange}
                        rows="2"
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                        placeholder="Dirección completa"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Años de Experiencia{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="anos_experiencia"
                        value={formData.anos_experiencia}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                      >
                        <option value="">Seleccione</option>
                        {añosOperando.map((año) => (
                          <option key={año} value={año}>
                            {año}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Sector Económico <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sectorEconomico"
                        value={formData.sectorEconomico}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500`}
                      >
                        <option value="">Seleccione un sector</option>
                        {sectoresUnicos.map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                      >
                        Actividad / Subsector{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subsector"
                        value={formData.subsector}
                        onChange={handleChange}
                        disabled={!formData.sectorEconomico}
                        className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50`}
                      >
                        <option value="">
                          {!formData.sectorEconomico
                            ? "Primero seleccione un sector"
                            : "Seleccione una actividad"}
                        </option>
                        {formData.sectorEconomico &&
                          actividadesPorSector[formData.sectorEconomico]?.map(
                            (actividad) => (
                              <option key={actividad} value={actividad}>
                                {actividad}
                              </option>
                            ),
                          )}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() =>
                      currentStep > 1
                        ? setCurrentStep(currentStep - 1)
                        : setShowModal(false)
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      darkMode
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {currentStep === 1 ? "Cancelar" : "Anterior"}
                  </button>
                  {currentStep < 2 ? (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={handleGuardarSolicitud}
                      className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Guardar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </Modal>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <Modal
              title="Rechazar Solicitud"
              onClose={() => setShowRejectModal(false)}
              darkMode={darkMode}
            >
              <div>
                <label
                  className={`block text-sm font-medium mb-1.5 ${labelStyle}`}
                >
                  Motivo del Rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  rows="4"
                  className={`w-full px-3 py-2 text-sm rounded-md border ${inputStyle} outline-none focus:ring-1 focus:ring-red-500`}
                  placeholder="Explique por qué se rechaza esta solicitud..."
                  autoFocus
                />

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      darkMode
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={updatingStatus}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarRechazo}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Rechazar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Modal>
          )}

          <Footer darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

// Subcomponents
const StatCard = ({ title, value, color = "default", darkMode }) => {
  const colors = {
    default: "border-gray-200 dark:border-gray-700",
    amber: "border-l-4 border-l-amber-500",
    emerald: "border-l-4 border-l-emerald-500",
    red: "border-l-4 border-l-red-500",
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border ${colors[color]} shadow-sm p-4`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-500" : "text-gray-400"}`}
      >
        {title}
      </p>
      <p
        className={`text-2xl font-semibold mt-1 ${darkMode ? "text-white" : "text-gray-800"}`}
      >
        {value}
      </p>
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  onClick,
  tooltip,
  variant = "default",
  darkMode,
}) => {
  const variants = {
    default: darkMode
      ? "text-gray-400 hover:bg-gray-700"
      : "text-gray-500 hover:bg-gray-100",
    success:
      "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30",
    danger:
      "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30",
  };

  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${variants[variant]}`}
      title={tooltip}
    >
      <Icon size={16} />
    </button>
  );
};

const EmptyState = ({ onNew, darkMode }) => (
  <div className="p-12 text-center">
    <FileText
      size={40}
      className={`mx-auto ${darkMode ? "text-gray-600" : "text-gray-300"} mb-3`}
    />
    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
      No hay solicitudes para mostrar
    </p>
    <button
      onClick={onNew}
      className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
    >
      <Plus size={16} />
      Crear primera solicitud
    </button>
  </div>
);

const Modal = ({ title, onClose, darkMode, children }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="fixed inset-0 bg-black/60" onClick={onClose}></div>
    <div className="flex min-h-full items-center justify-center p-4">
      <div
        className={`relative w-full max-w-2xl rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-xl max-h-[90vh] overflow-y-auto`}
      >
        <div
          className={`sticky top-0 px-5 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"} flex justify-between items-center ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h2
            className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  </div>
);

export default SolicitudesPersona;
