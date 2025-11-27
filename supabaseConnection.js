// ============================================
// CLASE SUPABASEDB - CONEXIÓN Y CRUD
// ============================================
// Maneja todas las operaciones con la base de datos de Supabase

class SupabaseDB {
  constructor(config) {
    this.url = config.url;
    this.key = config.key;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`
    };
  }

  /**
   * URL base para las peticiones
   */
  getApiUrl(table) {
    return `${this.url}/rest/v1/${table}`;
  }

  /**
   * OBTENER todos los registros de una tabla
   */
  async getAll(table, select = '*') {
    try {
      const response = await fetch(
        `${this.getApiUrl(table)}?select=${select}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Error ${response.status} al obtener de ${table}:`, errorData);
        throw new Error(`Error al obtener datos de ${table}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en getAll(${table}):`, error);
      throw error;
    }
  }

  /**
   * OBTENER un registro por ID
   */
  async getById(table, id) {
    try {
      const response = await fetch(
        `${this.getApiUrl(table)}?id=eq.${id}`,
        {
          method: 'GET',
          headers: this.headers
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener registro: ${response.statusText}`);
      }

      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error en getById(${table}, ${id}):`, error);
      throw error;
    }
  }

  /**
   * INSERTAR un nuevo registro
   */
  async insert(table, data) {
    try {
      const response = await fetch(
        `${this.getApiUrl(table)}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`Error al insertar en ${table}:`, error);
        throw new Error(`Error al insertar en ${table}: ${response.statusText}`);
      }

      // La respuesta podría estar vacía, intentar parsearla
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : { success: true };
      } catch (e) {
        return { success: true };
      }
    } catch (error) {
      console.error(`Error en insert(${table}):`, error);
      throw error;
    }
  }

  /**
   * ACTUALIZAR un registro
   */
  async update(table, id, data) {
    try {
      const response = await fetch(
        `${this.getApiUrl(table)}?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`Error al actualizar en ${table}:`, error);
        throw new Error(`Error al actualizar en ${table}: ${response.statusText}`);
      }

      // La respuesta podría estar vacía, intentar parsearla
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : { success: true };
      } catch (e) {
        return { success: true };
      }
    } catch (error) {
      console.error(`Error en update(${table}, ${id}):`, error);
      throw error;
    }
  }

  /**
   * ELIMINAR un registro
   */
  async delete(table, id) {
    try {
      const response = await fetch(
        `${this.getApiUrl(table)}?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: this.headers
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`Error al eliminar en ${table}:`, error);
        throw new Error(`Error al eliminar en ${table}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error en delete(${table}, ${id}):`, error);
      throw error;
    }
  }

  /**
   * OBTENER con filtros personalizados
   * Ejemplo: query('alumnos', 'nombres=ilike.*Juan*')
   */
  async query(table, filter = '') {
    try {
      const url = filter 
        ? `${this.getApiUrl(table)}?${filter}`
        : this.getApiUrl(table);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Error en query: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en query(${table}):`, error);
      throw error;
    }
  }

  /**
   * OBTENER JOIN entre tablas
   * Sintaxis correcta de Supabase: *,tabla_relacionada(campo1,campo2)
   * Ejemplo: getWithJoin('notas', '*,alumno_id(nombres,apellidos),materia_id(nombre)')
   */
  async getWithJoin(table, selectQuery) {
    try {
      // Escapar la query para URL
      const encodedSelect = encodeURIComponent(selectQuery);
      const url = `${this.getApiUrl(table)}?select=${encodedSelect}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en JOIN - Response:', errorData);
        throw new Error(`Error en join: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en getWithJoin(${table}):`, error);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  }

  /**
   * VALIDAR email único en una tabla
   */
  async isEmailUnique(table, email, excludeId = null) {
    try {
      let filter = `email=eq.${encodeURIComponent(email)}`;
      if (excludeId) {
        filter += `&id=neq.${excludeId}`;
      }

      const result = await this.query(table, filter);
      return result.length === 0;
    } catch (error) {
      console.error('Error validando email único:', error);
      return false;
    }
  }

  /**
   * VALIDAR email válido (formato)
   */
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * VALIDAR calificación (entre 0 y 100)
   */
  static validateGrade(grade) {
    const num = parseFloat(grade);
    return !isNaN(num) && num >= 0 && num <= 100;
  }

  /**
   * FORMATEAR fecha a formato YYYY-MM-DD
   */
  static formatDate(date) {
    if (typeof date === 'string') return date;
    return new Date(date).toISOString().split('T')[0];
  }
}

// Crear instancia global de la base de datos
let db;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const config = getSupabaseConfig();
  db = new SupabaseDB(config);
});
