const CHESS_API_URL = "https://chess-api.com/v1";

/**
 * Fetches chess position analysis from chess-api.com
 * @param {string} fen FEN string of the position to analyze
 * @param {object} options optional parameters for the API
 * @param {number} options.variants max number of variants (default: 1, max: 5)
 * @param {number} options.depth max depth (default: 12, max: 18)
 * @param {number} options.maxThinkingTime max thinking time (default: 50ms, max: 100)
 * @returns {Promise<object>}
 * @throws {Error}
 */
export const getChessAnalysis = async (fen, options = {}) => {
    const requestData = {
        fen: fen,
        variants: options.variants||1,
        depth: options.depth||12,
        maxThinkingTime: options.maxThinkingTime||50,
    };

    console.log("Sending to chess-api.com:", requestData);

    try {
        const response = await fetch(CHESS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData),});

        if (!response.ok) {
            let errorBodyText = `API request failed with status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.text) {
                    errorBodyText = errorData.text;
                } else if (errorData && errorData.message) {
                    errorBodyText = errorData.message;
                }
            } catch (e) {
                errorBodyText = response.statusText || errorBodyText;
            }
            console.error("Chess API Error:", errorBodyText);
            throw new Error(errorBodyText);
        }

        const data = await response.json();
        console.log("Received from chess-api.com:", data);
        return data;

    } catch (error) {
        console.error("Error fetching chess analysis:", error);
        throw error;
    }
};
