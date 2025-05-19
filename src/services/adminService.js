function getCsrfToken() {
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
}

export const API_ADMIN_BASE = 'http://localhost:8080/api/admin';

/**
 * Upload PGN file to backend
 * @param {File} pgnFile - PGN file object.
 * @returns {Promise<string>}
 * @throws {Error}
 */
export const uploadPgnFile = async (pgnFile) => {
    const csrfToken = getCsrfToken();
    const formData = new FormData();
    formData.append('pgnFile', pgnFile);

    const response = await fetch(`${API_ADMIN_BASE}/upload-pgn-file`, {
        method: 'POST',
        headers: {
            'X-XSRF-TOKEN': csrfToken,
        },
        body: formData,
        credentials: 'include',
    });

    const responseText = await response.text();
    if (!response.ok) {
        console.error("PGN File Upload failed:", response.status, responseText);
        throw new Error(responseText || `File upload failed with status: ${response.status}`);
    }
    return responseText;
};

/**
 * Uploads PGN data as a raw string to the backend
 * @param {string} pgnStringData - string containing PGN data.
 * @returns {Promise<string>}
 * @throws {Error}
 */
export const uploadPgnString = async (pgnStringData) => {
    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_ADMIN_BASE}/upload-pgn-string`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'X-XSRF-TOKEN': csrfToken,
        },
        body: pgnStringData,
        credentials: 'include',
    });

    const responseText = await response.text();
    if (!response.ok) {
        console.error("PGN String Upload failed:", response.status, responseText);
        throw new Error(responseText || `String upload failed with status: ${response.status}`);
    }
    
    if (responseText.includes("no new games were added")) {
        throw new Error("Data processed, but no valid games were found. Please check if the PGN format is correct.");
    }
    
    return responseText;
};

/**
 * Triggers rebuild of the Lucene index on the backend
 * @returns {Promise<string>}
 * @throws {Error}
 */
export const rebuildSearchIndex = async () => {
    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_ADMIN_BASE}/rebuild`, {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        credentials: 'include',
    });
    const responseText = await response.text();
    if (!response.ok) throw new Error(responseText || `Index rebuild failed: ${response.status}`);
    return responseText;
};

/**
 * Clears the Lucene index on the backend
 * @returns {Promise<string>}
 * @throws {Error}
 */
export const clearSearchIndex = async () => {
    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_ADMIN_BASE}/clear`, {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': csrfToken },
        credentials: 'include',
    });
    const responseText = await response.text();
    if (!response.ok) throw new Error(responseText || `Index clear failed: ${response.status}`);
    return responseText;
};

export const clearAllData = async () => {
    try {
        const response = await fetch('/api/admin/games', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to clear all data');
        }

        return await response.text();
    } catch (error) {
        throw new Error(error.message || 'Failed to clear all data');
    }
};

/**
 * Get current index statistics
 * @returns {Promise<Object>} Index statistics
 * @throws {Error}
 */
export const getIndexStats = async () => {
    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_ADMIN_BASE}/index-stats`, {
        method: 'GET',
        headers: { 
            'X-XSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Failed to get index statistics');
    }
    
    return await response.json();
};
