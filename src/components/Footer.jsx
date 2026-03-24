// components/Footer.jsx
import React from "react";
import { 
  Heart, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram
} from "lucide-react";

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  const quickLinks = [
    { text: "Inicio", href: "#" },
    { text: "Proyectos", href: "#" },
    { text: "Equipo", href: "#" },
    { text: "Documentos", href: "#" },
    { text: "Analíticas", href: "#" },
  ];

  const legalLinks = [
    { text: "Términos de uso", href: "#" },
    { text: "Política de privacidad", href: "#" },
    { text: "Cookies", href: "#" },
    { text: "Aviso legal", href: "#" },
  ];

  const contactInfo = [
    { icon: Mail, text: "info@iadey.gob.ve", href: "mailto:info@iadey.gob.ve" },
    { icon: Phone, text: "+58 212-555-1234", href: "tel:+582125551234" },
    { icon: MapPin, text: "Caracas, Venezuela", href: "#" },
  ];

  return (
    <footer className={`mt-auto ${
      darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-600'
    } border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      
      {/* Footer principal */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Columna 1 - Información de la empresa */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              IADEY
            </h3>
            <p className="text-sm leading-relaxed">
              Instituto de Apoyo al Desarrollo Económico de Yucatán. 
              Impulsando el crecimiento de emprendedores y empresas.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'hover:bg-gray-800 hover:text-white' 
                        : 'hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Columna 2 - Enlaces rápidos */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Enlaces rápidos
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm hover:text-[#2A9D8F] transition-colors ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 - Legal */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm hover:text-[#2A9D8F] transition-colors ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4 - Contacto */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Contacto
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index}>
                    <a
                      href={item.href}
                      className={`flex items-center gap-3 text-sm hover:text-[#2A9D8F] transition-colors ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span>{item.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className={`my-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}></div>

        {/* Footer inferior */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              © {currentYear} IADEY. Todos los derechos reservados.
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Versión 2.0.0 | Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Hecho con</span>
            <Heart size={16} className="text-red-500 fill-current animate-pulse" />
            <span className="text-sm">para emprendedores venezolanos</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Volver arriba
            </button>
          </div>
        </div>

        {/* Logos de instituciones (opcional) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-60">
          <img 
            src="/api/placeholder/80/30" 
            alt="Gobierno de Venezuela" 
            className="h-8 grayscale hover:grayscale-0 transition-all"
          />
          <img 
            src="/api/placeholder/80/30" 
            alt="Ministerio de Economía" 
            className="h-8 grayscale hover:grayscale-0 transition-all"
          />
          <img 
            src="/api/placeholder/80/30" 
            alt="IADEY" 
            className="h-8 grayscale hover:grayscale-0 transition-all"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;