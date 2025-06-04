-- Create proyectos table
CREATE TABLE IF NOT EXISTS proyectos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    objetivo_id INTEGER REFERENCES objetivos(id),
    estado_avance VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE,
    colaboradores TEXT,
    responsable VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create tareas table
CREATE TABLE IF NOT EXISTS tareas (
    id BIGSERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    responsable VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50) CHECK (estado IN ('Pendiente', 'En proceso', 'Completada', 'Cancelada')),
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create objetivos_smart table
CREATE TABLE IF NOT EXISTS objetivos_smart (
    id BIGSERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cumplida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create pdfs table
CREATE TABLE IF NOT EXISTS pdfs (
    id BIGSERIAL PRIMARY KEY,
    proyecto_id INTEGER REFERENCES proyectos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proyectos_objetivo_id ON proyectos(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_tareas_proyecto_id ON tareas(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_objetivos_smart_proyecto_id ON objetivos_smart(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_proyecto_id ON pdfs(proyecto_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_proyectos_updated_at
    BEFORE UPDATE ON proyectos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_updated_at
    BEFORE UPDATE ON tareas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objetivos_smart_updated_at
    BEFORE UPDATE ON objetivos_smart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdfs_updated_at
    BEFORE UPDATE ON pdfs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 