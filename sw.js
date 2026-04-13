// 🚀 SERVICE WORKER - V28.0 (MACO DEXTER - NEW UI & OFFLINE READY)
const CACHE_NAME = 'refuel-maco-v28.0'; // Versi dinaikkan agar HP Fuelman otomatis update

// 📋 Assets yang WAJIB disimpan di memori HP
// Jika salah satu gagal didownload, installasi offline akan gagal.
const URLS_TO_CACHE = [
  './',                // Root folder
  './index.html',      // File utama (Pastikan nama filenya index.html)
  './manifest.json',   // Manifest PWA
  './PITSTOP-39.png',  // Background Image 
  './icon-qr-refueling.png', // Icon aplikasi
  
  // 🌍 EXTERNAL LIBRARY (PENTING AGAR KAMERA JALAN OFFLINE)
  'https://unpkg.com/html5-qrcode@latest',
  
  // 🔠 FONTS CYBERPUNK (Agar UI tetap keren saat offline)
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;600;700&display=swap'
];

// ✅ INSTALL EVENT - Download semua aset saat pertama kali dibuka
self.addEventListener('install', (event) => {
  console.log('[SW] Installing & Caching Assets v28.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    }).catch((err) => {
      console.error('[SW] Gagal Cache Aset:', err);
    })
  );
  
  self.skipWaiting();
});

// ✅ ACTIVATE EVENT - Bersihkan cache versi lama
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating & Cleaning old cache...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// ✅ FETCH EVENT - Strategi: Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
  
  // 1. Jangan cache request ke Google Script (API Data)
  if (event.request.url.includes('script.google.com')) {
    return; 
  }

  // 2. Abaikan request non-GET (seperti POST data)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika online & berhasil, simpan copy-nya ke cache (update otomatis)
        if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // 3. JIKA OFFLINE / ERROR NETWORK -> Ambil file dari cache memori HP
        return caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            console.log('[SW] File tidak ditemukan di cache:', event.request.url);
        });
      })
  );
});