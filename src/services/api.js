const API_BASE_URL = 'http://localhost:8080/api/game';
const API_ADMIN_BASE = 'http://localhost:8080/api/admin';

function getCsrfToken() {
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
}

export const getGameById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Status: ${response.status}`);
    }
    return await response.json();
};

export const deleteGame = async (gameId) => {
    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_ADMIN_BASE}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
            'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to delete game: ${response.status}`);
    }

    return await response.text();
}; 