// js/pages/dashboard.js
import { store } from '../state/store.js';
import { getCharacters } from '../core/api.js';

/**
 * Objeto Dashboard que maneja toda la lógica de la interfaz de usuario.
 */
export const dashboard = {
    // Referencias a elementos del DOM
    elements: {
        grid: document.getElementById('charactersGrid'),
        favoritesList: document.getElementById('favoritesList'),
        search: document.getElementById('characterSearch'),
        filter: document.getElementById('statusFilter'),
        loader: document.getElementById('loader'),
        noResults: document.getElementById('noResults'),
        prevBtn: document.getElementById('prevPage'),
        nextBtn: document.getElementById('nextPage'),
        pageInfo: document.getElementById('pageInfo')
    },

    /**
     * Inicializa la página cargando los eventos y los datos iniciales.
     */
    async init() {
        this.setupEventListeners();
        await this.loadCharacters();
        this.renderFavorites();
    },

    /**
     * Configura los escuchadores de eventos para búsqueda, filtro y paginación.
     */
    setupEventListeners() {
        // Búsqueda con retardo (debounce) para no saturar la API
        let timeout;
        this.elements.search.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                store.state.filters.name = e.target.value.trim();
                store.state.currentPage = 1; // Reiniciamos a la página 1 al buscar
                this.loadCharacters();
            }, 500);
        });

        // Cambio de filtro de estado
        this.elements.filter.addEventListener('change', (e) => {
            store.state.filters.status = e.target.value;
            store.state.currentPage = 1;
            this.loadCharacters();
        });

        // Botón Página Anterior
        this.elements.prevBtn.addEventListener('click', () => {
            if (store.state.currentPage > 1) {
                store.state.currentPage--;
                this.loadCharacters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Botón Página Siguiente
        this.elements.nextBtn.addEventListener('click', () => {
            if (store.state.currentPage < store.state.totalPages) {
                store.state.currentPage++;
                this.loadCharacters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    },

    /**
     * Solicita los personajes a la API según el estado actual de filtros y página.
     */
    async loadCharacters() {
        this.showLoader(true);
        this.elements.noResults.classList.add('hidden');

        const data = await getCharacters(store.state.currentPage, store.state.filters);

        // Manejamos casos de error o sin resultados
        if (data.error || !data.results) {
            store.state.characters = [];
            store.state.totalPages = 0;
            this.elements.noResults.classList.remove('hidden');
        } else {
            store.state.characters = data.results;
            store.state.totalPages = data.info.pages;
        }

        this.renderGrid();
        this.updatePagination();
        this.showLoader(false);
    },

    /**
     * Dibuja la cuadrícula de personajes en el DOM.
     */
    renderGrid() {
        // Limpiamos tarjetas anteriores
        const cards = this.elements.grid.querySelectorAll('.character-card');
        cards.forEach(c => c.remove());

        // Creamos cada tarjeta dinámicamente
        store.state.characters.forEach(char => {
            const isFav = store.isFavorite(char.id);
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${char.image}" alt="${char.name}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="character-name">${char.name}</h3>
                    <div class="status-label status-${char.status.toLowerCase()}">
                        <span class="status-indicator"></span>
                        ${char.status}
                    </div>
                    <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${char.id}">
                        <i data-lucide="star"></i>
                        <span>${isFav ? 'En Favoritos' : 'Añadir a Favoritos'}</span>
                    </button>
                </div>
            `;

            // Evento para el botón de favoritos dentro de la tarjeta
            card.querySelector('.fav-btn').addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const added = store.toggleFavorite(char);

                // Actualizamos visualmente el botón
                btn.classList.toggle('active', added);
                btn.querySelector('span').textContent = added ? 'En Favoritos' : 'Añadir a Favoritos';

                // Refrescamos la lista lateral
                this.renderFavorites();
                if (window.lucide) lucide.createIcons();
            });

            this.elements.grid.appendChild(card);
        });
        if (window.lucide) lucide.createIcons();
    },

    /**
     * Dibuja la lista de personajes favoritos en la barra lateral.
     */
    renderFavorites() {
        const { favoritesList } = this.elements;

        if (store.state.favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <p>No hay favoritos aún</p>
                </div>
            `;
            return;
        }

        favoritesList.innerHTML = '';
        store.state.favorites.forEach(fav => {
            const item = document.createElement('div');
            item.className = 'fav-item';
            item.innerHTML = `
                <img src="${fav.image}" alt="${fav.name}">
                <div class="fav-item-info">
                    <p class="fav-item-name">${fav.name}</p>
                </div>
                <button class="remove-fav" data-id="${fav.id}">
                    <i data-lucide="x"></i>
                </button>
            `;

            // Evento para eliminar desde la lista de favoritos
            item.querySelector('.remove-fav').addEventListener('click', () => {
                store.toggleFavorite(fav);
                this.renderFavorites();
                this.renderGrid(); // Refrescamos el grid por si el personaje es visible
            });

            favoritesList.appendChild(item);
        });

        if (window.lucide) lucide.createIcons();
    },

    /**
     * Actualiza el estado de los botones de paginación y el texto informativo.
     */
    updatePagination() {
        this.elements.prevBtn.disabled = store.state.currentPage <= 1;
        this.elements.nextBtn.disabled = store.state.currentPage >= store.state.totalPages || store.state.totalPages === 0;
        this.elements.pageInfo.textContent = `Página ${store.state.currentPage} de ${store.state.totalPages || 1}`;
    },

    /**
     * Muestra u oculta el spinner de carga.
     * @param {boolean} show - True para mostrar, False para ocultar
     */
    showLoader(show) {
        this.elements.loader.classList.toggle('hidden', !show);
    }
};