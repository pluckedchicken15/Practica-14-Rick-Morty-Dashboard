// js/state/store.js

const STORAGE_KEY = 'rick_and_morty_favorites';

export const store = {
    state: {
        characters: [],
        favorites: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],
        currentPage: 1,
        totalPages: 1,
        filters: {
            name: '',
            status: 'all'
        }
    },

    /**
     * Guarda la lista actual de favoritos en el localStorage
     */
    saveFavorites() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.favorites));
    },

    /**
     * Verifica si un personaje ya está en favoritos
     * @param {number} id - ID del personaje
     * @returns {boolean}
     */
    isFavorite(id) {
        return this.state.favorites.some(fav => fav.id === id);
    },

    /**
     * Añade o elimina un personaje de favoritos
     * @param {Object} character - Objeto del personaje
     * @returns {boolean} - True si se añadió, False si se eliminó
     */
    toggleFavorite(character) {
        const index = this.state.favorites.findIndex(fav => fav.id === character.id);
        let added = false;

        if (index === -1) {
            // No está en favoritos, lo agregamos
            this.state.favorites.push(character);
            added = true;
        } else {
            // Ya está en favoritos, lo quitamos
            this.state.favorites.splice(index, 1);
        }

        this.saveFavorites();
        return added;
    }
};