# 🔧 GUÍA RÁPIDA DE DIAGNÓSTICO Y TROUBLESHOOTING

## 🚀 Inicio Rápido

### ¿La aplicación no funciona?

**Paso 1: Verificar conexión a Supabase**
1. Abre la aplicación en el navegador (index.html)
2. Presiona **F12** para abrir la consola
3. Ejecuta: `testSupabaseConnection()`
4. Observa los resultados en la consola

### ¿La conexión falla?

Verifica:
- ✅ URL de Supabase en `config.js`
- ✅ API Key en `config.js`
- ✅ Conexión a Internet
- ✅ Las tablas existen en Supabase
- ✅ Las políticas RLS permiten acceso público (si aplica)

---

## 📋 Checklist de Funcionalidad

### Sección Alumnos ✅
- [ ] Crear nuevo alumno → Verificar que aparezca en lista
- [ ] Editar alumno → Cambiar nombre, email
- [ ] Eliminar alumno → Confirmar modal, verificar eliminación
- [ ] Validación email → Intentar email duplicado
- [ ] Validación formato → Intentar email inválido

### Sección Profesores ✅
- [ ] Crear profesor → Verificar en lista y en select de materias
- [ ] Editar profesor → Cambiar datos
- [ ] Eliminar profesor → Verificar eliminación

### Sección Materias ✅
- [ ] Crear materia con profesor → Verificar profesor aparece
- [ ] Editar materia → Cambiar profesor responsable
- [ ] Eliminar materia → Verificar notas relacionadas
- [ ] Select dinámico → Profesores se cargan automáticamente

### Sección Notas ✅
- [ ] Crear nota → Seleccionar alumno, materia, calificación
- [ ] Validación calificación → Intentar 101 o -1
- [ ] Editar nota → Cambiar calificación
- [ ] Eliminar nota → Verificar eliminación
- [ ] Vista enriquecida → Muestra nombre de alumno y materia

---

## 🔍 Herramientas de Diagnóstico

### Consola del Navegador (F12)

#### Ver logs de errores:
```javascript
// Los errores se registran automáticamente en consola
// Busca líneas rojas
```

#### Verificar estructura de BD:
```javascript
verificarEstructuraDB()
// Muestra todos los campos y datos de ejemplo
```

#### Monitorear operaciones:
```javascript
monitorearOperacionesCRUD()
// Cada INSERT/UPDATE/DELETE se registrará
```

#### Prueba manual de conexión:
```javascript
// Obtener todos los alumnos
const alumnos = await db.getAll('alumnos')
console.log(alumnos)

// Obtener alumno específico
const alumno = await db.getById('alumnos', 1)
console.log(alumno)

// Buscar emails duplicados
const existe = await db.isEmailUnique('alumnos', 'test@email.com')
console.log(existe) // true si es único, false si existe
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Cannot read property 'url' of undefined"
**Problema:** La base de datos no está inicializada
**Solución:** Espera a que la página cargue completamente (aprox. 2 segundos)

### Error: "401 Unauthorized"
**Problema:** API Key inválida o expirada
**Solución:** Verifica la API Key en config.js

### Error: "404 Not Found - Table not found"
**Problema:** Las tablas no existen en Supabase
**Solución:** Crea las tablas (ver SQL más abajo)

### Error: "Email already exists"
**Problema:** Intentas crear email duplicado
**Solución:** Usa otro email

### Error: "CORS issue"
**Problema:** Supabase no permite requisiciones desde este origen
**Solución:** Verifica CORS en Supabase → Auth → URL Configuration

### Nota: "Observación" no se guarda
**Problema:** Campo opcional que puede estar vacío
**Solución:** Es normal, es opcional

---

## 🗄️ Script SQL para Crear Tablas

Si las tablas no existen, copia y ejecuta este SQL en Supabase (SQL Editor):

```sql
-- Tabla de Alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id SERIAL PRIMARY KEY,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    curso TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Profesores
CREATE TABLE IF NOT EXISTS profesores (
    id SERIAL PRIMARY KEY,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    especialidad TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Materias
CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Notas
CREATE TABLE IF NOT EXISTS notas (
    id SERIAL PRIMARY KEY,
    alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
    materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    calificacion NUMERIC NOT NULL,
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_alumnos_email ON alumnos(email);
CREATE INDEX idx_profesores_email ON profesores(email);
CREATE INDEX idx_notas_alumno ON notas(alumno_id);
CREATE INDEX idx_notas_materia ON notas(materia_id);
```

---

## 🔐 Configurar Políticas RLS (Row Level Security)

Para permitir acceso público desde la aplicación:

1. Ir a Supabase → Proyecto → SQL Editor
2. Ejecutar para cada tabla:

```sql
-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública" 
ON alumnos FOR SELECT 
USING (true);

-- Permitir inserción
CREATE POLICY "Permitir inserción" 
ON alumnos FOR INSERT 
WITH CHECK (true);

-- Permitir actualización
CREATE POLICY "Permitir actualización" 
ON alumnos FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Permitir eliminación
CREATE POLICY "Permitir eliminación" 
ON alumnos FOR DELETE 
USING (true);
```

Repetir para: profesores, materias, notas

---

## 📊 Estructura de Datos

### Relación entre tablas:
```
PROFESORES (1) ──→ (N) MATERIAS ──→ (N) NOTAS ←─ (N) ALUMNOS
   │                                          │
   └──────────────────────────────────────────┘
      via profesor_id                   via alumno_id
```

### Diagrama Entity-Relationship (ER):
```
┌─────────────────────┐         ┌──────────────────────┐
│    ALUMNOS          │         │   PROFESORES         │
├─────────────────────┤         ├──────────────────────┤
│ id (PK)             │         │ id (PK)              │
│ nombres             │         │ nombres              │
│ apellidos           │         │ apellidos            │
│ email (UNIQUE)      │         │ email (UNIQUE)       │
│ fecha_nacimiento    │         │ especialidad         │
│ curso               │         └──────────────────────┘
└─────────────────────┘                  ▲
         ▲                                │
         │ alumno_id (FK)        profesor_id (FK)
         │                                │
┌─────────────────────────────────────────┴───────┐
│              NOTAS                               │
├──────────────────────────────────────────────────┤
│ id (PK)                                          │
│ alumno_id (FK) → ALUMNOS.id                     │
│ materia_id (FK) → MATERIAS.id                   │
│ calificacion (0-100)                            │
│ observacion (opcional)                          │
└──────────────────────────────────────────────────┘
         ▲
         │ materia_id (FK)
         │
┌────────────────────┐
│  MATERIAS          │
├────────────────────┤
│ id (PK)            │
│ nombre             │
│ descripcion        │
│ profesor_id (FK) ──┘
└────────────────────┘
```

---

## 📈 Monitoreo en Tiempo Real

### Habilitar logging detallado:
```javascript
// En consola, ejecutar:
monitorearOperacionesCRUD()

// Después de esto, cada operación se registrará:
// 📤 INSERT en alumnos: {nombres: "Juan", ...}
// ✅ Insertado: [{id: 1, nombres: "Juan", ...}]
```

### Ver todas las tablas y sus datos:
```javascript
const alumnos = await db.getAll('alumnos');
const profesores = await db.getAll('profesores');
const materias = await db.getAll('materias');
const notas = await db.getAll('notas');

console.table(alumnos);
console.table(profesores);
console.table(materias);
console.table(notas);
```

---

## ✅ Confirmación Final

La aplicación está 100% funcional cuando:

✅ `testSupabaseConnection()` muestra todos los tests en verde  
✅ Puedes crear un alumno y aparece en la lista  
✅ Puedes crear una nota y muestra alumno + materia  
✅ Los validadores previenen datos inválidos  
✅ Las eliminaciones muestran modal de confirmación  

---

## 📞 Contacto / Soporte

Si tienes problemas:

1. **Revisa la consola (F12)** para ver mensajes de error específicos
2. **Ejecuta testSupabaseConnection()** para diagnóstico automático
3. **Verifica config.js** tenga URL y API Key correctas
4. **Confirma tablas existen** en Supabase
5. **Revisa políticas RLS** si fallan operaciones

---

**Última actualización:** 18 de Noviembre 2025
**Versión:** 1.0 - Estable
**Estado:** ✅ OPERACIONAL

