-- =============================================
-- TABLA: persona
-- =============================================
CREATE TABLE persona (
    nacionalidad VARCHAR(1) NOT NULL,
    cedula VARCHAR(20) NOT NULL PRIMARY KEY,
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
    tipo_persona VARCHAR(20) NOT NULL,
    email VARCHAR(100), -- Correo para login (opcional en persona)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    cedula_usuario VARCHAR(20) NOT NULL,
    clave VARCHAR(255) NOT NULL, -- Contraseña hasheada
    rol VARCHAR(20) NOT NULL,
    estatus VARCHAR(20),
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cedula_usuario) REFERENCES persona(cedula) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLA: clasificacion_emprendimiento
-- =============================================
CREATE TABLE clasificacion_emprendimiento ( 
    id_clasificacion SERIAL PRIMARY KEY,
    sector TEXT NOT NULL,
    actividad TEXT NOT NULL,
    n_ins_asig INT NOT NULL, -- Opciones (1 o 2)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: solicitud
-- =============================================
CREATE TABLE solicitud (
    id_solicitud SERIAL PRIMARY KEY,
    cedula_persona VARCHAR(20) NOT NULL,
    solicitud TEXT NOT NULL,
    fecha_solicitud VARCHAR(20),
    monto_solicitado VARCHAR(100),
    estatus VARCHAR(20),
    motivo_rechazo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cedula_persona) REFERENCES persona(cedula) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLA: emprendimiento (CORREGIDA)
-- =============================================
CREATE TABLE emprendimiento (
    id_emprendimiento SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_clasificacion INT NOT NULL,
    cedula_emprendimiento VARCHAR(20) NOT NULL,
    anos_experiencia VARCHAR (100) NOT null,
    nombre_emprendimiento TEXT NOT NULL,
    direccion_empredimiento TEXT NOT NULL,
    FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    FOREIGN KEY (id_clasificacion) REFERENCES clasificacion_emprendimiento(id_clasificacion),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

            INSERT INTO clasificacion_emprendimiento (sector, Actividad) VALUES
            (1, 'Tecnología - Desarrollo de software'),
            (1, 'Tecnología - Consultoría IT'),
            (2, 'Comercio - Venta de productos electrónicos'),
            (2, 'Comercio - Ropa y accesorios'),
            (3, 'Servicios - Marketing digital'),
            (3, 'Servicios - Diseño gráfico'),
            (4, 'Industria - Fabricación de muebles'),
            (4, 'Industria - Producción textil'),
            (5, 'Agroindustria - Cultivos orgánicos'),
            (5, 'Agroindustria - Ganadería sostenible');


-- =============================================
-- TABLA: requisitos
-- =============================================
CREATE TABLE requisitos ( 
    id_requisitos SERIAL PRIMARY KEY,
    nombre_requisito TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: expediente
-- =============================================
CREATE TABLE expediente ( 
    id_expediente SERIAL PRIMARY KEY,
    id_solicitud int NOT NULL,
    id_usuario int NOT NULL,
    id_requisitos TEXT NOT NULL,
    verificacion_requisitos TEXT,
    estatus VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    FOREIGN KEY (id_expediente) REFERENCES requisitos(id_requisitos)
);