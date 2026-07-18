import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import recuperacionAPI from '../services/api_recuperacion'; // 👈 CAMBIADO

const SolicitarRecuperacion = () => {
    const navigate = useNavigate();
    const [cedula, setCedula] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!cedula.trim()) {
            setError('Por favor ingresa tu cédula');
            setIsLoading(false);
            return;
        }

        try {
            // 👇 USANDO LA FUNCIÓN CORRECTA
            const response = await recuperacionAPI.solicitarRecuperacion(cedula.trim());

            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Código enviado!',
                    text: 'Revisa tu correo electrónico para el código de verificación',
                    confirmButtonColor: '#264653',
                    confirmButtonText: 'Continuar'
                });
                
                navigate(`/verificar-codigo?token=${response.data.token}`);
            } else {
                throw new Error(response.error || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Error al procesar la solicitud';
            setError(errorMsg);
            
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMsg,
                confirmButtonColor: '#264653'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#264653] to-white flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 p-8">
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-[#264653] hover:text-[#2A9D8F] transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    <span>Volver al inicio de sesión</span>
                </button>

                <div className="text-center mb-8">
                    <div className="bg-[#264653]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} className="text-[#264653]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#264653]">Recuperar Contraseña</h2>
                    <p className="text-gray-600 text-sm mt-2">
                        Ingresa tu cédula para recibir un código de verificación en tu correo
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cédula de Identidad
                        </label>
                        <input
                            type="text"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#264653] focus:border-transparent"
                            placeholder="V-12345678"
                            disabled={isLoading}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            V para Venezolano | E para Extranjero
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#264653] text-white py-2.5 rounded-lg font-medium
                            hover:bg-[#1a3542] transition-all duration-200 disabled:opacity-50
                            disabled:cursor-not-allowed shadow-sm hover:shadow"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                <span>Enviando...</span>
                            </div>
                        ) : (
                            'Enviar código de recuperación'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        ¿Recordaste tu contraseña?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[#264653] font-semibold hover:text-[#2A9D8F] transition-colors"
                        >
                            Iniciar sesión
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SolicitarRecuperacion;