-- =============================================
-- TABLA: persona
-- =============================================
CREATE TABLE persona (
    id SERIAL PRIMARY KEY,
    nacionalidad VARCHAR(1) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    estado_civil VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    parroquia VARCHAR(100) NOT NULL,
    tipo_persona VARCHAR(20) NOT NULL CHECK (tipo_persona IN ('emprendedor', 'cliente', 'administrador')),
    email VARCHAR(100), -- Correo para login (opcional en persona)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    cedula_usuario VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL, -- Contraseña hasheada
    rol VARCHAR(20) NOT NULL,
    estatus VARCHAR(20),
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cedula_usuario) REFERENCES persona(cedula) ON DELETE CASCADE ON UPDATE CASCADE
);