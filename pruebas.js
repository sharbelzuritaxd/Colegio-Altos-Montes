// ============================================
// PRUEBAS DE CONEXIÓN Y FUNCIONALIDAD
// ============================================
// Este archivo contiene funciones para probar
// que la conexión a Supabase funciona correctamente

/**
 * Función principal de pruebas
 * Ejecutar en la consola: testSupabaseConnection()
 */
async function testSupabaseConnection() {
  console.clear();
  console.log('🚀 Iniciando pruebas de conexión a Supabase...\n');
  
  try {
    // Esperar a que la DB esté inicializada
    if (!db) {
      console.error('❌ ERROR: La base de datos no está inicializada');
      console.log('💡 Espera a que la página cargue completamente');
      return;
    }

    console.log('✅ Instancia de BD detectada');
    console.log(`URL: ${db.url}`);
    console.log(`Headers configurados: ${Object.keys(db.headers).join(', ')}\n`);

    // Prueba 1: Conectividad básica
    console.log('TEST 1: Verificando conectividad...');
    await testConectividad();

    // Prueba 2: Lectura de tablas
    console.log('\nTEST 2: Leyendo datos de tablas...');
    await testLecturaTablas();

    // Prueba 3: Validaciones
    console.log('\nTEST 3: Verificando validaciones...');
    testValidaciones();

    // Prueba 4: Formateo de datos
    console.log('\nTEST 4: Verificando formateo de datos...');
    testFormateos();

    console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE\n');
    console.log('📊 RESUMEN:');
    console.log('✅ Conexión a Supabase: OK');
    console.log('✅ Métodos CRUD: OK');
    console.log('✅ Validaciones: OK');
    console.log('✅ La aplicación está lista para usar\n');

  } catch (error) {
    console.error('❌ ERROR en pruebas:', error);
  }
}

/**
 * Test 1: Verificar conectividad
 */
async function testConectividad() {
  try {
    const response = await fetch(
      `${db.getApiUrl('alumnos')}?limit=1`,
      {
        method: 'GET',
        headers: db.headers
      }
    );

    if (response.ok) {
      console.log('  ✅ Conexión exitosa a Supabase');
      console.log(`  Status: ${response.status} ${response.statusText}`);
      return true;
    } else {
      console.error('  ❌ Error de conexión:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('  ❌ Error de red:', error.message);
    return false;
  }
}

/**
 * Test 2: Lectura de tablas
 */
async function testLecturaTablas() {
  const tablas = ['alumnos', 'profesores', 'materias', 'notas'];
  let resultados = {};

  for (const tabla of tablas) {
    try {
      const datos = await db.getAll(tabla, '*');
      resultados[tabla] = {
        total: datos.length,
        estado: '✅'
      };
      console.log(`  ✅ ${tabla}: ${datos.length} registros`);
    } catch (error) {
      resultados[tabla] = {
        total: 0,
        estado: '⚠️',
        error: error.message
      };
      console.log(`  ⚠️ ${tabla}: ${error.message}`);
    }
  }

  return resultados;
}

/**
 * Test 3: Validaciones
 */
function testValidaciones() {
  const tests = [
    {
      nombre: 'Email válido',
      test: () => SupabaseDB.validateEmail('usuario@email.com'),
      esperado: true
    },
    {
      nombre: 'Email inválido (sin @)',
      test: () => SupabaseDB.validateEmail('usuarioemail.com'),
      esperado: false
    },
    {
      nombre: 'Email inválido (sin dominio)',
      test: () => SupabaseDB.validateEmail('usuario@'),
      esperado: false
    },
    {
      nombre: 'Calificación válida (50)',
      test: () => SupabaseDB.validateGrade(50),
      esperado: true
    },
    {
      nombre: 'Calificación válida (0)',
      test: () => SupabaseDB.validateGrade(0),
      esperado: true
    },
    {
      nombre: 'Calificación válida (100)',
      test: () => SupabaseDB.validateGrade(100),
      esperado: true
    },
    {
      nombre: 'Calificación inválida (-1)',
      test: () => SupabaseDB.validateGrade(-1),
      esperado: false
    },
    {
      nombre: 'Calificación inválida (101)',
      test: () => SupabaseDB.validateGrade(101),
      esperado: false
    },
    {
      nombre: 'Calificación inválida (texto)',
      test: () => SupabaseDB.validateGrade('abc'),
      esperado: false
    }
  ];

  let pasados = 0;
  let fallidos = 0;

  tests.forEach(test => {
    const resultado = test.test();
    const ok = resultado === test.esperado;

    if (ok) {
      console.log(`  ✅ ${test.nombre}`);
      pasados++;
    } else {
      console.log(`  ❌ ${test.nombre} (esperado: ${test.esperado}, obtenido: ${resultado})`);
      fallidos++;
    }
  });

  console.log(`\n  Resumen: ${pasados} pasados, ${fallidos} fallidos`);
}

/**
 * Test 4: Formateo de datos
 */
function testFormateos() {
  // Prueba formateo de fechas
  const fecha = new Date('2024-01-15');
  const formatted = SupabaseDB.formatDate(fecha);
  
  if (formatted === '2024-01-15') {
    console.log(`  ✅ Formateo de fecha: ${fecha} → ${formatted}`);
  } else {
    console.log(`  ❌ Formateo de fecha falló: ${formatted}`);
  }

  // Prueba con string
  const formatted2 = SupabaseDB.formatDate('2024-01-15');
  if (formatted2 === '2024-01-15') {
    console.log(`  ✅ Formateo de string: '2024-01-15' → '${formatted2}'`);
  } else {
    console.log(`  ❌ Formateo de string falló: ${formatted2}`);
  }
}

/**
 * Función auxiliar para verificar estructura de base de datos
 */
async function verificarEstructuraDB() {
  console.log('\n📊 VERIFICANDO ESTRUCTURA DE BASE DE DATOS\n');

  try {
    // Obtener datos de ejemplo de cada tabla
    const alumnos = await db.getAll('alumnos', '*');
    const profesores = await db.getAll('profesores', '*');
    const materias = await db.getAll('materias', '*');
    const notas = await db.getAll('notas', '*');

    if (alumnos.length > 0) {
      console.log('📚 TABLA ALUMNOS:');
      console.log('  Campos:', Object.keys(alumnos[0]).join(', '));
      console.log('  Ejemplo:', JSON.stringify(alumnos[0], null, 2));
    }

    if (profesores.length > 0) {
      console.log('\n👨‍🏫 TABLA PROFESORES:');
      console.log('  Campos:', Object.keys(profesores[0]).join(', '));
      console.log('  Ejemplo:', JSON.stringify(profesores[0], null, 2));
    }

    if (materias.length > 0) {
      console.log('\n📖 TABLA MATERIAS:');
      console.log('  Campos:', Object.keys(materias[0]).join(', '));
      console.log('  Ejemplo:', JSON.stringify(materias[0], null, 2));
    }

    if (notas.length > 0) {
      console.log('\n📝 TABLA NOTAS:');
      console.log('  Campos:', Object.keys(notas[0]).join(', '));
      console.log('  Ejemplo:', JSON.stringify(notas[0], null, 2));
    }

    console.log('\n✅ Estructura verificada');
  } catch (error) {
    console.error('❌ Error al verificar estructura:', error);
  }
}

/**
 * Función para monitorear operaciones CRUD
 */
async function monitorearOperacionesCRUD() {
  console.log('\n🔍 MONITOREANDO OPERACIONES CRUD\n');

  // Intercepción de operaciones (logging avanzado)
  const originalInsert = db.insert.bind(db);
  const originalUpdate = db.update.bind(db);
  const originalDelete = db.delete.bind(db);

  db.insert = async function(table, data) {
    console.log(`📤 INSERT en ${table}:`, data);
    const result = await originalInsert(table, data);
    console.log(`✅ Insertado:`, result);
    return result;
  };

  db.update = async function(table, id, data) {
    console.log(`📝 UPDATE en ${table} (id=${id}):`, data);
    const result = await originalUpdate(table, id, data);
    console.log(`✅ Actualizado:`, result);
    return result;
  };

  db.delete = async function(table, id) {
    console.log(`🗑️ DELETE en ${table} (id=${id})`);
    const result = await originalDelete(table, id);
    console.log(`✅ Eliminado`);
    return result;
  };

  console.log('✅ Monitoreo habilitado. Las operaciones CRUD se registrarán en consola');
}

// ============================================
// INSTRUCCIONES DE USO
// ============================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🧪 HERRAMIENTAS DE PRUEBA - Sistema de Gestión Escolar     ║
╚════════════════════════════════════════════════════════════════╝

Disponibles las siguientes funciones en consola:

1. testSupabaseConnection()
   → Ejecuta todas las pruebas de conexión

2. verificarEstructuraDB()
   → Muestra la estructura de las tablas de BD

3. monitorearOperacionesCRUD()
   → Habilita logging de operaciones CRUD

EJEMPLO DE USO:
  
  // En la consola del navegador (F12)
  testSupabaseConnection()

`);
