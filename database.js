// ============================================
// LÓGICA DE BASE DE DATOS - PÁGINA DE VISUALIZACIÓN
// ============================================

let currentTable = 'alumnos';
let allData = {};
let deleteCallback = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
  M.AutoInit();

  // Cargar todos los datos
  await loadAllData();

  // Mostrar datos de alumnos por defecto
  await displayData('alumnos');

  // Event listener para el buscador
  document.getElementById('search-input').addEventListener('keyup', performSearch);
});

/**
 * Cargar todos los datos de las tablas
 */
async function loadAllData() {
  try {
    if (!db) {
      console.error('Base de datos no inicializada');
      return;
    }

    // Cargar alumnos
    allData.alumnos = await db.getAll('alumnos', '*');

    // Cargar profesores
    allData.profesores = await db.getAll('profesores', '*');

    // Cargar materias
    const materias = await db.getAll('materias', '*');
    const profesores = allData.profesores;
    const profesorMap = {};
    profesores.forEach(prof => {
      profesorMap[prof.id] = `${prof.nombres} ${prof.apellidos}`;
    });
    allData.materias = materias.map(mat => ({
      ...mat,
      profesor_nombre: profesorMap[mat.profesor_id] || 'Sin asignar'
    }));

    // Cargar notas
    const notas = await db.getAll('notas', '*');
    const alumnoMap = {};
    const materiaMap = {};
    allData.alumnos.forEach(alumno => {
      alumnoMap[alumno.id] = { nombres: alumno.nombres, apellidos: alumno.apellidos };
    });
    allData.materias.forEach(materia => {
      materiaMap[materia.id] = { nombre: materia.nombre };
    });
    allData.notas = notas.map(nota => ({
      ...nota,
      alumno: alumnoMap[nota.alumno_id] || { nombres: 'Desconocido', apellidos: '' },
      materia: materiaMap[nota.materia_id] || { nombre: 'Desconocida' }
    }));

    console.log('Datos cargados:', allData);
  } catch (error) {
    console.error('Error al cargar datos:', error);
    showToast('Error al cargar datos', 'error');
  }
}

/**
 * Filtrar por tabla
 */
async function filterByTable(table) {
  currentTable = table;

  // Actualizar botones activos
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.filter-btn').classList.add('active');

  // Limpiar búsqueda
  document.getElementById('search-input').value = '';

  // Mostrar datos de la tabla seleccionada
  await displayData(table);
}

/**
 * Mostrar datos de la tabla
 */
async function displayData(table) {
  const data = allData[table] || [];
  const container = document.getElementById('database-content');

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="material-icons">inbox</i>
        <p>No hay registros en esta tabla</p>
      </div>
    `;
    updateResultsInfo(0, table);
    return;
  }

  let html = `<table class="table-responsive striped"><thead><tr>`;

  // Generar encabezados dinámicamente
  if (table === 'alumnos') {
    html += `
      <th>Nombres</th>
      <th>Apellidos</th>
      <th>Email</th>
      <th>Fecha Nacimiento</th>
      <th>Curso</th>
      <th>Acciones</th>
    `;
  } else if (table === 'profesores') {
    html += `
      <th>Nombres</th>
      <th>Apellidos</th>
      <th>Email</th>
      <th>Especialidad</th>
      <th>Acciones</th>
    `;
  } else if (table === 'materias') {
    html += `
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Profesor</th>
      <th>Acciones</th>
    `;
  } else if (table === 'notas') {
    html += `
      <th>Alumno</th>
      <th>Materia</th>
      <th>Calificación</th>
      <th>Observación</th>
      <th>Acciones</th>
    `;
  }

  html += `</tr></thead><tbody>`;

  // Generar filas dinámicamente
  data.forEach(item => {
    if (table === 'alumnos') {
      html += `
        <tr>
          <td>${item.nombres}</td>
          <td>${item.apellidos}</td>
          <td>${item.email}</td>
          <td>${item.fecha_nacimiento}</td>
          <td>${item.curso}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('alumnos', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('alumnos', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else if (table === 'profesores') {
      html += `
        <tr>
          <td>${item.nombres}</td>
          <td>${item.apellidos}</td>
          <td>${item.email}</td>
          <td>${item.especialidad}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('profesores', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('profesores', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else if (table === 'materias') {
      html += `
        <tr>
          <td>${item.nombre}</td>
          <td>${item.descripcion || '-'}</td>
          <td>${item.profesor_nombre || '-'}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('materias', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('materias', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else if (table === 'notas') {
      html += `
        <tr>
          <td>${item.alumno.nombres} ${item.alumno.apellidos}</td>
          <td>${item.materia.nombre}</td>
          <td><strong>${item.calificacion.toFixed(2)}</strong></td>
          <td>${item.observacion || '-'}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('notas', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('notas', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
  updateResultsInfo(data.length, table);
}

/**
 * Realizar búsqueda
 */
async function performSearch() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();

  if (!searchTerm) {
    await displayData(currentTable);
    return;
  }

  const data = allData[currentTable] || [];
  let filtered = [];

  if (currentTable === 'alumnos') {
    filtered = data.filter(item =>
      item.nombres.toLowerCase().includes(searchTerm) ||
      item.apellidos.toLowerCase().includes(searchTerm) ||
      item.email.toLowerCase().includes(searchTerm) ||
      item.curso.toLowerCase().includes(searchTerm) ||
      item.fecha_nacimiento.toLowerCase().includes(searchTerm)
    );
  } else if (currentTable === 'profesores') {
    filtered = data.filter(item =>
      item.nombres.toLowerCase().includes(searchTerm) ||
      item.apellidos.toLowerCase().includes(searchTerm) ||
      item.email.toLowerCase().includes(searchTerm) ||
      item.especialidad.toLowerCase().includes(searchTerm)
    );
  } else if (currentTable === 'materias') {
    filtered = data.filter(item =>
      item.nombre.toLowerCase().includes(searchTerm) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm)) ||
      (item.profesor_nombre && item.profesor_nombre.toLowerCase().includes(searchTerm))
    );
  } else if (currentTable === 'notas') {
    filtered = data.filter(item =>
      `${item.alumno.nombres} ${item.alumno.apellidos}`.toLowerCase().includes(searchTerm) ||
      item.materia.nombre.toLowerCase().includes(searchTerm) ||
      item.calificacion.toString().includes(searchTerm)
    );
  }

  // Mostrar resultados filtrados
  const container = document.getElementById('database-content');
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="material-icons">search</i>
        <p>No se encontraron resultados para "${searchTerm}"</p>
      </div>
    `;
    updateResultsInfo(0, currentTable, searchTerm);
    return;
  }

  // Crear tabla con resultados
  let html = `<table class="table-responsive striped"><thead><tr>`;

  if (currentTable === 'alumnos') {
    html += `<th>Nombres</th><th>Apellidos</th><th>Email</th><th>Fecha</th><th>Curso</th><th>Acciones</th>`;
  } else if (currentTable === 'profesores') {
    html += `<th>Nombres</th><th>Apellidos</th><th>Email</th><th>Especialidad</th><th>Acciones</th>`;
  } else if (currentTable === 'materias') {
    html += `<th>Nombre</th><th>Descripción</th><th>Profesor</th><th>Acciones</th>`;
  } else if (currentTable === 'notas') {
    html += `<th>Alumno</th><th>Materia</th><th>Calificación</th><th>Observación</th><th>Acciones</th>`;
  }

  html += `</tr></thead><tbody>`;

  filtered.forEach(item => {
    if (currentTable === 'alumnos') {
      html += `
        <tr>
          <td>${highlightText(item.nombres, searchTerm)}</td>
          <td>${highlightText(item.apellidos, searchTerm)}</td>
          <td>${highlightText(item.email, searchTerm)}</td>
          <td>${item.fecha_nacimiento}</td>
          <td>${highlightText(item.curso, searchTerm)}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('alumnos', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('alumnos', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else if (currentTable === 'profesores') {
      html += `
        <tr>
          <td>${highlightText(item.nombres, searchTerm)}</td>
          <td>${highlightText(item.apellidos, searchTerm)}</td>
          <td>${highlightText(item.email, searchTerm)}</td>
          <td>${highlightText(item.especialidad, searchTerm)}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('profesores', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('profesores', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else if (currentTable === 'materias') {
      html += `
        <tr>
          <td>${highlightText(item.nombre, searchTerm)}</td>
          <td>${item.descripcion ? highlightText(item.descripcion, searchTerm) : '-'}</td>
          <td>${item.profesor_nombre ? highlightText(item.profesor_nombre, searchTerm) : '-'}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('materias', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('materias', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else if (currentTable === 'notas') {
      html += `
        <tr>
          <td>${highlightText(`${item.alumno.nombres} ${item.alumno.apellidos}`, searchTerm)}</td>
          <td>${highlightText(item.materia.nombre, searchTerm)}</td>
          <td><strong>${item.calificacion.toFixed(2)}</strong></td>
          <td>${item.observacion || '-'}</td>
          <td>
            <div class="action-btns">
              <button class="btn btn-small btn-edit blue" onclick="editRecord('notas', ${item.id})">
                <i class="material-icons tiny">edit</i>
              </button>
              <button class="btn btn-small btn-delete red" onclick="confirmDelete('notas', ${item.id})">
                <i class="material-icons tiny">delete</i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
  updateResultsInfo(filtered.length, currentTable, searchTerm);
}

/**
 * Resaltar texto encontrado
 */
function highlightText(text, searchTerm) {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #fff59d;">$1</mark>');
}

/**
 * Actualizar información de resultados
 */
function updateResultsInfo(count, table, searchTerm = null) {
  const info = document.getElementById('results-info');
  const tableNames = {
    'alumnos': 'alumnos',
    'profesores': 'profesores',
    'materias': 'materias',
    'notas': 'notas'
  };

  if (searchTerm) {
    info.textContent = `Mostrando ${count} resultado(s) de ${tableNames[table]} para "${searchTerm}"`;
  } else {
    info.textContent = `Mostrando ${count} ${tableNames[table]}`;
  }
}

/**
 * Limpiar búsqueda
 */
function clearSearch() {
  document.getElementById('search-input').value = '';
  displayData(currentTable);
}

/**
 * Ir a editar un registro - Abre modal de edición
 */
function editRecord(table, id) {
  // Encontrar el registro
  const record = allData[table].find(item => item.id === id);
  
  if (!record) {
    showToast('Registro no encontrado', 'error');
    return;
  }

  // Guardar información en el modal
  document.getElementById('edit-record-id').value = id;
  document.getElementById('edit-record-table').value = table;

  // Generar campos de edición dinámicamente
  const formFields = document.getElementById('edit-form-fields');
  formFields.innerHTML = '';

  // Campos según la tabla
  const fields = {
    alumnos: ['nombres', 'apellidos', 'email', 'fecha_nacimiento', 'curso'],
    profesores: ['nombres', 'apellidos', 'email', 'especialidad'],
    materias: ['nombre', 'descripcion', 'profesor_id'],
    notas: ['alumno_id', 'materia_id', 'calificacion', 'observacion']
  };

  const fieldLabels = {
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    email: 'Email',
    fecha_nacimiento: 'Fecha de Nacimiento',
    curso: 'Curso',
    especialidad: 'Especialidad',
    nombre: 'Nombre',
    descripcion: 'Descripción',
    alumno_id: 'Alumno',
    materia_id: 'Materia',
    profesor_id: 'Profesor',
    calificacion: 'Calificación',
    observacion: 'Observación'
  };

  const tableFields = fields[table] || [];

  tableFields.forEach(field => {
    const label = fieldLabels[field] || field;
    const value = record[field] || '';
    
    // Determinar tipo de campo
    let fieldType = 'text';
    if (field.includes('fecha')) fieldType = 'date';
    else if (field === 'email') fieldType = 'email';
    else if (field === 'calificacion') fieldType = 'number';
    
    // Campos de selección (autocomplete)
    if (field === 'alumno_id') {
      const alumnoName = allData.alumnos.find(a => a.id === value)?.nombres || '';
      const alumnoList = `edit-alumnos-list-${Date.now()}`;
      const alumnoOptions = allData.alumnos.map(a => 
        `<option value="${a.id}">${a.nombres} ${a.apellidos}</option>`
      ).join('');
      formFields.innerHTML += `
        <div class="input-field">
          <input type="text" id="edit-${field}" class="validate" placeholder="Escribe nombre del alumno..." value="${alumnoName}" list="${alumnoList}" required>
          <datalist id="${alumnoList}">
            ${alumnoOptions}
          </datalist>
          <label for="edit-${field}" class="active">${label}</label>
        </div>
      `;
    } else if (field === 'materia_id') {
      const materiaName = allData.materias.find(m => m.id === value)?.nombre || '';
      const materiaList = `edit-materias-list-${Date.now()}`;
      const materiaOptions = allData.materias.map(m => 
        `<option value="${m.id}">${m.nombre}</option>`
      ).join('');
      formFields.innerHTML += `
        <div class="input-field">
          <input type="text" id="edit-${field}" class="validate" placeholder="Escribe nombre de materia..." value="${materiaName}" list="${materiaList}" required>
          <datalist id="${materiaList}">
            ${materiaOptions}
          </datalist>
          <label for="edit-${field}" class="active">${label}</label>
        </div>
      `;
    } else if (field === 'profesor_id') {
      const profesorName = allData.profesores.find(p => p.id === value)?.nombres || '';
      const profesorList = `edit-profesores-list-${Date.now()}`;
      const profesorOptions = allData.profesores.map(p => 
        `<option value="${p.id}">${p.nombres} ${p.apellidos}</option>`
      ).join('');
      formFields.innerHTML += `
        <div class="input-field">
          <input type="text" id="edit-${field}" class="validate" placeholder="Escribe nombre del profesor..." value="${profesorName}" list="${profesorList}" required>
          <datalist id="${profesorList}">
            ${profesorOptions}
          </datalist>
          <label for="edit-${field}" class="active">${label}</label>
        </div>
      `;
    } else if (field === 'descripcion' || field === 'observacion') {
      formFields.innerHTML += `
        <div class="input-field">
          <textarea id="edit-${field}" class="materialize-textarea">${value}</textarea>
          <label for="edit-${field}" class="active">${label}</label>
        </div>
      `;
    } else {
      formFields.innerHTML += `
        <div class="input-field">
          <input type="${fieldType}" id="edit-${field}" class="validate" value="${value}" required>
          <label for="edit-${field}" class="active">${label}</label>
        </div>
      `;
    }
  });

  // Limpiar listeners anteriores
  document.getElementById('edit-form').removeEventListener('submit', handleEditSubmit);
  
  // Agregar listener para guardar
  document.getElementById('edit-form').addEventListener('submit', handleEditSubmit);

  // Abrir modal
  const modal = M.Modal.getInstance(document.getElementById('edit-modal'));
  modal.open();
  
  // Inicializar campos de texto
  setTimeout(() => {
    M.updateTextFields();
  }, 100);
}

/**
 * Guardar cambios del registro
 */
async function handleEditSubmit(e) {
  e.preventDefault();

  const table = document.getElementById('edit-record-table').value;
  const id = document.getElementById('edit-record-id').value;
  const formFields = document.getElementById('edit-form-fields').querySelectorAll('input, textarea');

  // Recopilar datos
  const updateData = {};
  formFields.forEach(field => {
    let fieldName = field.id.replace('edit-', '');
    let fieldValue = field.value;

    // Convertir nombres a IDs para campos de relación
    if (fieldName === 'alumno_id') {
      const alumno = allData.alumnos.find(a => 
        `${a.nombres} ${a.apellidos}`.toLowerCase() === fieldValue.toLowerCase()
      );
      if (alumno) {
        updateData[fieldName] = alumno.id;
      } else {
        updateData[fieldName] = fieldValue;
      }
    } else if (fieldName === 'materia_id') {
      const materia = allData.materias.find(m => 
        m.nombre.toLowerCase() === fieldValue.toLowerCase()
      );
      if (materia) {
        updateData[fieldName] = materia.id;
      } else {
        updateData[fieldName] = fieldValue;
      }
    } else if (fieldName === 'profesor_id') {
      const profesor = allData.profesores.find(p => 
        `${p.nombres} ${p.apellidos}`.toLowerCase() === fieldValue.toLowerCase()
      );
      if (profesor) {
        updateData[fieldName] = profesor.id;
      } else {
        updateData[fieldName] = fieldValue;
      }
    } else {
      updateData[fieldName] = fieldValue;
    }
  });

  try {
    // Actualizar en la base de datos
    await db.update(table, id, updateData);
    
    showToast('Registro actualizado correctamente', 'success');

    // Recargar datos
    await loadAllData();
    await displayData(currentTable);

    // Cerrar modal
    const modal = M.Modal.getInstance(document.getElementById('edit-modal'));
    modal.close();
  } catch (error) {
    console.error('Error al actualizar:', error);
    showToast('Error al actualizar: ' + error.message, 'error');
  }
}

/**
 * Confirmar eliminación
 */
function confirmDelete(table, id) {
  deleteCallback = async () => {
    try {
      await db.delete(table, id);
      showToast(`Registro eliminado correctamente`, 'success');

      // Recargar datos
      await loadAllData();
      await displayData(currentTable);

      // Cerrar modal
      const modal = M.Modal.getInstance(document.getElementById('confirm-delete-modal'));
      modal.close();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast('Error al eliminar: ' + error.message, 'error');
    }
  };

  const modal = M.Modal.getInstance(document.getElementById('confirm-delete-modal'));
  modal.open();
}

/**
 * Confirmación de eliminación desde modal
 */
document.addEventListener('DOMContentLoaded', function() {
  const confirmBtn = document.getElementById('confirm-delete-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      if (deleteCallback) {
        deleteCallback();
        deleteCallback = null;
      }
    });
  }
});

/**
 * Notificación Toast
 */
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
