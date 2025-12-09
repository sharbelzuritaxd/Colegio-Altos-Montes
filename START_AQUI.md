# 🏫 Sistema de Gestión Escolar - Colegio Altos Montes

**Versión:** 1.0.1  
**Última actualización:** 18 de Noviembre 2025  
**Estado:** ✅ 100% Operacional

---

## 🎯 Inicio Rápido

### Para Comenzar (3 pasos)
1. **Abre** `login.html` en tu navegador
2. **Haz clic** en "Ingresar al Sistema"
3. **¡Comienza a usar!**

---

## 📖 Descripción

Sistema web completo para la gestión escolar del **Colegio Altos Montes**, que permite administrar:

- 👥 **Alumnos** - Crear, editar, eliminar estudiantes
- 👨‍🏫 **Profesores** - Gestión de docentes y especialidades
- 📚 **Materias** - Crear materias asignadas a profesores
- 📝 **Notas** - Registrar calificaciones de alumnos

---

## ✨ Características Principales

### 🎨 Interfaz
- ✅ Diseño profesional y moderno
- ✅ Responsive (funciona en móvil, tablet, desktop)
- ✅ Página de inicio con carátula del colegio
- ✅ Navegación por tabs
- ✅ Notificaciones tipo toast

### ⚙️ Funcionalidad
- ✅ CRUD completo (Crear, Leer, Editar, Eliminar)
- ✅ Validación de datos en tiempo real
- ✅ Emails únicos y formatos válidos
- ✅ Calificaciones validadas (0-100)
- ✅ Modal de confirmación para eliminaciones
- ✅ Datos en tiempo real desde Supabase

### 🔐 Seguridad
- ✅ Validación en cliente
- ✅ Validación de emails únicos
- ✅ Autenticación Bearer Token
- ✅ Manejo robusto de errores

---

## 🗂️ Estructura de Archivos

### Archivos Principales
```
login.html              ← PÁGINA DE INICIO (Abre esto primero)
index.html              ← Sistema principal
app.js                  ← Lógica de la aplicación
config.js               ← Configuración de Supabase
supabaseConnection.js   ← Clase de conexión a BD
styles.css              ← Estilos personalizados
pruebas.js              ← Herramientas de diagnóstico
```

### Documentación
```
CAMBIOS_IMPLEMENTADOS.md    ← Cambios recientes
VALIDACION_CONEXION.md      ← Detalles técnicos
DIAGNOSTICO.md              ← Troubleshooting
RESUMEN_FINAL.md            ← Resumen completo
```

---

## 🚀 Uso

### Desde la Página de Inicio
```
1. Abre login.html
2. Verás la carátula del Colegio Altos Montes
3. Haz clic en "Ingresar al Sistema"
4. ¡A usar!
```

### Acceso Directo
```
También puedes abrir index.html directamente,
pero se recomienda usar login.html para ver
la presentación del colegio.
```

---

## 📊 Módulos

### Alumnos
- Crear nuevo alumno
- Editar información
- Eliminar alumno
- Ver lista completa
- Validar email único

### Profesores
- Crear profesor con especialidad
- Editar datos
- Eliminar profesor
- Especialidad automáticamente en materias

### Materias
- Crear materia
- Asignar profesor responsable
- Editar materia
- Eliminar materia

### Notas
- Crear nota (Alumno + Materia + Calificación)
- Calificación 0-100
- Observaciones opcionales
- Ver lista con datos enriquecidos

---

## 🔧 Requisitos Técnicos

### Navegadores Soportados
- ✅ Chrome/Edge (Última versión)
- ✅ Firefox (Última versión)
- ✅ Safari (Última versión)
- ✅ Mobile browsers

### Tecnologías
- HTML5, CSS3, JavaScript ES6+
- Materialize CSS 1.0.0
- Material Icons
- Supabase (PostgreSQL)
- Fetch API

### Conexión
- Internet requerida
- Conexión a Supabase

---

## 🛠️ Configuración

### Base de Datos (Supabase)
La aplicación usa Supabase con 4 tablas:
- **alumnos** - Información de estudiantes
- **profesores** - Información de docentes
- **materias** - Cursos con profesor responsable
- **notas** - Calificaciones

### API Configuration
Modificar `config.js` si cambias la URL de Supabase:
```javascript
const SUPABASE_CONFIG = {
    url: "https://tu-proyecto.supabase.co",
    key: "tu-api-key"
};
```

---

## 🔍 Herramientas de Diagnóstico

### Disponibles en Consola (F12)

```javascript
// Prueba COMPLETA
testSupabaseConnection()

// Ver estructura de BD
verificarEstructuraDB()

// Monitorear operaciones
monitorearOperacionesCRUD()
```

---

## ⚠️ Solucionar Problemas

### Error al guardar datos
1. Abre consola (F12)
2. Ejecuta: `testSupabaseConnection()`
3. Verifica que todos los tests estén verdes
4. Consulta `DIAGNOSTICO.md`

### Los datos no aparecen en la lista
1. Espera 2 segundos a que carguen
2. Recarga la página (F5)
3. Ejecuta: `verificarEstructuraDB()`

### Error de conexión
1. Verifica conexión a internet
2. Comprueba que config.js tenga datos correctos
3. Revisa `DIAGNOSTICO.md`

---

## 📱 Responsive Design

La aplicación funciona perfectamente en:
- 🖥️ Desktop (1920x1080+)
- 💻 Laptop (1366x768)
- 📱 Tablet (768x1024)
- 📲 Mobile (375x667)

---

## 🎓 Guía de Uso

### Crear un Alumno
1. Abre la sección "Alumnos"
2. Completa el formulario
3. Haz clic en "Guardar"
4. Verás el alumno en la lista

### Crear una Nota
1. Ve a "Notas"
2. Selecciona alumno y materia
3. Ingresa calificación (0-100)
4. Haz clic en "Guardar"

### Editar Registro
1. Haz clic en "Editar" en cualquier fila
2. Modifica los datos
3. Haz clic en "Guardar"

### Eliminar Registro
1. Haz clic en "Eliminar"
2. Confirma en el modal
3. El registro se borra

---

## 📚 Documentación Incluida

Para más información, consulta:
- `CAMBIOS_IMPLEMENTADOS.md` - Cambios recientes
- `VALIDACION_CONEXION.md` - Detalles técnicos
- `DIAGNOSTICO.md` - Troubleshooting
- `RESUMEN_FINAL.md` - Resumen completo

---

## ✅ Checklist

Antes de usar en producción:
- [ ] Verificar conexión a Supabase
- [ ] Crear las 4 tablas (ver database_setup.sql)
- [ ] Configurar RLS en Supabase
- [ ] Probar en navegadores principales
- [ ] Ejecutar testSupabaseConnection()

---

## 🎉 Características Nuevas (v1.0.1)

✅ **Página de Inicio Profesional**
- Carátula del Colegio Altos Montes
- Botón "Ingresar al Sistema"
- Diseño moderno y atractivo

✅ **Corrección de Errores**
- Solucionado error de JSON parsing
- Ahora guarda y actualiza correctamente
- Sin errores en consola

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola (F12) para mensajes de error
2. Ejecuta `testSupabaseConnection()`
3. Consulta `DIAGNOSTICO.md`
4. Revisa `VALIDACION_CONEXION.md` para detalles técnicos

---

## 📄 Licencia

Este proyecto es para uso educativo del Colegio Altos Montes.

---

## 👤 Información

**Institución:** Colegio Altos Montes  
**Lema:** Excelencia Educativa  
**Versión:** 1.0.1  
**Año:** 2025  

---

## 🚀 ¡Comienza Ahora!

**Para empezar:**
1. Abre `login.html` en tu navegador
2. Haz clic en "Ingresar al Sistema"
3. ¡Disfruta la aplicación!

---

**Última actualización:** 18 de Noviembre 2025  
**Estado:** ✅ 100% Operacional  

