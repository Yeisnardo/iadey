// pages/RegistroEmprendedor.jsx
// ============================================================================
// REGISTRO DE EMPRENDEDORES - IADEY
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Calendar,
  CheckCircle,
  Hash,
  Users,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import personaAPI from "../services/api_persona";
import usuarioAPI from "../services/api_usuario";

const RegistroEmprendedor = () => {
  const navigate = useNavigate();

  // --------------------------------------------------------------------------
  // 1. ESTADOS DEL COMPONENTE
  // --------------------------------------------------------------------------
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registroError, setRegistroError] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    nacionalidad: "",
    cedula: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    correo_local: "",
    correo_dominio: "",
    correo: "",
    estado_civil: "",
    direccion: "",
    estado: "Yaracuy",
    municipio: "",
    parroquia: "",
    tipo_persona: "emprendedor",
    clave: "",
    confirmPassword: "",
    aceptaTerminos: false,
  });

  const dominiosCorreo = [
    "gmail.com", "hotmail.com", "outlook.com", "yahoo.com",
    "yahoo.es", "outlook.es", "hotmail.es", "gmail.com.ve",
    "cantv.net", "movistar.com.ve", "digitel.com.ve",
  ];

  // --------------------------------------------------------------------------
  // 2. DATOS GEOGRÁFICOS
  // --------------------------------------------------------------------------
  
  const municipiosYaracuy = [
    "Aristides Bastidas", "Bolívar", "Bruzual", "Cocorote",
    "Independencia", "José Antonio Páez", "La Trinidad", "Manuel Monge",
    "Nirgua", "Peña", "San Felipe", "Sucre", "Urachiche", "Veroes",
  ];

  const parroquiasPorMunicipio = {
    "Aristides Bastidas": ["San Pablo"],
    Bolívar: ["Aroa"],
    Bruzual: ["Chivacoa", "Campo Elías"],
    Cocorote: ["Cocorote"],
    Independencia: ["Independencia"],
    "José Antonio Páez": ["Sabana de Parra"],
    "La Trinidad": ["Boraure"],
    "Manuel Monge": ["Yumare"],
    Nirgua: ["Nirgua", "Salom", "Temerla"],
    Peña: ["Yaritagua", "San Andrés"],
    "San Felipe": ["San Felipe", "Albarico", "San Javier"],
    Sucre: ["Sucre"],
    Urachiche: ["Urachiche"],
    Veroes: ["Farriar", "El Farrial"],
  };

  // --------------------------------------------------------------------------
  // 3. UTILIDADES DE FORMATEO
  // --------------------------------------------------------------------------
  
  // 🔧 NUEVA FUNCIÓN: Limpia el error de un campo específico
  const limpiarErrorCampo = (nombreCampo) => {
    if (fieldErrors[nombreCampo]) {
      setFieldErrors((prev) => ({
        ...prev,
        [nombreCampo]: null,
      }));
    }
    
    // También limpia el error general del registro si existe
    if (registroError) {
      setRegistroError("");
    }
  };
  
  // 🔧 NUEVA FUNCIÓN: Limpia todos los errores del paso actual
  const limpiarErroresPaso = () => {
    setFieldErrors({});
    setRegistroError("");
  };

  const capitalizeWhileTyping = (text) => {
    if (!text) return text;
    const words = text.split(" ");
    const processedWords = words.map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return processedWords.join(" ");
  };

  const formatearTelefono = (valor) => {
    let soloNumeros = valor.replace(/[^\d]/g, "");
    soloNumeros = soloNumeros.slice(0, 11);
    
    if (soloNumeros.length <= 4) {
      return soloNumeros;
    } else {
      return `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4)}`;
    }
  };

  // --------------------------------------------------------------------------
  // 4. VALIDACIONES AVANZADAS
  // --------------------------------------------------------------------------
  
  const validarCedulaVenezolana = (cedula, nacionalidad) => {
    if (nacionalidad === "V") {
      const soloNumeros = cedula.replace(/[^\d]/g, "");
      
      if (soloNumeros.length < 6 || soloNumeros.length > 8) {
        return "La cédula venezolana debe tener entre 6 y 8 dígitos";
      }
      
      if (/^0+$/.test(soloNumeros)) {
        return "La cédula no puede ser solo ceros";
      }
      
      if (/^(\d)\1{5,}$/.test(soloNumeros)) {
        return "La cédula no puede tener dígitos repetitivos";
      }
    } else if (nacionalidad === "E") {
      const soloNumeros = cedula.replace(/[^\d]/g, "");
      
      if (soloNumeros.length < 4 || soloNumeros.length > 12) {
        return "La cédula de extranjero debe tener entre 4 y 12 dígitos";
      }
    }
    return null;
  };

  const validarNombreCompleto = (nombre, tipo) => {
    const trimmed = nombre.trim();
    
    if (trimmed.length < 2) {
      return `Los ${tipo} deben tener al menos 2 caracteres`;
    }
    
    if (trimmed.length > 50) {
      return `Los ${tipo} no deben exceder los 50 caracteres`;
    }
    
    const caracteresInvalidos = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/;
    if (caracteresInvalidos.test(trimmed)) {
      return `Los ${tipo} solo deben contener letras y espacios`;
    }
    
    if (/\s{2,}/.test(trimmed)) {
      return `Los ${tipo} no deben tener múltiples espacios consecutivos`;
    }
    
    return null;
  };

  const validarTelefono = (telefono) => {
    const cleaned = telefono.replace(/[\s\-\(\)]/g, "");
    
    if (!/^[\d+]+$/.test(cleaned)) {
      return "El teléfono solo debe contener números y el signo +";
    }
    
    const venezuelanPattern = /^(?:(?:0412|0414|0416|0424|0410|0426|0418|0420)\d{7})$/;
    const internationalPattern = /^\+58(?:412|414|416|424|410|426|418|420)\d{7}$/;
    const landlinePattern = /^(?:0212|0234|0235|0236|0237|0238|0239|0240|0241|0242|0243|0244|0245|0246|0247|0248|0249|0251|0252|0253|0254|0255|0256|0257|0258|0259|0261|0262|0263|0264|0265|0266|0267|0268|0269|0271|0272|0273|0274|0275|0276|0277|0278|0279|0281|0282|0283|0284|0285|0286|0287|0288|0289)\d{7}$/;
    
    if (!venezuelanPattern.test(cleaned) && !internationalPattern.test(cleaned) && !landlinePattern.test(cleaned)) {
      return "Ingresa un número de teléfono venezolano válido (Ej: 0412-1234567 o +584121234567)";
    }
    
    return null;
  };

  const validarCorreo = (correo) => {
    if (formData.correo_local && formData.correo_local.includes("@")) {
      return "No incluyas @dominio en el nombre de usuario. Selecciona el dominio en la lista desplegable.";
    }
    
    if (!formData.correo_local) {
      return "Ingresa la parte local del correo (antes del @)";
    }
    
    if (!formData.correo_dominio) {
      return "Selecciona un dominio para tu correo";
    }
    
    if (formData.correo_local.length < 3) {
      return "El nombre de usuario debe tener al menos 3 caracteres";
    }
    
    if (formData.correo_local.length > 64) {
      return "El nombre de usuario es muy largo (máximo 64 caracteres)";
    }
    
    if (/^[._]|[._]$/.test(formData.correo_local)) {
      return "El nombre de usuario no puede empezar o terminar con puntos o guiones";
    }
    
    if (/[._]{2,}/.test(formData.correo_local)) {
      return "No se permiten puntos o guiones consecutivos";
    }
    
    if (!correo) {
      return "El correo no se ha generado correctamente";
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(correo)) {
      return "El correo generado no es válido";
    }
    
    return null;
  };

  const validarFechaNacimiento = (fecha) => {
    const fechaNac = new Date(fecha);
    const hoy = new Date();
    const fechaMinima = new Date("1930-01-01");
    
    if (isNaN(fechaNac.getTime())) {
      return "Fecha de nacimiento inválida";
    }
    
    if (fechaNac > hoy) {
      return "La fecha de nacimiento no puede ser futura";
    }
    
    if (fechaNac < fechaMinima) {
      return "Fecha de nacimiento demasiado antigua (anterior a 1930)";
    }
    
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    const dia = hoy.getDate() - fechaNac.getDate();
    
    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }
    
    if (edad < 18) {
      return "Debes ser mayor de 18 años para registrarte";
    }
    
    if (edad > 100) {
      return "Si eres mayor de 100 años, por favor contacta con soporte";
    }
    
    return null;
  };

  const validarDireccion = (direccion) => {
    if (direccion.length < 10) {
      return "La dirección debe tener al menos 10 caracteres";
    }
    
    if (direccion.length > 200) {
      return "La dirección no debe exceder los 200 caracteres";
    }
    
    if (!/\d/.test(direccion)) {
      return "La dirección debe incluir un número de casa, apartamento o referencia numérica";
    }
    
    const palabrasClave = [
      "calle", "avenida", "carrera", "transversal", "urbanización",
      "urb", "barrio", "sector", "casa", "apto", "apartamento", "piso"
    ];
    const tienePalabraClave = palabrasClave.some((palabra) =>
      direccion.toLowerCase().includes(palabra)
    );
    
    if (!tienePalabraClave) {
      return "La dirección debe ser más específica (incluye calle, avenida, urbanización, etc.)";
    }
    
    return null;
  };

  const validarContrasena = (contrasena) => {
    if (contrasena.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (contrasena.length > 50) {
      return "La contraseña no debe exceder los 50 caracteres";
    }
    
    if (!/[A-Z]/.test(contrasena)) {
      return "La contraseña debe contener al menos una letra mayúscula";
    }
    
    if (!/[a-z]/.test(contrasena)) {
      return "La contraseña debe contener al menos una letra minúscula";
    }
    
    if (!/[0-9]/.test(contrasena)) {
      return "La contraseña debe contener al menos un número";
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) {
      return "La contraseña debe contener al menos un carácter especial (!@#$%^&* etc.)";
    }
    
    // VALIDACIONES ELIMINADAS:
    // - No contiene nombre/apellido
    // - No contiene parte del correo
    // - No son secuencias comunes (123456, abc123, etc.)
    
    return null;
  };

  // --------------------------------------------------------------------------
  // 5. HANDLERS DEL FORMULARIO (MODIFICADOS PARA LIMPIAR ERRORES)
  // --------------------------------------------------------------------------
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 🔧 IMPORTANTE: Limpiar el error del campo que se está editando
    if (type !== "checkbox") {
      limpiarErrorCampo(name);
    }
    
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      
      if (checked && name === "aceptaTerminos") {
        limpiarErrorCampo("aceptaTerminos");
      }
      return;
    }
    
    let nuevoValor = value;
    
    if (name === "cedula") {
      nuevoValor = value.replace(/[^\d]/g, "");
    }
    
    if (name === "telefono") {
      nuevoValor = formatearTelefono(value);
    }
    
    if (name === "correo_local") {
      nuevoValor = value.toLowerCase().replace(/[^a-z0-9._]/g, "");
      
      if (nuevoValor.includes("@")) {
        nuevoValor = nuevoValor.split("@")[0];
        setFieldErrors(prev => ({
          ...prev,
          correo: "No incluyas @dominio aquí. Selecciona el dominio en la lista desplegable."
        }));
      } else {
        if (fieldErrors.correo === "No incluyas @dominio aquí. Selecciona el dominio en la lista desplegable.") {
          limpiarErrorCampo("correo");
        }
      }
      
      const correoCompleto = nuevoValor && formData.correo_dominio
        ? `${nuevoValor}@${formData.correo_dominio}`
        : "";
      
      setFormData((prev) => ({
        ...prev,
        correo_local: nuevoValor,
        correo: correoCompleto,
      }));
      return;
    }
    
    if (name === "correo_dominio") {
      const correoCompleto = formData.correo_local && value
        ? `${formData.correo_local}@${value}`
        : "";
      
      setFormData((prev) => ({
        ...prev,
        correo_dominio: value,
        correo: correoCompleto,
      }));
      return;
    }
    
    if (name === "nombres" || name === "apellidos") {
      nuevoValor = capitalizeWhileTyping(value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: nuevoValor }));
    
    if (name === "municipio") {
      setFormData((prev) => ({ ...prev, parroquia: "" }));
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validarCampo(name, value);
    
    // Solo mostrar error si el campo no está vacío después de la validación
    if (error && value.trim() !== "") {
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };
  
  // --------------------------------------------------------------------------
  // 6. VALIDACIONES DE CAMPOS INDIVIDUALES
  // --------------------------------------------------------------------------
  
  const validarCampo = (name, value) => {
    let error = null;
    
    switch (name) {
      case "cedula":
        error = validarCedulaVenezolana(value, formData.nacionalidad);
        break;
      case "nombres":
        error = validarNombreCompleto(value, "nombres");
        break;
      case "apellidos":
        error = validarNombreCompleto(value, "apellidos");
        break;
      case "telefono":
        error = validarTelefono(value);
        break;
      case "correo":
        error = validarCorreo(value);
        break;
      case "fecha_nacimiento":
        error = validarFechaNacimiento(value);
        break;
      case "direccion":
        error = validarDireccion(value);
        break;
      case "clave":
        error = validarContrasena(value);
        break;
      case "confirmPassword":
        if (value !== formData.clave) {
          error = "Las contraseñas no coinciden";
        }
        break;
      default:
        break;
    }
    
    return error;
  };
  
  // --------------------------------------------------------------------------
  // 7. VALIDACIONES DE PASOS COMPLETOS
  // --------------------------------------------------------------------------
  
  const validarPaso1 = () => {
    const errors = {};
    
    if (!formData.nacionalidad) errors.nacionalidad = "Por favor selecciona tu nacionalidad";
    
    if (!formData.cedula) {
      errors.cedula = "Por favor ingresa tu número de cédula";
    } else {
      const cedulaError = validarCedulaVenezolana(formData.cedula, formData.nacionalidad);
      if (cedulaError) errors.cedula = cedulaError;
    }
    
    if (!formData.nombres) {
      errors.nombres = "Por favor ingresa tus nombres";
    } else {
      const nombresError = validarNombreCompleto(formData.nombres, "nombres");
      if (nombresError) errors.nombres = nombresError;
    }
    
    if (!formData.apellidos) {
      errors.apellidos = "Por favor ingresa tus apellidos";
    } else {
      const apellidosError = validarNombreCompleto(formData.apellidos, "apellidos");
      if (apellidosError) errors.apellidos = apellidosError;
    }
    
    if (!formData.fecha_nacimiento) {
      errors.fecha_nacimiento = "Por favor selecciona tu fecha de nacimiento";
    } else {
      const fechaError = validarFechaNacimiento(formData.fecha_nacimiento);
      if (fechaError) errors.fecha_nacimiento = fechaError;
    }
    
    if (!formData.estado_civil) errors.estado_civil = "Por favor selecciona tu estado civil";
    
    if (!formData.telefono) {
      errors.telefono = "Por favor ingresa tu número de teléfono";
    } else {
      const telefonoError = validarTelefono(formData.telefono);
      if (telefonoError) errors.telefono = telefonoError;
    }
    
    if (!formData.correo) {
      errors.correo = "Por favor ingresa tu correo electrónico";
    } else {
      const correoError = validarCorreo(formData.correo);
      if (correoError) errors.correo = correoError;
    }
    
    if (!formData.direccion) {
      errors.direccion = "Por favor ingresa tu dirección de habitación";
    } else {
      const direccionError = validarDireccion(formData.direccion);
      if (direccionError) errors.direccion = direccionError;
    }
    
    if (!formData.municipio) errors.municipio = "Por favor selecciona tu municipio";
    if (!formData.parroquia) errors.parroquia = "Por favor selecciona tu parroquia";
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setRegistroError("Por favor corrige los errores marcados en el formulario");
      return false;
    }
    
    return true;
  };
  
  const validarPaso2 = () => {
    const errors = {};
    
    if (!formData.correo) {
      errors.correo = "Error: No se encontró el correo registrado";
    }
    
    if (!formData.clave) {
      errors.clave = "Por favor ingresa una contraseña";
    } else {
      const contrasenaError = validarContrasena(formData.clave);
      if (contrasenaError) {
        errors.clave = contrasenaError;
      }
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Por favor confirma tu contraseña";
    } else if (formData.clave !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    if (!formData.aceptaTerminos) {
      errors.aceptaTerminos = "Debes aceptar los términos y condiciones";
    }
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setRegistroError("Por favor corrige los errores marcados en el formulario");
      return false;
    }
    
    return true;
  };
  
  // --------------------------------------------------------------------------
  // 8. NAVEGACIÓN ENTRE PASOS
  // --------------------------------------------------------------------------
  
  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    limpiarErroresPaso();  // 🔧 Limpia errores al retroceder
  };
  
  // --------------------------------------------------------------------------
  // 9. ENVÍO DEL REGISTRO AL BACKEND
  // --------------------------------------------------------------------------
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      if (validarPaso1()) {
        setCurrentStep(2);
        limpiarErroresPaso();  // 🔧 Limpia errores al avanzar al paso 2
      }
      return;
    }
    
    if (currentStep === 2) {
      if (!validarPaso2()) return;
      
      setIsLoading(true);
      setRegistroError("");
      
      try {
        const cedulaFormateada = `${formData.nacionalidad.toUpperCase()}-${formData.cedula}`;
        
        const datosPersona = {
          nacionalidad: formData.nacionalidad,
          cedula: cedulaFormateada,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento,
          telefono: formData.telefono,
          correo: formData.correo,
          estado_civil: formData.estado_civil,
          direccion: formData.direccion,
          estado: formData.estado,
          municipio: formData.municipio,
          parroquia: formData.parroquia,
          tipo_persona: formData.tipo_persona,
        };
        
        const datosUsuario = {
          cedula_usuario: cedulaFormateada,
          clave: formData.clave,
          rol: "emprendedor",
          estatus: "activo",
        };
        
        await personaAPI.createPersona(datosPersona);
        await usuarioAPI.createUsuario(datosUsuario);
        
        setRegistroExitoso(true);
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        console.error("Error en registro:", error);
        
        if (error.response?.data?.message) {
          setRegistroError(error.response.data.message);
        } else if (error.response?.data?.error) {
          setRegistroError(error.response.data.error);
        } else if (error.message) {
          setRegistroError(error.message);
        } else {
          setRegistroError("Error al procesar el registro. Por favor intenta nuevamente");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // --------------------------------------------------------------------------
  // 10. EFECTOS SECUNDARIOS
  // --------------------------------------------------------------------------
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // --------------------------------------------------------------------------
  // 11. RENDERIZADO - INDICADOR DE PASOS
  // --------------------------------------------------------------------------
  
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "Datos Personales", icon: User },
      { number: 2, title: "Cuenta", icon: Mail },
    ];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${currentStep > step.number
                    ? "bg-green-500 text-white"
                    : currentStep === step.number
                      ? "bg-[#264653] text-white scale-110 shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }
                `}>
                  {currentStep > step.number ? (
                    <CheckCircle size={20} />
                  ) : (
                    <step.icon size={20} />
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600 font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-2 rounded
                  ${currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  // --------------------------------------------------------------------------
  // 12. RENDERIZADO - PASO 1 (DATOS PERSONALES)
  // --------------------------------------------------------------------------
  
  const renderPaso1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nacionalidad *
          </label>
          <select
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
              ${fieldErrors.nacionalidad ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Selecciona nacionalidad</option>
            <option value="V">Venezolano(a)</option>
            <option value="E">Extranjero(a)</option>
          </select>
          {fieldErrors.nacionalidad && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.nacionalidad}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cédula de Identidad *
          </label>
          <div className="relative">
            <Hash size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
                ${fieldErrors.cedula ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              placeholder="12345678"
              inputMode="numeric"
            />
          </div>
          {fieldErrors.cedula && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.cedula}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.nacionalidad
              ? `Formato: ${formData.nacionalidad}-12345678 (solo números)`
              : "Selecciona primero la nacionalidad"}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombres *
          </label>
          <input
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
              ${fieldErrors.nombres ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            placeholder="Tus nombres"
          />
          {fieldErrors.nombres && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.nombres}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Apellidos *
          </label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
              ${fieldErrors.apellidos ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            placeholder="Tus apellidos"
          />
          {fieldErrors.apellidos && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.apellidos}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fecha Nacimiento *
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
                ${fieldErrors.fecha_nacimiento ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            />
          </div>
          {fieldErrors.fecha_nacimiento && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.fecha_nacimiento}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Estado Civil *
          </label>
          <select
            name="estado_civil"
            value={formData.estado_civil}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
              ${fieldErrors.estado_civil ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Selecciona estado civil</option>
            <option value="Soltero">Soltero(a)</option>
            <option value="Casado">Casado(a)</option>
            <option value="Divorciado">Divorciado(a)</option>
            <option value="Viudo">Viudo(a)</option>
          </select>
          {fieldErrors.estado_civil && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.estado_civil}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Teléfono *
        </label>
        <div className="relative">
          <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
              ${fieldErrors.telefono ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            placeholder="0412-1234567"
            inputMode="numeric"
          />
        </div>
        {fieldErrors.telefono && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.telefono}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Formato: 0412-1234567</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Correo Electrónico *
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="correo_local"
              value={formData.correo_local}
              onChange={(e) => {
                let valor = e.target.value;
                
                if (valor.includes("@")) {
                  valor = valor.split("@")[0];
                  setFieldErrors(prev => ({
                    ...prev,
                    correo: "No incluyas @dominio aquí. Selecciona el dominio en la lista desplegable."
                  }));
                } else {
                  if (fieldErrors.correo === "No incluyas @dominio aquí. Selecciona el dominio en la lista desplegable.") {
                    limpiarErrorCampo("correo");
                  }
                }
                
                handleChange({ target: { name: "correo_local", value: valor } });
              }}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
                ${fieldErrors.correo ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              placeholder="usuario"
              inputMode="email"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-bold text-lg">@</span>
            <select
              name="correo_dominio"
              value={formData.correo_dominio}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`flex-1 sm:w-48 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
                ${fieldErrors.correo ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            >
              <option value="">Seleccionar dominio</option>
              {dominiosCorreo.map((dominio) => (
                <option key={dominio} value={dominio}>{dominio}</option>
              ))}
            </select>
          </div>
        </div>
        
        {fieldErrors.correo && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {fieldErrors.correo}
          </p>
        )}
        
        {formData.correo && !fieldErrors.correo && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle size={14} />
              Tu correo será: <strong>{formData.correo}</strong>
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Municipio *
          </label>
          <select
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
              ${fieldErrors.municipio ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Selecciona un municipio</option>
            {municipiosYaracuy.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {fieldErrors.municipio && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.municipio}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Parroquia *
          </label>
          <select
            name="parroquia"
            value={formData.parroquia}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!formData.municipio}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100
              ${fieldErrors.parroquia ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          >
            <option value="">Selecciona una parroquia</option>
            {formData.municipio && parroquiasPorMunicipio[formData.municipio]?.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {fieldErrors.parroquia && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.parroquia}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Dirección de Habitación *
        </label>
        <div className="relative">
          <Home size={18} className="absolute left-3 top-3 text-gray-400" />
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            onBlur={handleBlur}
            rows="3"
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent resize-y
              ${fieldErrors.direccion ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            placeholder="Calle, avenida, urbanización, casa/apto #, punto de referencia..."
          />
        </div>
        {fieldErrors.direccion && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.direccion}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Incluye calle, urbanización, número de casa/apto y puntos de referencia
        </p>
      </div>
      
      <input type="hidden" name="estado" value="Yaracuy" />
      <input type="hidden" name="tipo_persona" value="emprendedor" />
    </div>
  );
  
  // --------------------------------------------------------------------------
  // 13. RENDERIZADO - PASO 2 (CREACIÓN DE CUENTA)
  // --------------------------------------------------------------------------
  
  const renderPaso2 = () => {
    const getPasswordValidation = (password) => ({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
    
    const passwordValidations = getPasswordValidation(formData.clave);
    const allValidationsPassed = Object.values(passwordValidations).every(v => v === true);
    
    return (
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contraseña *
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="clave"
              value={formData.clave}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
                ${fieldErrors.clave && !allValidationsPassed ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.minLength ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                {passwordValidations.minLength && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={passwordValidations.minLength ? "text-green-600" : "text-gray-500"}>
                🔒 Mínimo 8 caracteres
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasUpperCase ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                {passwordValidations.hasUpperCase && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={passwordValidations.hasUpperCase ? "text-green-600" : "text-gray-500"}>
                🔠 Una mayúscula
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasLowerCase ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                {passwordValidations.hasLowerCase && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={passwordValidations.hasLowerCase ? "text-green-600" : "text-gray-500"}>
                🔡 Una minúscula
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasNumber ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                {passwordValidations.hasNumber && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={passwordValidations.hasNumber ? "text-green-600" : "text-gray-500"}>
                🔢 Un número
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordValidations.hasSpecialChar ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                {passwordValidations.hasSpecialChar && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={passwordValidations.hasSpecialChar ? "text-green-600" : "text-gray-500"}>
                🔣 Un carácter especial (!@#$%^&* etc.)
              </span>
            </div>
          </div>
          
          {fieldErrors.clave && !allValidationsPassed && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              {fieldErrors.clave}
            </p>
          )}
          
          {formData.clave && !allValidationsPassed && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} />
              ⚠️ Es OBLIGATORIO cumplir con TODOS los requisitos de seguridad
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
                ${fieldErrors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              placeholder="Repite tu contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>
        
        <div className="mt-6">
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="aceptaTerminos"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-4 h-4 text-[#264653] bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-[#264653] focus:ring-offset-2 cursor-pointer
                  ${fieldErrors.aceptaTerminos ? "border-red-500 bg-red-50" : ""}`}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="aceptaTerminos" className={`text-sm cursor-pointer select-none ${fieldErrors.aceptaTerminos ? "text-red-600" : "text-gray-700"}`}>
                Acepto los{" "}
                <a href="/terminos" target="_blank" rel="noopener noreferrer"
                  className="text-[#264653] font-semibold hover:text-[#2A9D8F] underline decoration-1 hover:decoration-2 transition-all"
                  onClick={(e) => e.stopPropagation()}>
                  Términos y Condiciones
                </a>
                {" "}y la{" "}
                <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer"
                  className="text-[#264653] font-semibold hover:text-[#2A9D8F] underline decoration-1 hover:decoration-2 transition-all"
                  onClick={(e) => e.stopPropagation()}>
                  Política de Privacidad
                </a>
                {" "}*
              </label>
            </div>
          </div>
          {fieldErrors.aceptaTerminos && (
            <div className="mt-2 ml-7 flex items-start gap-1.5">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-500 font-medium">{fieldErrors.aceptaTerminos}</p>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>
              Recuerda que este correo será tu usuario para iniciar sesión en el sistema.
              La contraseña debe ser segura y no compartirla con nadie.
            </span>
          </p>
        </div>
      </div>
    );
  };
  
  // --------------------------------------------------------------------------
  // 14. RENDER PRINCIPAL
  // --------------------------------------------------------------------------
  
  if (registroExitoso) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#264653] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Registro Exitoso!</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.
          </p>
          <p className="text-sm text-gray-500">Serás redirigido al login...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#264653] to-white flex items-center justify-center p-4">
      <div className={`
        bg-white rounded-2xl shadow-xl w-full max-w-2xl
        transform transition-all duration-700 ease-out
        border border-gray-100
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
      `}>
        <div className="bg-[#264653] px-8 py-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-xl">
              <Users size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Registro de Emprendedor - IADEY
              </h2>
              <p className="text-white/80 text-sm">
                Completa todos los pasos para inscribirte
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {renderStepIndicator()}
          
          {registroError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{registroError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderPaso1()}
            {currentStep === 2 && renderPaso2()}
            
            <div className="flex gap-3 pt-6 mt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Anterior
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  currentStep > 1 ? "flex-1" : "w-full"
                } bg-[#264653] text-white py-2.5 rounded-lg
                  hover:bg-[#1a3542] disabled:opacity-50 disabled:cursor-not-allowed 
                  flex items-center justify-center gap-2 font-medium transition-colors`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    {currentStep === 2 ? "Completar Registro" : "Siguiente"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-gray-600 text-sm mt-6">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#264653] font-semibold hover:text-[#2A9D8F] transition-colors"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroEmprendedor;