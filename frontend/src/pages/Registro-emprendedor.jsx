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

const RegistroEmprendedor = () => {
  const navigate = useNavigate();
  
  // Estados
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registroError, setRegistroError] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos personales
    nacionalidad: "",
    cedula: "",
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    telefono: "",
    correo: "",
    estado_civil: "",
    direccion: "",
    estado: "Yaracuy",
    municipio: "",
    parroquia: "",
    tipo_persona: "emprendedor",
    // Datos de cuenta
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Datos de Yaracuy
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

  // Utilidades
  const capitalizeWhileTyping = (text) => {
    if (!text) return text;
    const words = text.split(' ');
    const processedWords = words.map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return processedWords.join(' ');
  };

  // Validaciones
  const validarPaso1 = () => {
    if (!formData.nacionalidad) {
      setRegistroError("Por favor selecciona tu nacionalidad");
      return false;
    }

    if (!formData.cedula) {
      setRegistroError("Por favor ingresa tu número de cédula");
      return false;
    }

    const cedulaRegex = /^(V-|E-)?[0-9]{6,8}$/i;
    if (!cedulaRegex.test(formData.cedula)) {
      setRegistroError("Formato de cédula inválido. Ejemplo: V-12345678 o 12345678");
      return false;
    }

    if (!formData.nombres) {
      setRegistroError("Por favor ingresa tus nombres");
      return false;
    }

    if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,50}$/.test(formData.nombres)) {
      setRegistroError("Los nombres solo deben contener letras (mínimo 2 caracteres)");
      return false;
    }

    if (!formData.apellidos) {
      setRegistroError("Por favor ingresa tus apellidos");
      return false;
    }

    if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,50}$/.test(formData.apellidos)) {
      setRegistroError("Los apellidos solo deben contener letras (mínimo 2 caracteres)");
      return false;
    }

    if (!formData.fechaNacimiento) {
      setRegistroError("Por favor selecciona tu fecha de nacimiento");
      return false;
    }

    const fechaNacimiento = new Date(formData.fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad;
    }
    if (edad < 18) {
      setRegistroError("Debes ser mayor de 18 años para registrarte");
      return false;
    }

    if (!formData.estado_civil) {
      setRegistroError("Por favor selecciona tu estado civil");
      return false;
    }

    if (!formData.telefono) {
      setRegistroError("Por favor ingresa tu número de teléfono");
      return false;
    }

    const telefonoRegex = /^(?:(?:\(?0?[124]?\)?)?\d{3}[-.]?\d{7}|\+?58[-.]?\d{3}[-.]?\d{7})$/;
    if (!telefonoRegex.test(formData.telefono)) {
      setRegistroError("Formato de teléfono inválido. Ejemplo: 0412-1234567 o 04121234567");
      return false;
    }

    if (!formData.correo) {
      setRegistroError("Por favor ingresa tu correo electrónico");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      setRegistroError("Formato de correo electrónico inválido. Ejemplo: usuario@dominio.com");
      return false;
    }

    if (!formData.direccion) {
      setRegistroError("Por favor ingresa tu dirección de habitación");
      return false;
    }

    if (formData.direccion.length < 10) {
      setRegistroError("La dirección debe ser más específica (mínimo 10 caracteres)");
      return false;
    }

    if (!formData.municipio) {
      setRegistroError("Por favor selecciona tu municipio");
      return false;
    }

    if (!formData.parroquia) {
      setRegistroError("Por favor selecciona tu parroquia");
      return false;
    }

    return true;
  };

  const validarPaso2 = () => {
    if (!formData.email) {
      setRegistroError("Por favor ingresa un correo para iniciar sesión");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setRegistroError("Formato de correo electrónico inválido. Ejemplo: usuario@dominio.com");
      return false;
    }

    if (!formData.password) {
      setRegistroError("Por favor ingresa una contraseña");
      return false;
    }

    if (formData.password.length < 8) {
      setRegistroError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setRegistroError("La contraseña debe contener al menos una letra mayúscula");
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setRegistroError("La contraseña debe contener al menos una letra minúscula");
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setRegistroError("La contraseña debe contener al menos un número");
      return false;
    }

    if (!formData.confirmPassword) {
      setRegistroError("Por favor confirma tu contraseña");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegistroError("Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "nombres" || name === "apellidos") {
      const capitalizedValue = capitalizeWhileTyping(value);
      setFormData((prev) => ({ ...prev, [name]: capitalizedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "municipio") {
      setFormData((prev) => ({ ...prev, parroquia: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (validarPaso1()) {
        setCurrentStep(2);
        setRegistroError("");
      }
    } else if (currentStep === 2) {
      if (validarPaso2()) {
        setIsLoading(true);
        setRegistroError("");

        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          console.log("Datos de registro:", formData);
          setRegistroExitoso(true);
          setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
          setRegistroError("Error al procesar el registro. Por favor intenta nuevamente");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    setRegistroError("");
  };

  // Renderizado de componentes
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nacionalidad *
          </label>
          <select
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
          >
            <option value="">Selecciona nacionalidad</option>
            <option value="V">Venezolano(a)</option>
            <option value="E">Extranjero(a)</option>
          </select>
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
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
              placeholder="V-12345678"
            />
          </div>
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
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
            placeholder="Tus nombres"
          />
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
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
            placeholder="Tus apellidos"
          />
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
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Estado Civil *
          </label>
          <select
            name="estado_civil"
            value={formData.estado_civil}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
          >
            <option value="">Selecciona estado civil</option>
            <option value="Soltero">Soltero(a)</option>
            <option value="Casado">Casado(a)</option>
            <option value="Divorciado">Divorciado(a)</option>
            <option value="Viudo">Viudo(a)</option>
            <option value="Union_Libre">Unión Libre</option>
          </select>
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
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
              placeholder="0412-1234567"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Correo *
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
              placeholder="ejemplo@correo.com"
            />
          </div>
        </div>
      </div>

      <input type="hidden" name="estado" value="Yaracuy" />
      <input type="hidden" name="tipo_persona" value="emprendedor" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Municipio *
          </label>
          <select
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
          >
            <option value="">Selecciona un municipio</option>
            {municipiosYaracuy.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Parroquia *
          </label>
          <select
            name="parroquia"
            value={formData.parroquia}
            onChange={handleChange}
            disabled={!formData.municipio}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
          >
            <option value="">Selecciona una parroquia</option>
            {formData.municipio &&
              parroquiasPorMunicipio[formData.municipio]?.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
          </select>
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
            rows="3"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent resize-y"
            placeholder="Calle, avenida, urbanización, casa/apto #, punto de referencia..."
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Incluye calle, urbanización, número de casa/apto y puntos de referencia
        </p>
      </div>
    </>
  );

  const renderPaso2 = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Correo para inicio de sesión *
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
            placeholder="ejemplo@correo.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Contraseña *
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
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
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#264653] focus:border-transparent"
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
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>
            Este correo será el que uses para iniciar sesión en el sistema.
          </span>
        </p>
      </div>
    </>
  );

  // Efectos
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Renderizado principal
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
            Tu solicitud ha sido enviada correctamente. Recibirás un correo de confirmación.
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
        {/* Header */}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {currentStep === 1 && renderPaso1()}
            {currentStep === 2 && renderPaso2()}

            {/* Botones de navegación */}
            <div className="flex gap-3 pt-4">
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