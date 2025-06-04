# Configuración de Supabase Storage - ACCESO PÚBLICO

## Problema: Error 400 (Bad Request) al subir archivos

El error que estás viendo se debe a que el bucket 'archivos' no tiene las políticas de Row Level Security (RLS) configuradas correctamente.

## Solución: Configurar Políticas RLS para ACCESO PÚBLICO

⚠️ **IMPORTANTE**: Esta configuración permite que **CUALQUIER PERSONA** pueda subir, ver, modificar y eliminar archivos sin autenticación. Úsala solo si es necesario para tu caso de uso.

### Paso 1: Acceder al Dashboard de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la sección **SQL Editor** en el menú lateral

### Paso 2: Ejecutar el Script SQL

Copia y pega el contenido del archivo `supabase-storage-policies.sql` en el SQL Editor y ejecuta el script.

### Paso 3: Verificar la Configuración

Después de ejecutar el script, verifica que:

1. **El bucket existe**: Ve a **Storage** > **Buckets** y confirma que el bucket 'archivos' existe
2. **El bucket es público**: Debe mostrar "Public" en la columna de visibilidad
3. **Las políticas están activas**: Ve a **Authentication** > **Policies** y verifica que las políticas para `storage.objects` están creadas

### Paso 4: Probar la Funcionalidad

1. **NO necesitas estar autenticado** - funciona para cualquier usuario
2. Ve a la página `/sandbox` en tu aplicación
3. Intenta subir un archivo

## Políticas Creadas

El script crea las siguientes políticas para **ACCESO PÚBLICO** al bucket 'archivos':

- **INSERT**: Permite a **CUALQUIER USUARIO** subir archivos
- **SELECT**: Permite a **CUALQUIER USUARIO** ver/listar archivos
- **UPDATE**: Permite a **CUALQUIER USUARIO** actualizar archivos
- **DELETE**: Permite a **CUALQUIER USUARIO** eliminar archivos

## Configuración del Bucket

El bucket se configura como **PÚBLICO** para permitir:
- Acceso directo a las URLs de los archivos
- Operaciones sin autenticación
- Máxima compatibilidad

## Troubleshooting

### Error: "Policy already exists"
Si ves este error al ejecutar el script:
```sql
-- Primero elimina las políticas existentes
DROP POLICY IF EXISTS "Allow public upload to archivos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to archivos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to archivos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete to archivos bucket" ON storage.objects;

-- Luego ejecuta el script completo
```

### Error: "Bucket does not exist"
Si el bucket 'archivos' no existe:
1. Ve a **Storage** > **Buckets**
2. Crea un nuevo bucket llamado 'archivos'
3. Márcalo como **Public**
4. Ejecuta el script SQL

### Archivos no se muestran
Si los archivos se suben pero no se muestran:
1. Verifica que el bucket sea **público**
2. Verifica que la política SELECT esté activa
3. Revisa la consola del navegador para errores

## Componentes Implementados

- **useSupabaseStorage**: Hook para manejar operaciones de storage
- **FileUploader**: Componente para subir archivos con drag & drop
- **Sandbox**: Página de pruebas para verificar la funcionalidad

## Uso en Producción

Para usar estos componentes en tu aplicación:

```tsx
import { FileUploader } from '@/components/storage/FileUploader';

// En tu componente - NO requiere autenticación
<FileUploader
  bucketName="archivos"
  folder="mi-carpeta"
  multiple={true}
  onUploadComplete={(files) => {
    console.log('Archivos subidos:', files);
  }}
/>
```

## Consideraciones de Seguridad

⚠️ **ADVERTENCIA**: Con esta configuración:
- Cualquier persona puede subir archivos maliciosos
- No hay control sobre el tamaño o tipo de archivos
- Los archivos pueden ser eliminados por cualquiera
- No hay trazabilidad de quién subió qué archivo

**Recomendaciones**:
- Implementa validación en el frontend
- Considera límites de tamaño y tipo de archivo
- Monitorea el uso del storage
- Considera implementar autenticación en el futuro 