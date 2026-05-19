// js/core/api.js

/**
 * URL base de la API oficial de Rick and Morty
 */
const BASE_URL = 'https://rickandmortyapi.com/api';

/**
 * Función central para obtener personajes desde la API.
 * * @param {number} page - El número de página a solicitar.
 * @param {Object} filters - Objeto con filtros opcionales (name, status).
 * @returns {Promise<Object>} Datos de los personajes o error.
 */
export async function getCharacters(page = 1, filters = {}) {
    // Construimos la URL con los parámetros necesarios
    let url = `${BASE_URL}/character/?page=${page}`;

    // Si hay un nombre en los filtros, lo añadimos a la URL
    if (filters.name) url += `&name=${filters.name}`;

    // Si hay un estado seleccionado (y no es 'all'), lo añadimos
    if (filters.status && filters.status !== 'all') url += `&status=${filters.status}`;

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error en la petición API:', error);
        return { error: 'No se pudieron cargar los personajes' };
    }
}