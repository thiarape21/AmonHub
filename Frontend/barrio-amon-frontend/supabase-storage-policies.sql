-- Políticas RLS para Supabase Storage - Bucket 'archivos'
-- ACCESO PÚBLICO - Sin necesidad de autenticación
-- Ejecuta este script en tu dashboard de Supabase (SQL Editor)

-- 1. Habilitar RLS en la tabla storage.objects (si no está habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Política para permitir INSERT (subir archivos) a TODOS los usuarios (público)
CREATE POLICY "Allow public upload to archivos bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'archivos'
);

-- 3. Política para permitir SELECT (ver/listar archivos) a TODOS los usuarios (público)
CREATE POLICY "Allow public read access to archivos bucket"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'archivos'
);

-- 4. Política para permitir UPDATE (actualizar archivos) a TODOS los usuarios (público)
CREATE POLICY "Allow public update to archivos bucket"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'archivos'
)
WITH CHECK (
  bucket_id = 'archivos'
);

-- 5. Política para permitir DELETE (eliminar archivos) a TODOS los usuarios (público)
CREATE POLICY "Allow public delete to archivos bucket"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'archivos'
);

-- 6. Configurar el bucket como PÚBLICO para acceso directo a URLs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'archivos';

-- 7. OPCIONAL: Si también quieres mantener acceso para usuarios autenticados
-- (estas políticas son redundantes pero no hacen daño)
CREATE POLICY "Allow authenticated upload to archivos bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'archivos'
);

CREATE POLICY "Allow authenticated read access to archivos bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'archivos'
);

CREATE POLICY "Allow authenticated update to archivos bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'archivos'
)
WITH CHECK (
  bucket_id = 'archivos'
);

CREATE POLICY "Allow authenticated delete to archivos bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'archivos'
); 