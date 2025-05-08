
const API_BASE = 'http://localhost:8080/api/search';

/**
 * search for similar positions
 * @param {string} fen FEN string of the query position
 * @param {number} limit maximum number of results to return
 * @returns {Promise<Array<object>>} array of SearchResultDto
 * @throws {Error}
 */
export const findSimilarPositions = async (fen, limit) => {
    const url = new URL(API_BASE, window.location.origin);
    url.searchParams.append('fen', fen);
    url.searchParams.append('limit', limit);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        let errorText = `Search failed with status: ${response.status}`;
        try {
            const errorBody = await response.text();
            if (errorBody && errorBody.length < 150 && !errorBody.trim().startsWith('<')) {
                errorText = errorBody;
            }
        } catch (e) {
        }
        console.error("Search API call failed:", response.status, errorText);
        throw new Error(errorText);
    }

    return await response.json();
};

