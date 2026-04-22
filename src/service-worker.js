// Este archivo es el punto de entrada para Workbox
// La integración de Astro inyectará automáticamente la lista de archivos de precarga aquí

const { offlineFallback, precacheAndRoute } = workbox;
const { registerRoute, NavigationRoute } = workbox.routing;

// 1. Precachear assets estáticos (HTML, CSS, JS, Imágenes)
// Astro inyectará esto automáticamente en este archivo al hacer build
precacheAndRoute(self.__WB_MANIFEST);

// 2. Fallback Offline
// Si el usuario intenta ir a una página que no tiene cacheada o no tiene internet,
// mostrarle la página de inicio (que funcionará parcialmente)
const handler = new workbox.runtimeCaching.NetworkOnly({
  networkTimeoutSeconds: 3,
});
const networkFirst = new workbox.strategies.NetworkFirst({
  cacheName: "start-url",
  plugins: [
    { cacheWillUpdate: async ({ request, response, event }) => response },
  ],
});
const navigationRoute = new NavigationRoute(networkFirst, {
  allowlist: [/^\/(diario|reporte|medicamentos|imprimir)?$/],
  denylist: [/\/__\/data\//],
});

registerRoute(navigationRoute);
