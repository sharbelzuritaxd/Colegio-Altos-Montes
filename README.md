# 🏫 Sistema de Gestión Escolar - Documentación Completa

## 📋 Descripción del Proyecto

Sistema web completo de gestión escolar desarrollado con **Supabase** (PostgreSQL) como backend y **Materialize CSS** como framework frontend. Permite gestionar:

- ✅ **Alumnos** - Registro, edición, eliminación y listado
- ✅ **Profesores** - Gestión completa de docentes
- ✅ **Materias** - Asignación de profesores a materias
- ✅ **Notas** - Calificaciones por alumno y materia

## 🗂️ Estructura de Archivos

```
EscuelaSecundaria/
├── index.html                # Página principal (HTML5 semántico)
├── styles.css                # Estilos personalizados para Materialize
├── config.js                 # Configuración de Supabase
├── supabaseConnection.js     # Clase CRUD y conexión a BD
├── app.js                    # Lógica interactiva y gestión de UI
├── database_setup.sql        # Script de creación de tablas
└── README.md                 # Este archivo
```

## ⚙️ Configuración Inicial

### Paso 1: Crear Proyecto en Supabase

1. Accede a [supabase.io](https://supabase.io)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que esté listo

### Paso 2: Crear Tablas en Supabase

1. Ve al editor SQL de tu proyecto Supabase
2. Abre el archivo `database_setup.sql`
3. Copia el contenido completo
4. Pega en el editor SQL de Supabase
5. Ejecuta (click en "Run" o Ctrl+Enter)

### Paso 3: Obtener Credenciales

1. Ve a **Settings** → **API** en tu proyecto Supabase
2. Copia el **URL del Proyecto**
3. Copia la **Clave Anon (Pública)**

### Paso 4: Configurar Credenciales

Abre `config.js` y reemplaza:

```javascript
const SUPABASE_CONFIG = {
  url: "https://tu-proyecto.supabase.co",      // Tu URL de Supabase
  key: "tu-supabase-anon-key"                   // Tu clave anon
};
```

### Paso 5: Ejecutar la Aplicación

1. Abre `index.html` en tu navegador
2. ¡El sistema está listo para usar!

### Alternativa: Con Servidor Local (Recomendado)

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
npx http-server

# Luego abre: http://localhost:8000
```

## 📊 Estructura de Base de Datos

### Tabla: `alumnos`

| Campo | Tipo | Restricciones |
|-------|------|----------------|
| id | BIGSERIAL | PRIMARY KEY |
| nombres | VARCHAR(100) | NOT NULL |
| apellidos | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL, Validado |
| fecha_nacimiento | DATE | NOT NULL |
| curso | VARCHAR(20) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Tabla: `profesores`

| Campo | Tipo | Restricciones |
|-------|------|----------------|
| id | BIGSERIAL | PRIMARY KEY |
| nombres | VARCHAR(100) | NOT NULL |
| apellidos | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| especialidad | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Tabla: `materias`

| Campo | Tipo | Restricciones |
|-------|------|----------------|
| id | BIGSERIAL | PRIMARY KEY |
| nombre | VARCHAR(100) | NOT NULL |
| descripcion | TEXT | Optional |
| profesor_id | BIGINT | FK → profesores(id), ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Tabla: `notas`

| Campo | Tipo | Restricciones |
|-------|------|----------------|
| id | BIGSERIAL | PRIMARY KEY |
| alumno_id | BIGINT | FK → alumnos(id), ON DELETE CASCADE |
| materia_id | BIGINT | FK → materias(id), ON DELETE CASCADE |
| calificacion | NUMERIC(5,2) | CHECK (0-100) |
| observacion | TEXT | Optional |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**Relaciones:**
- Un profesor → Varias materias
- Una materia → Múltiples notas
- Un alumno → Múltiples notas
- Cada nota es única por (alumno, materia)

## 🔧 Funcionalidades Principales

### ✨ ALUMNOS

- **Registrar**: Formulario con validación de campos obligatorios
- **Listar**: Tabla dinámica con todos los alumnos
- **Editar**: Cargar datos en formulario y actualizar
- **Eliminar**: Con confirmación modal
- **Validación**: Email único y formato válido

### ✨ PROFESORES

- **CRUD Completo**: Crear, leer, actualizar, eliminar
- **Asociación**: Vínculo automático con materias
- **Validación**: Email único en el sistema
- **Listado**: Tabla actualizable en tiempo real

### ✨ MATERIAS

- **Crear/Editar**: Con select de profesor responsable
- **Descripción**: Campo de texto para detalles
- **Listado**: Muestra nombre y profesor asignado
- **Eliminación**: Cascada controlada si hay notas

### ✨ NOTAS

- **Registrar**: Selecciona alumno, materia y calificación
- **Validación**: Calificaciones entre 0 y 100
- **Observaciones**: Campo opcional para comentarios
- **Edición**: Actualizar notas después del registro
- **Jointure**: Muestra nombres de alumno y materia

## 🎨 Interfaz de Usuario

### Navbar
- Logo con ícono escuela
- Navegación entre tabs (Alumnos, Profesores, Materias, Notas)
- Responsive (menú lateral en mobile)

### Diseño Responsivo
- **Desktop**: 2 columnas (formulario + tabla)
- **Tablet**: 1 columna con cards stackeadas
- **Mobile**: Stack completo, tablas con scroll

### Componentes Materialize
- **Inputs**: Con etiquetas flotantes
- **Selects**: Dropdown para relaciones
- **Textareas**: Para descripciones y observaciones
- **Botones**: Colores significativos (azul=guardar, rojo=eliminar)
- **Modales**: Confirmación antes de eliminar
- **Toasts**: Notificaciones de éxito/error

## 📱 Validaciones

### Email
```javascript
// Validación de formato
regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Unicidad en BD
```

### Calificaciones
- Rango: 0 a 100
- Decimales: Hasta 2 posiciones (ej: 85.50)

### Campos Obligatorios
- Todos los campos marcados con "required" son validados
- Se muestra toast de advertencia si faltan

## 🚀 Métodos de la Clase SupabaseDB

```javascript
// Obtener todos los registros
await db.getAll(table, select);

// Obtener por ID
await db.getById(table, id);

// Insertar nuevo registro
await db.insert(table, data);

// Actualizar registro
await db.update(table, id, data);

// Eliminar registro
await db.delete(table, id);

// Query personalizado con filtros
await db.query(table, filter);

// Obtener con JOIN (relaciones)
await db.getWithJoin(table, select);

// Validar email único
await db.isEmailUnique(table, email, excludeId);

// Validar email (formato)
SupabaseDB.validateEmail(email);

// Validar calificación
SupabaseDB.validateGrade(grade);

// Formatear fecha
SupabaseDB.formatDate(date);
```

## 🔔 Sistema de Notificaciones

### Tipos de Toasts
```javascript
// Éxito (Verde)
showToast('Alumno registrado correctamente', 'success');

// Error (Rojo)
showToast('Error al cargar alumnos', 'error');

// Información (Azul)
showToast('Por favor completa todos los campos', 'info');

// Advertencia (Naranja)
showToast('Email inválido', 'warning');
```

## 🔐 Seguridad

### Recomendaciones
1. **Row Level Security (RLS)**: Descomenta en `database_setup.sql` para producción
2. **Validación Backend**: Supabase valida emails y calificaciones
3. **Constraints**: UNIQUE, CHECK y FK previenen datos inconsistentes
4. **Triggers**: Auto-actualización de timestamps

## 📋 Casos de Uso

### Crear un alumno y registrar notas

1. Tab **Alumnos** → Completa formulario → Guardar
2. Tab **Profesores** → Crea profesor
3. Tab **Materias** → Crea materia (asigna profesor)
4. Tab **Notas** → Selecciona alumno, materia, calificación

### Editar calificación

1. Tab **Notas** → Click en **Editar**
2. Cambia calificación y/u observación
3. Click en **Guardar**

### Eliminar registro

1. Click botón **Eliminar** en la tabla
2. Confirma en modal
3. Actualización instantánea de datos

## 🛠️ Troubleshooting

### "Error 401 al conectar"
- Verifica que `config.js` tiene URL y key correctas
- Revisa que la clave tiene permisos para REST API

### "Email ya existe"
- Ese email está registrado en BD
- Usa otro email o edita el registro existente

### "Calificación inválida"
- Debe estar entre 0 y 100
- Máximo 2 decimales

### Tabla vacía
- Verifica que ejecutaste el script `database_setup.sql`
- Revisa conexión a Supabase

### Tablas no se actualizan
- Abre consola de navegador (F12)
- Busca errores de red
- Verifica permisos en Supabase

## 📚 Recursos Útiles

- [Documentación Supabase](https://supabase.io/docs)
- [Materialize CSS Docs](https://materializecss.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/es/docs/Web/API/Fetch_API)

## 🎓 Aprendizajes Clave

Este proyecto integra:

1. **Frontend Moderno**: HTML5, CSS3, JavaScript ES6+
2. **Framework UI**: Materialize CSS responsive
3. **Backend as a Service**: Supabase con PostgreSQL
4. **API REST**: Fetch API para operaciones CRUD
5. **Validaciones**: Client-side y server-side
6. **Relaciones DB**: Foreign Keys, Cascadas, Triggers
7. **UX/UI**: Modales, toasts, validaciones visuales

## 📝 Notas Finales

- El código está comentado y es fácil de mantener
- Puedes agregar más validaciones según necesites
- Para producción, activa RLS en Supabase
- Considera agregar autenticación de usuarios
- Implementa paginación si tienes muchos registros

---

**Desarrollado con ❤️ usando Supabase y Materialize CSS**

Última actualización: Noviembre 2025
