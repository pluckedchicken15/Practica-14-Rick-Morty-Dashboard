// js/app.js
import { dashboard } from './pages/dashboard.js';

/**
 * Punto de entrada principal de la aplicación.
 * Se ejecuta una vez que el HTML ha sido completamente cargado.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Llamamos al método de inicialización del dashboard
    dashboard.init();
});