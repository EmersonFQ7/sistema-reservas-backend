-- backend/init.sql

-- Eliminar tablas si existen (para reiniciar limpio si es necesario)
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('CLIENTE', 'OPERADOR', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Servicios (Diseñada para layouts visuales de Pinterest)
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    duracion INT NOT NULL, -- En minutos
    imagen_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Reservas
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    servicio_id INT REFERENCES servicios(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- INSERTAR DATOS SEMILLA (Para pruebas iniciales)
-- =================================================================

-- Servicios iniciales con fotos verticales/horizontales variadas (Estilo Pinterest)
INSERT INTO servicios (titulo, descripcion, precio, duracion, imagen_url) VALUES
('Barbería Premium & Spa', 'Corte clásico con navaja, lavado con champú orgánico, exfoliación facial y masaje capilar relajante.', 45.00, 45, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600'),
('Sesión Fotográfica Urbana', 'Book de fotos profesional en exteriores de la ciudad. Incluye 15 fotos editadas en alta definición y asesoramiento de poses.', 120.00, 90, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600'),
('Clase de Yoga Vinyasa', 'Conecta cuerpo y mente fluidamente en una sesión grupal o individual apta para todos los niveles.', 20.00, 60, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600'),
('Manicura y Diseño Gel', 'Cuidado completo de uñas con esmaltado permanente y diseños minimalistas personalizados a mano alzada.', 35.00, 75, 'https://images.unsplash.com/photo-1604654894610-df490651e56c?q=80&w=600'),
('Masaje Descontracturante', 'Alivio profundo de tensiones acumuladas en espalda y cuello mediante aceites esenciales calientes.', 60.00, 60, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600'),
('Asesoría de Tatuaje Custom', 'Sesión de diseño conceptual con nuestro artista principal para armar tu próxima pieza única en la piel.', 15.00, 30, 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=600');