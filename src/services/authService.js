function getCsrfToken() {
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
}

const API_BASE = 'http://localhost:8080/api/auth';

/**
 * Logs in the user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} user data
 * @throws {Error} error on login failure
 */
export const loginUser = async (username, password) => {
    const csrfToken = getCsrfToken();
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-XSRF-TOKEN': csrfToken
        },
        body: formData.toString(),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error("Login failed:", response.status, errorData);
        throw new Error(errorData || `Login failed with status: ${response.status}`);
    }

    const userData = await checkStatus();
    return userData;
};

/**
 * Logs out the current user
 * @returns {Promise<void>}
 * @throws {Error} error on logout failure
 */
export const logoutUser = async () => {
    const csrfToken = getCsrfToken();
    const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {'X-XSRF-TOKEN': csrfToken},
        credentials: 'include'
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Logout failed:", response.status, errorText);
        throw new Error(errorText || `Logout failed with status: ${response.status}`);}
    console.log("Logout successful");
};

/**
 * Checks the current authentication status
 * @returns {Promise<object|null>} user data
 * @throws {Error}
 */
export const checkStatus = async () => {
    const response = await fetch(`${API_BASE}/status`, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Status check failed:", response.status, errorText);
        throw new Error(errorText || `Status check failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.username) {
        return data;
    } else {
        return null;
    }
};