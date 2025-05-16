import { Chess } from "chess.js"
/**
 * Handles pawn promotion when setting up a position manually
 * @param {Object} game Chess.js game instance
 * @param {string} sourceSquare Source square
 * @param {string} targetSquare Target square
 * @param {string} piece Piece being moved
 * @param {string} promotionPiece Piece to promote to
 * @returns {string|null} New FEN string after the promotion
 */
export const handlePromotion = (game, sourceSquare, targetSquare, piece, promotionPiece) => {
    try {
        const gameCopy = new Chess(game.fen())
        gameCopy.remove(sourceSquare)

        const pieceColor = piece.charAt(0).toLowerCase()

        const newPiece = {
            type: promotionPiece.toLowerCase(),
            color: pieceColor === "w"?"w":"b",
        }
        gameCopy.put(newPiece, targetSquare)
        return gameCopy.fen()
    } catch (error) {
        console.error("Error handling promotion:", error)
        return null
    }
}

/**
 * Checks if a move is a pawn promotion
 * @param {string} sourceSquare Source square
 * @param {string} targetSquare Target square
 * @param {Object} piece Piece being moved
 * @returns {boolean} True if the move is a pawn promotion
 */
export const isPromotion = (sourceSquare, targetSquare, piece) => {
    if (!piece || piece.type !== "p") return false
    const targetRank = targetSquare.charAt(1)
    return (piece.color==="w" && targetRank==="8")||(piece.color==="b" && targetRank==="1")
}
