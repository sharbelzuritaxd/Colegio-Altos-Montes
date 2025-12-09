// ============================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN
// ============================================

// Variables globales para controlar el estado
let alumnoActual = null;
let profesorActual = null;
let materiaActual = null;
let notaActual = null;

let deleteCallback = null;
let deleteTarget = null;

// Datos en caché para búsquedas
let allData = {
  alumnos: [],
  profesores: [],
  materias: [],
  notas: []
};

// Función para cambiar de tab
function showTab(tabName) {
  const tabs = document.querySelectorAll('.tabs');
  if (tabs.length > 0) {
    M.Tabs.getInstance(tabs[0]).select(tabName + '-tab');
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar Materialize
  M.AutoInit();

  // Cargar datos iniciales - reducir espera
  setTimeout(async function() {
    await Promise.all([
      loadAlumnos(),
      loadProfesores(),
      loadMaterias(),
      loadNotas()
    ]);
  }, 300);

  // Configurar event listeners para formularios
  document.getElementById('form-alumno').addEventListener('submit', handleGuardarAlumno);
  document.getElementById('form-profesor').addEventListener('submit', handleGuardarProfesor);
  document.getElementById('form-materia').addEventListener('submit', handleGuardarMateria);
  document.getElementById('form-nota').addEventListener('submit', handleGuardarNota);

  // Configurar modal de confirmación
  document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmDelete);
});

// ============================================
// FUNCIONES DE NOTIFICACIÓN
// ============================================

function showToast(message, type = 'info', duration = 4000) {
  const classes = {
    'success': 'green',
    'error': 'red',
    'info': 'blue',
    'warning': 'orange'
  };

  M.toast({
    html: message,
    classes: classes[type] || classes['info'],
    displayLength: duration
  });
}

// ============================================
// CRUD ALUMNOS
// ============================================

async function loadAlumnos() {
  try {
    const alumnos = await db.getAll('alumnos', '*');
    allData.alumnos = alumnos;
    renderAlumnosList(alumnos);
  } catch (error) {
    console.error('Error al cargar alumnos:', error);
    showToast('Error al cargar alumnos', 'error');
  }
}

async function handleGuardarAlumno(e) {
  e.preventDefault();

  const id = document.getElementById('alumno-id').value;
  const nombres = document.getElementById('alumno-nombres').value.trim();
  const apellidos = document.getElementById('alumno-apellidos').value.trim();
  const email = document.getElementById('alumno-email').value.trim();
  const fechaNacimiento = document.getElementById('alumno-fecha-nacimiento').value;
  const curso = document.getElementById('alumno-curso').value.trim();

  // Validaciones
  if (!nombres || !apellidos || !email || !fechaNacimiento || !curso) {
    showToast('Por favor completa todos los campos', 'warning');
    return;
  }

  if (!SupabaseDB.validateEmail(email)) {
    showToast('Email inválido', 'error');
    return;
  }

  try {
    // Validar email único
    const isUnique = await db.isEmailUnique('alumnos', email, id || null);
    if (!isUnique) {
      showToast('Este email ya existe', 'error');
      return;
    }

    const data = {
      nombres,
      apellidos,
      email,
      fecha_nacimiento: SupabaseDB.formatDate(fechaNacimiento),
      curso
    };

    if (id) {
      // Actualizar
      await db.update('alumnos', id, data);
      showToast('Alumno actualizado correctamente', 'success');
    } else {
      // Insertar
      await db.insert('alumnos', data);
      showToast('Alumno registrado correctamente', 'success');
    }

    document.getElementById('form-alumno').reset();
    resetAlumnoForm();
    await loadAlumnos();
    await loadNotasWithJoins(); // Recargar notas para actualizar opciones
  } catch (error) {
    console.error('Error al guardar alumno:', error);
    showToast('Error al guardar alumno: ' + error.message, 'error');
  }
}

function renderAlumnosList(alumnos) {
  const container = document.getElementById('alumnos-list');

  if (!alumnos || alumnos.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="material-icons">person_outline</i>
        <p>No hay alumnos registrados</p>
      </div>
    `;
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Nombres</th>
        <th>Apellidos</th>
        <th>Email</th>
        <th>Curso</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${alumnos.map(alumno => `
        <tr>
          <td>${alumno.nombres}</td>
          <td>${alumno.apellidos}</td>
          <td>${alumno.email}</td>
          <td>${alumno.curso}</td>
          <td>
            <button class="action-btn btn-edit" onclick="editAlumno(${alumno.id})">
              <i class="material-icons">edit</i> Editar
            </button>
            <button class="action-btn btn-delete" onclick="confirmDelete('alumnos', ${alumno.id}, 'alumno')">
              <i class="material-icons">delete</i> Eliminar
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.innerHTML = '';
  container.appendChild(table);
}

async function editAlumno(id) {
  try {
    const alumno = await db.getById('alumnos', id);
    if (alumno) {
      document.getElementById('alumno-id').value = alumno.id;
      document.getElementById('alumno-nombres').value = alumno.nombres;
      document.getElementById('alumno-apellidos').value = alumno.apellidos;
      document.getElementById('alumno-email').value = alumno.email;
      document.getElementById('alumno-fecha-nacimiento').value = alumno.fecha_nacimiento;
      document.getElementById('alumno-curso').value = alumno.curso;

      // Actualizar etiqueta del formulario
      M.updateTextFields();

      // Scroll al formulario
      document.getElementById('form-alumno').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error al editar alumno:', error);
    showToast('Error al cargar datos del alumno', 'error');
  }
}

function resetAlumnoForm() {
  document.getElementById('alumno-id').value = '';
  document.getElementById('form-alumno').reset();
  M.updateTextFields();
}

// ============================================
// CRUD PROFESORES
// ============================================

async function loadProfesores() {
  try {
    const profesores = await db.getAll('profesores', '*');
    allData.profesores = profesores;
    renderProfesoresList(profesores);
    
    // Actualizar datalist en materias
    updateProfesorSelect(profesores);
  } catch (error) {
    console.error('Error al cargar profesores:', error);
    showToast('Error al cargar profesores', 'error');
  }
}

async function handleGuardarProfesor(e) {
  e.preventDefault();

  const id = document.getElementById('profesor-id').value;
  const nombres = document.getElementById('profesor-nombres').value.trim();
  const apellidos = document.getElementById('profesor-apellidos').value.trim();
  const email = document.getElementById('profesor-email').value.trim();
  const especialidad = document.getElementById('profesor-especialidad').value.trim();

  // Validaciones
  if (!nombres || !apellidos || !email || !especialidad) {
    showToast('Por favor completa todos los campos', 'warning');
    return;
  }

  if (!SupabaseDB.validateEmail(email)) {
    showToast('Email inválido', 'error');
    return;
  }

  try {
    // Validar email único
    const isUnique = await db.isEmailUnique('profesores', email, id || null);
    if (!isUnique) {
      showToast('Este email ya existe', 'error');
      return;
    }

    const data = {
      nombres,
      apellidos,
      email,
      especialidad
    };

    if (id) {
      // Actualizar
      await db.update('profesores', id, data);
      showToast('Profesor actualizado correctamente', 'success');
    } else {
      // Insertar
      await db.insert('profesores', data);
      showToast('Profesor registrado correctamente', 'success');
    }

    document.getElementById('form-profesor').reset();
    resetProfesorForm();
    await loadProfesores();
    await loadMaterias(); // Recargar materias
  } catch (error) {
    console.error('Error al guardar profesor:', error);
    showToast('Error al guardar profesor: ' + error.message, 'error');
  }
}

function renderProfesoresList(profesores) {
  const container = document.getElementById('profesores-list');

  if (!profesores || profesores.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="material-icons">person_outline</i>
        <p>No hay profesores registrados</p>
      </div>
    `;
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Nombres</th>
        <th>Apellidos</th>
        <th>Email</th>
        <th>Especialidad</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${profesores.map(profesor => `
        <tr>
          <td>${profesor.nombres}</td>
          <td>${profesor.apellidos}</td>
          <td>${profesor.email}</td>
          <td>${profesor.especialidad}</td>
          <td>
            <button class="action-btn btn-edit" onclick="editProfesor(${profesor.id})">
              <i class="material-icons">edit</i> Editar
            </button>
            <button class="action-btn btn-delete" onclick="confirmDelete('profesores', ${profesor.id}, 'profesor')">
              <i class="material-icons">delete</i> Eliminar
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.innerHTML = '';
  container.appendChild(table);
}

function updateProfesorSelect(profesores) {
  // Crear datalist si no existe
  let datalist = document.getElementById('profesores-datalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'profesores-datalist';
    document.body.appendChild(datalist);
  }
  
  datalist.innerHTML = '';
  profesores.forEach(profesor => {
    const option = document.createElement('option');
    option.value = profesor.id;
    option.textContent = `${profesor.nombres} ${profesor.apellidos}`;
    datalist.appendChild(option);
  });
}

async function editProfesor(id) {
  try {
    const profesor = await db.getById('profesores', id);
    if (profesor) {
      document.getElementById('profesor-id').value = profesor.id;
      document.getElementById('profesor-nombres').value = profesor.nombres;
      document.getElementById('profesor-apellidos').value = profesor.apellidos;
      document.getElementById('profesor-email').value = profesor.email;
      document.getElementById('profesor-especialidad').value = profesor.especialidad;

      M.updateTextFields();
      document.getElementById('form-profesor').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error al editar profesor:', error);
    showToast('Error al cargar datos del profesor', 'error');
  }
}

function resetProfesorForm() {
  document.getElementById('profesor-id').value = '';
  document.getElementById('form-profesor').reset();
  M.updateTextFields();
}

// ============================================
// CRUD MATERIAS
// ============================================

async function loadMaterias() {
  try {
    // Obtener materias simples
    const materias = await db.getAll('materias');
    allData.materias = materias;
    
    // Obtener profesores para enriquecer datos
    const profesores = await db.getAll('profesores');
    const profesorMap = {};
    profesores.forEach(prof => {
      profesorMap[prof.id] = `${prof.nombres} ${prof.apellidos}`;
    });
    
    // Agregar nombre del profesor a cada materia
    const materiasConProfe = materias.map(mat => ({
      ...mat,
      profesor_nombre: profesorMap[mat.profesor_id] || 'Sin asignar'
    }));
    
    renderMateriasList(materiasConProfe);
    updateMateriaSelect(materias);
  } catch (error) {
    console.error('Error al cargar materias:', error);
    showToast('Error al cargar materias', 'error');
  }
}

async function handleGuardarMateria(e) {
  e.preventDefault();

  const id = document.getElementById('materia-id').value;
  const nombre = document.getElementById('materia-nombre').value.trim();
  const descripcion = document.getElementById('materia-descripcion').value.trim();
  const profesorName = document.getElementById('materia-profesor-id').value;

  // Validaciones
  if (!nombre || !profesorName) {
    showToast('Por favor completa los campos requeridos', 'warning');
    return;
  }

  try {
    // Convertir nombre del profesor a ID
    const profesor = allData.profesores ? allData.profesores.find(p => 
      `${p.nombres} ${p.apellidos}`.toLowerCase() === profesorName.toLowerCase()
    ) : null;

    if (!profesor) {
      showToast('Profesor no encontrado', 'error');
      return;
    }

    const data = {
      nombre,
      descripcion,
      profesor_id: profesor.id
    };

    if (id) {
      // Actualizar
      await db.update('materias', id, data);
      showToast('Materia actualizada correctamente', 'success');
    } else {
      // Insertar
      await db.insert('materias', data);
      showToast('Materia registrada correctamente', 'success');
    }

    document.getElementById('form-materia').reset();
    resetMateriaForm();
    await loadMaterias();
  } catch (error) {
    console.error('Error al guardar materia:', error);
    showToast('Error al guardar materia: ' + error.message, 'error');
  }
}

function renderMateriasList(materias) {
  const container = document.getElementById('materias-list');

  if (!materias || materias.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="material-icons">book_outline</i>
        <p>No hay materias registradas</p>
      </div>
    `;
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Descripción</th>
        <th>Profesor</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${materias.map(materia => `
        <tr>
          <td>${materia.nombre}</td>
          <td>${materia.descripcion || '-'}</td>
          <td>${materia.profesor_nombre || '-'}</td>
          <td>
            <button class="action-btn btn-edit" onclick="editMateria(${materia.id})">
              <i class="material-icons">edit</i> Editar
            </button>
            <button class="action-btn btn-delete" onclick="confirmDelete('materias', ${materia.id}, 'materia')">
              <i class="material-icons">delete</i> Eliminar
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.innerHTML = '';
  container.appendChild(table);
}

function updateMateriaSelect(materias) {
  // Crear datalist si no existe
  let datalist = document.getElementById('materias-datalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'materias-datalist';
    document.body.appendChild(datalist);
  }
  
  datalist.innerHTML = '';
  materias.forEach(materia => {
    const option = document.createElement('option');
    option.value = materia.id;
    option.textContent = materia.nombre;
    datalist.appendChild(option);
  });
}

async function editMateria(id) {
  try {
    const materia = await db.getById('materias', id);
    if (materia) {
      // Obtener nombre del profesor
      const profesor = await db.getById('profesores', materia.profesor_id);
      
      document.getElementById('materia-id').value = materia.id;
      document.getElementById('materia-nombre').value = materia.nombre;
      document.getElementById('materia-descripcion').value = materia.descripcion || '';
      document.getElementById('materia-profesor-id').value = profesor ? `${profesor.nombres} ${profesor.apellidos}` : '';

      M.updateTextFields();
      document.getElementById('form-materia').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error al editar materia:', error);
    showToast('Error al cargar datos de la materia', 'error');
  }
}

function resetMateriaForm() {
  document.getElementById('materia-id').value = '';
  document.getElementById('form-materia').reset();
  M.updateTextFields();
  M.FormSelect.init(document.getElementById('materia-profesor-id'));
}

// ============================================
// CRUD NOTAS
// ============================================

async function loadNotas() {
  try {
    const alumnos = await db.getAll('alumnos', 'id,nombres,apellidos');
    updateAlumnoSelect(alumnos);
    
    await loadNotasWithJoins();
  } catch (error) {
    console.error('Error al cargar notas:', error);
    showToast('Error al cargar notas', 'error');
  }
}

async function loadNotasWithJoins() {
  try {
    // Obtener notas simples
    const notas = await db.getAll('notas');
    allData.notas = notas;
    
    // Obtener alumnos y materias para enriquecer datos
    const alumnos = await db.getAll('alumnos');
    const materias = await db.getAll('materias');
    
    // Crear mapas para buscar rápido
    const alumnoMap = {};
    const materiaMap = {};
    
    alumnos.forEach(alumno => {
      alumnoMap[alumno.id] = { nombres: alumno.nombres, apellidos: alumno.apellidos };
    });
    
    materias.forEach(materia => {
      materiaMap[materia.id] = { nombre: materia.nombre };
    });
    
    // Enriquecer notas con datos relacionados
    const notasConDatos = notas.map(nota => ({
      ...nota,
      alumno: alumnoMap[nota.alumno_id] || { nombres: 'Desconocido', apellidos: '' },
      materia: materiaMap[nota.materia_id] || { nombre: 'Desconocida' }
    }));
    
    renderNotasList(notasConDatos);
  } catch (error) {
    console.error('Error al cargar notas con joins:', error);
    showToast('Error al cargar notas', 'error');
  }
}

async function handleGuardarNota(e) {
  e.preventDefault();

  const id = document.getElementById('nota-id').value;
  const alumnoName = document.getElementById('nota-alumno-id').value;
  const materiaName = document.getElementById('nota-materia-id').value;
  const calificacion = document.getElementById('nota-calificacion').value;
  const observacion = document.getElementById('nota-observacion').value.trim();

  // Validaciones
  if (!alumnoName || !materiaName || !calificacion) {
    showToast('Por favor completa todos los campos requeridos', 'warning');
    return;
  }

  if (!SupabaseDB.validateGrade(calificacion)) {
    showToast('La calificación debe estar entre 0 y 100', 'error');
    return;
  }

  try {
    // Convertir nombres a IDs
    const alumno = allData.alumnos ? allData.alumnos.find(a => 
      `${a.nombres} ${a.apellidos}`.toLowerCase() === alumnoName.toLowerCase()
    ) : null;
    const materia = allData.materias ? allData.materias.find(m => 
      m.nombre.toLowerCase() === materiaName.toLowerCase()
    ) : null;

    if (!alumno || !materia) {
      showToast('Alumno o materia no encontrado', 'error');
      return;
    }

    const data = {
      alumno_id: alumno.id,
      materia_id: materia.id,
      calificacion: parseFloat(calificacion),
      observacion
    };

    if (id) {
      // Actualizar
      await db.update('notas', id, data);
      showToast('Nota actualizada correctamente', 'success');
    } else {
      // Insertar
      await db.insert('notas', data);
      showToast('Nota registrada correctamente', 'success');
    }

    document.getElementById('form-nota').reset();
    resetNotaForm();
    await loadNotasWithJoins();
  } catch (error) {
    console.error('Error al guardar nota:', error);
    showToast('Error al guardar nota: ' + error.message, 'error');
  }
}

function renderNotasList(notas) {
  const container = document.getElementById('notas-list');

  if (!notas || notas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="material-icons">grade_outline</i>
        <p>No hay notas registradas</p>
      </div>
    `;
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Alumno</th>
        <th>Materia</th>
        <th>Calificación</th>
        <th>Observación</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${notas.map(nota => `
        <tr>
          <td>${nota.alumno.nombres} ${nota.alumno.apellidos}</td>
          <td>${nota.materia.nombre}</td>
          <td class="text-bold">${nota.calificacion.toFixed(2)}</td>
          <td>${nota.observacion || '-'}</td>
          <td>
            <button class="action-btn btn-edit" onclick="editNota(${nota.id})">
              <i class="material-icons">edit</i> Editar
            </button>
            <button class="action-btn btn-delete" onclick="confirmDelete('notas', ${nota.id}, 'nota')">
              <i class="material-icons">delete</i> Eliminar
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.innerHTML = '';
  container.appendChild(table);
}

function updateAlumnoSelect(alumnos) {
  // Crear datalist si no existe
  let datalist = document.getElementById('alumnos-datalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'alumnos-datalist';
    document.body.appendChild(datalist);
  }
  
  datalist.innerHTML = '';
  alumnos.forEach(alumno => {
    const option = document.createElement('option');
    option.value = alumno.id;
    option.textContent = `${alumno.nombres} ${alumno.apellidos}`;
    datalist.appendChild(option);
  });
}

async function editNota(id) {
  try {
    const nota = await db.getById('notas', id);
    if (nota) {
      // Obtener nombres de alumno y materia
      const alumno = await db.getById('alumnos', nota.alumno_id);
      const materia = await db.getById('materias', nota.materia_id);
      
      document.getElementById('nota-id').value = nota.id;
      document.getElementById('nota-alumno-id').value = alumno ? `${alumno.nombres} ${alumno.apellidos}` : '';
      document.getElementById('nota-materia-id').value = materia ? materia.nombre : '';
      document.getElementById('nota-calificacion').value = nota.calificacion;
      document.getElementById('nota-observacion').value = nota.observacion || '';

      M.updateTextFields();
      document.getElementById('form-nota').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error al editar nota:', error);
    showToast('Error al cargar datos de la nota', 'error');
  }
}

function resetNotaForm() {
  document.getElementById('nota-id').value = '';
  document.getElementById('form-nota').reset();
  M.updateTextFields();
}

// ============================================
// FUNCIONES DE ELIMINACIÓN
// ============================================

function confirmDelete(table, id, type) {
  deleteCallback = async () => {
    try {
      await db.delete(table, id);
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} eliminado correctamente`, 'success');

      // Recargar datos según tabla
      if (table === 'alumnos') {
        await loadAlumnos();
        await loadNotasWithJoins();
      } else if (table === 'profesores') {
        await loadProfesores();
      } else if (table === 'materias') {
        await loadMaterias();
      } else if (table === 'notas') {
        await loadNotasWithJoins();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar: ' + error.message, 'error');
    }
  };

  const modal = M.Modal.getInstance(document.getElementById('confirm-delete-modal'));
  modal.open();
}

function handleConfirmDelete() {
  if (deleteCallback) {
    deleteCallback();
    deleteCallback = null;

    const modal = M.Modal.getInstance(document.getElementById('confirm-delete-modal'));
    modal.close();
  }
}
