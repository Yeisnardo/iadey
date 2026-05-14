// pages/RegistroEmprendedor.jsx
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

  // ============================
  //  ESTADOS
  // ============================
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registroError, setRegistroError] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    // Datos personales
    nacionalidad: "",
    cedula: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    correo: "",
    estado_civil: "",
    direccion: "",
    estado: "Yaracuy",
    municipio: "",
    parroquia: "",
    tipo_persona: "emprendedor",
    // Datos de cuenta
    clave: "",
    confirmPassword: "",
  });

  // ============================
  //  DATOS GEOGRÁFICOS
  // ============================
  const municipiosYaracuy = [
    "Aristides Bastidas",
    "Bolívar",
    "Bruzual",
    "Cocorote",
    "Independencia",
    "José Antonio Páez",
    "La Trinidad",
    "Manuel Monge",
    "Nirgua",
    "Peña",
    "San Felipe",
    "Sucre",
    "Urachiche",
    "Veroes",
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

  // ============================
  //  UTILIDADES
  // ============================
  const capitalizeWhileTyping = (text) => {
    if (!text) return text;
    const words = text.split(" ");
    const processedWords = words.map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return processedWords.join(" ");
  };

  const formatearCedula = (cedula, nacionalidad) => {
    if (cedula.match(/^[VE]-\d+$/i)) {
      return cedula.toUpperCase();
    }
    if (/^\d+$/.test(cedula)) {
      return `${nacionalidad.toUpperCase()}-${cedula}`;
    }
    return cedula;
  };

  // ============================
  //  VALIDACIONES AVANZADAS
  // ============================
  
  const validarCedulaVenezolana = (cedula, nacionalidad) => {
    if (nacionalidad === "V") {
      const soloNumeros = cedula.replace(/[^\d]/g, '');
      
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
      const soloNumeros = cedula.replace(/[^\d]/g, '');
      
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
    
    if (trimmed === "") {
      return `Los ${tipo} no pueden estar vacíos`;
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
    const cleaned = telefono.replace(/[\s\-\(\)]/g, '');
    
    if (!/^[\d+]+$/.test(cleaned)) {
      return "El teléfono solo debe contener números y el signo +";
    }
    
    const venezuelanPattern = /^(?:(?:0412|0414|0416|0424|0410|0426|0418|0420)\d{7})$/;
    const internationalPattern = /^\+58(?:412|414|416|424|410|426|418|420)\d{7}$/;
    const landlinePattern = /^(?:0212|0234|0235|0236|0237|0238|0239|0240|0241|0242|0243|0244|0245|0246|0247|0248|0249|0251|0252|0253|0254|0255|0256|0257|0258|0259|0261|0262|0263|0264|0265|0266|0267|0268|0269|0271|0272|0273|0274|0275|0276|0277|0278|0279|0281|0282|0283|0284|0285|0286|0287|0288|0289)\d{7}$/;
    
    if (!venezuelanPattern.test(cleaned) && 
        !internationalPattern.test(cleaned) && 
        !landlinePattern.test(cleaned)) {
      return "Ingresa un número de teléfono venezolano válido (Ej: 0412-1234567 o +584121234567)";
    }
    
    return null;
  };

  const validarCorreo = (correo) => {
    if (correo.length > 100) {
      return "El correo electrónico no debe exceder los 100 caracteres";
    }
    
    const emailRegex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    
    if (!emailRegex.test(correo)) {
      return "Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)";
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
    
    const palabrasClave = ['calle', 'avenida', 'carrera', 'transversal', 'urbanización', 'urb', 'barrio', 'sector', 'casa', 'apto', 'apartamento', 'piso'];
    const tienePalabraClave = palabrasClave.some(palabra => direccion.toLowerCase().includes(palabra));
    
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
    
    const nombrePartes = formData.nombres?.toLowerCase().split(' ') || [];
    const apellidoPartes = formData.apellidos?.toLowerCase().split(' ') || [];
    const contrasenaLower = contrasena.toLowerCase();
    
    for (const parte of [...nombrePartes, ...apellidoPartes]) {
      if (parte.length > 3 && contrasenaLower.includes(parte)) {
        return "La contraseña no puede contener tu nombre o apellido";
      }
    }
    
    const correoParte = formData.correo?.split('@')[0].toLowerCase() || '';
    if (correoParte.length > 3 && contrasenaLower.includes(correoParte)) {
      return "La contraseña no puede contener partes de tu correo electrónico";
    }
    
    const secuenciasComunes = ['123456', 'abcdef', 'qwerty', 'password', 'admin', '12345678', 'abc123'];
    if (secuenciasComunes.some(seq => contrasenaLower.includes(seq))) {
      return "La contraseña contiene una secuencia muy común y fácil de adivinar";
    }
    
    return null;
  };

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
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error;
  };

  // ============================
  //  HANDLERS
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let nuevoValor = value;
    
    if (name === "nombres" || name === "apellidos") {
      nuevoValor = capitalizeWhileTyping(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));
    
    if (name === "municipio") {
      setFormData((prev) => ({ ...prev, parroquia: "" }));
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validarCampo(name, value);
  };

  const validarPaso1 = () => {
    const errors = {};
    
    if (!formData.nacionalidad) {
      errors.nacionalidad = "Por favor selecciona tu nacionalidad";
    }
    
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
    
    if (!formData.estado_civil) {
      errors.estado_civil = "Por favor selecciona tu estado civil";
    }
    
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
    
    if (!formData.municipio) {
      errors.municipio = "Por favor selecciona tu municipio";
    }
    
    if (!formData.parroquia) {
      errors.parroquia = "Por favor selecciona tu parroquia";
    }
    
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
      if (contrasenaError) errors.clave = contrasenaError;
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Por favor confirma tu contraseña";
    } else if (formData.clave !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setRegistroError("Por favor corrige los errores marcados en el formulario");
      return false;
    }
    
    return true;
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    setRegistroError("");
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      if (validarPaso1()) {
        setCurrentStep(2);
        setRegistroError("");
      }
      return;
    }
    
    if (currentStep === 2) {
      if (!validarPaso2()) return;
      
      setIsLoading(true);
      setRegistroError("");
      
      try {
        const cedulaFormateada = formatearCedula(
          formData.cedula,
          formData.nacionalidad,
        );
        
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
        
        console.log("Enviando datos de persona:", datosPersona);
        console.log("Enviando datos de usuario:", datosUsuario);
        
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
          setRegistroError(
            "Error al procesar el registro. Por favor intenta nuevamente",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ============================
  //  EFECTOS
  // ============================
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ============================
  //  RENDERIZADO DE COMPONENTES
  // ============================
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
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${
                      currentStep > step.number
                        ? "bg-green-500 text-white"
                        : currentStep === step.number
                          ? "bg-[#264653] text-white scale-110 shadow-lg"
                          : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
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
                <div
                  className={`
                    flex-1 h-1 mx-2 rounded
                    ${currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

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
              ${fieldErrors.nacionalidad ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
            Cédula *
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
                ${fieldErrors.cedula ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="V-12345678"
            />
          </div>
          {fieldErrors.cedula && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.cedula}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Formato: V-12345678 (6-8 dígitos)</p>
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
              ${fieldErrors.nombres ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
              ${fieldErrors.apellidos ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
                ${fieldErrors.fecha_nacimiento ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
              ${fieldErrors.estado_civil ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">Selecciona estado civil</option>
            <option value="Soltero">Soltero(a)</option>
            <option value="Casado">Casado(a)</option>
            <option value="Divorciado">Divorciado(a)</option>
            <option value="Viudo">Viudo(a)</option>
            <option value="Union_Libre">Unión Libre</option>
          </select>
          {fieldErrors.estado_civil && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.estado_civil}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                ${fieldErrors.telefono ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="0412-1234567"
            />
          </div>
          {fieldErrors.telefono && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.telefono}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Ej: 0412-1234567 o +584121234567</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo Electrónico *
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent
                ${fieldErrors.correo ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="ejemplo@correo.com"
            />
          </div>
          {fieldErrors.correo && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.correo}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Este correo será utilizado para iniciar sesión
          </p>
        </div>
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
              ${fieldErrors.municipio ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">Selecciona un municipio</option>
            {municipiosYaracuy.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
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
              ${fieldErrors.parroquia ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">Selecciona una parroquia</option>
            {formData.municipio &&
              parroquiasPorMunicipio[formData.municipio]?.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
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
              ${fieldErrors.direccion ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
  
  const renderPaso2 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Correo para inicio de sesión *
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            name="correo"
            value={formData.correo}
            readOnly
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-blue-600 mt-1">
          ✓ Este es el correo que registraste en Datos Personales
        </p>
      </div>
      
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
              ${fieldErrors.clave ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
        {fieldErrors.clave && (
          <p className="text-xs text-red-500 mt-1">{fieldErrors.clave}</p>
        )}
        <div className="text-xs text-gray-500 mt-1 space-x-2">
          <span>🔒 Mínimo 8 caracteres</span>
          <span>🔠 Una mayúscula</span>
          <span>🔡 Una minúscula</span>
          <span>🔢 Un número</span>
          <span>🔣 Un carácter especial</span>
        </div>
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
              ${fieldErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
  
  // ============================
  //  RENDER PRINCIPAL
  // ============================
  if (registroExitoso) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#264653] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            ¡Registro Exitoso!
          </h2>
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
      <div
        className={`
          bg-white rounded-2xl shadow-xl w-full max-w-2xl
          transform transition-all duration-700 ease-out
          border border-gray-100
          ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
        `}
      >
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
              <AlertCircle
                size={20}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
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
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
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