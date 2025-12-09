# 🗜️ Compresión y Caching - Guía de Configuración

## 1. Configuración de Compresión GZIP

### Para Netlify (Si usas Netlify)

Crea archivo `netlify.toml` en la raíz:

```toml
# Configuración de compresión
[build]
  command = "npm run build"
  functions = "functions"

# Compresión automática
[[headers]]
  for = "/*"
  [headers.values]
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Para Apache (.htaccess)

```apache
# Habilitar compresión gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/x-font-ttf
  AddOutputFilterByType DEFLATE font/opentype
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Cache Headers
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Imágenes
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  
  # CSS y JavaScript
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType application/x-javascript "access plus 1 year"
  
  # Fuentes
  ExpiresByType font/truetype "access plus 1 year"
  ExpiresByType font/opentype "access plus 1 year"
  ExpiresByType application/x-font-ttf "access plus 1 year"
  
  # HTML (no cachear)
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

### Para Node.js/Express

```javascript
// Instalar: npm install compression
const compression = require('compression');
const express = require('express');

const app = express();

// Habilitar compresión GZIP automática
app.use(compression());

// Cache Headers
app.use((req, res, next) => {
  // No cachear HTML
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  // Cachear assets por 1 año
  else if (/\.(js|css|png|jpg|gif|svg|woff|woff2)$/.test(req.path)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cachear JSON por 5 minutos
  else if (req.path.endsWith('.json')) {
    res.set('Cache-Control', 'public, max-age=300');
  }
  next();
});
```

### Para Vercel

Crea `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/:file(*.css|*.js|*.woff|*.woff2|*.png|*.jpg|*.svg)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 2. Tamaños Estimados Después de Compresión

| Archivo | Original | GZIP | Brotli | % Reducción |
|---------|----------|------|--------|------------|
| styles.css | ~35 KiB | ~8 KiB | ~7 KiB | 77% ↓ |
| app.js | ~25 KiB | ~7 KiB | ~6 KiB | 76% ↓ |
| materialize.min.css | ~55 KiB | ~12 KiB | ~10 KiB | 82% ↓ |
| materialize.min.js | ~40 KiB | ~10 KiB | ~9 KiB | 77% ↓ |
| **TOTAL** | ~155 KiB | **~37 KiB** | **~32 KiB** | **79% ↓** |

---

## 3. Implementación de Service Worker (Caching Avanzado)

Crea archivo `sw.js`:

```javascript
const CACHE_NAME = 'escuela-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/inicio.html',
  '/styles.css',
  '/app.js',
  '/config.js',
  '/database.js',
  '/supabaseConnection.js'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activar (limpiar caches antiguos)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Network First, Fallback to Cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cachear respuesta exitosa
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Usar cache si falla
        return caches.match(event.request);
      })
  );
});
```

Registrar en `index.html`:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado'))
      .catch(err => console.log('Error en SW:', err));
  }
</script>
```

---

## 4. Optimización de Imágenes

### Responsive Images

```html
<!-- Antes -->
<img src="logo.png" alt="Logo">

<!-- Después (optimizado) -->
<picture>
  <source srcset="logo.webp" type="image/webp">
  <source srcset="logo.png" type="image/png">
  <img src="logo.png" alt="Logo" loading="lazy">
</picture>
```

### Comandos para Optimizar Imágenes

```bash
# Instalar herramientas
npm install -g imagemin imagemin-webp

# Convertir a WebP
imagemin src/*.png --out-dir=dist --plugin=webp

# Comprimir PNGs
imagemin src/*.png --out-dir=dist
```

---

## 5. Verificación de Compresión

### Con cURL

```bash
# Ver headers de compresión
curl -I -H "Accept-Encoding: gzip" https://tuurl.com/styles.css

# Ver tamaño de descarga
curl -o /dev/null -s -w "Tamaño: %{size_download} bytes\nTiempo: %{time_total}s\n" https://tuurl.com/styles.css
```

### Con Chrome DevTools

1. Abrir DevTools (F12)
2. Tab **Network**
3. Actualizar página (Ctrl+Shift+R)
4. Buscar archivo CSS/JS
5. Mirar columna **Transferred** vs **Size**

Ejemplo:
```
styles.css
Size: 35.2 KiB
Transferred: 8.4 KiB  ✅ Comprimido con GZIP
```

---

## 6. Headers de Caching Explicados

```
Cache-Control: public, max-age=31536000, immutable
│             │      │                     │
│             │      │                     └─ No se modificará (seguro cachear)
│             │      └─ Validez: 1 año (31536000 segundos)
│             └─ Puede ser cacheado por proxies públicos
└─ Instrucción de cache
```

**Valores Recomendados**:

| Tipo de Recurso | Header Recomendado | Razón |
|-----------------|-------------------|-------|
| HTML (index.html) | `max-age=0, must-revalidate` | Cambios frecuentes |
| CSS/JS versionado | `max-age=31536000, immutable` | No cambia |
| Fuentes | `max-age=31536000, immutable` | No cambia |
| JSON/API | `max-age=300` | Datos dinámicos |
| Imágenes | `max-age=31536000, immutable` | No cambia |

---

## 7. Checklist Final

- [ ] Habilitado GZIP en servidor
- [ ] Configurado headers de cache
- [ ] Creado Service Worker
- [ ] Probado en Chrome DevTools
- [ ] Probado en conexión 4G lenta
- [ ] Verificado tamaños de transferencia
- [ ] Optimizadas imágenes a WebP
- [ ] Verificado funcionalidad offline

---

## 📊 Resultados Esperados

**Antes de optimizaciones**:
- Descarga de datos: ~155 KiB
- Tiempo de carga: ~3-4 segundos en 4G

**Después de optimizaciones**:
- Descarga de datos: ~37 KiB (79% reducción)
- Tiempo de carga: ~1 segundo en 4G
- Soporte offline: ✅ Con Service Worker

---

**Última actualización**: 6 de Diciembre 2025
