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
/**
 * Validates and sets a new FEN string
 * @param {string} newFen new FEN string to validate and set
 * @param {Function} setGame state setter for the game
 * @param {Function} setCurrentFen state setter for current FEN
 * @param {Function} setFenInputValue state setter for the FEN input value
 * @param {Function} setFenError state setter for FEN error messages
 * @param {Function} setAnalysisResult state setter for analysis result
 * @param {Function} setAnalysisError state setter for analysis error
 * @returns {boolean} true if the FEN is valid and was set successfully
 */
export const trySetFen = (
    newFen,
    setGame,
    setCurrentFen,
    setFenInputValue,
    setFenError,
    setAnalysisResult = null,
    setAnalysisError = null,
) => {
    try {
        const tempGame = new Chess(newFen)
        setGame(tempGame)
        setCurrentFen(newFen)
        setFenInputValue(newFen)
        setFenError("")

        if (setAnalysisResult) setAnalysisResult(null)
        if (setAnalysisError) setAnalysisError("")

        return true
    } catch (e) {
        console.error("Invalid FEN:", newFen, e)
        setFenError("Only valid positions allowed.")
        return false
    }
}

/**
 * Handles piece drops on the chessboard
 * @param {string} sourceSquare source square
 * @param {string} targetSquare target square
 * @param {string} piece piece being moved
 * @param {string} currentFen current FEN string
 * @param {Function} trySetFenFunc function to validate and set the new FEN
 * @returns {boolean} true if the move was valid and the FEN was updated
 */
export const handlePieceDrop = (sourceSquare, targetSquare, piece, currentFen, trySetFenFunc) => {
    const gameCopy = new Chess(currentFen)
    const pieceObj = gameCopy.get(sourceSquare)

    /**checking if the move is promotion**/
    if (pieceObj && pieceObj.type === "p") {
        const targetRank = targetSquare.charAt(1)
        const isPromotionMove =
            (pieceObj.color === "w" && targetRank === "8") || (pieceObj.color === "b" && targetRank === "1")
        if (isPromotionMove) {
            console.log("Promotion detected. Piece:", piece)
            let promotionPiece = "q"

            if (piece && piece.length > 1) {
                promotionPiece = piece.charAt(1).toLowerCase()
                console.log("Promotion piece extracted:", promotionPiece)
            }

            const newFen = handlePromotion(
                gameCopy,
                sourceSquare,
                targetSquare,
                pieceObj.color === "w" ? "wP" : "bP",
                promotionPiece,
            )

            if (newFen) {
                return trySetFenFunc(newFen)
            }
            return false
        }
    }
    /**other moves**/
    if (pieceObj) {
        gameCopy.remove(sourceSquare)
        gameCopy.put(pieceObj, targetSquare)
        const newFen = gameCopy.fen()
        return trySetFenFunc(newFen)
    }
    return false
}

/**
 * Handles square clicks for removing pieces in remove mode
 * @param {string} square clicked square
 * @param {boolean} isRemoveMode if remove mode is active
 * @param {string} currentFen
 * @param {Function} trySetFenFunc function to validate and set the new FEN
 */
export const handleSquareClick = (square, isRemoveMode, currentFen, trySetFenFunc) => {
    if (isRemoveMode) {
        const gameCopy = new Chess(currentFen)
        const piece = gameCopy.get(square)
        if (piece) {
            console.log(`Removing piece ${piece.type} from ${square}`)
            gameCopy.remove(square)
            const newFen = gameCopy.fen()
            trySetFenFunc(newFen)
        } else {
            console.log(`No piece to remove on ${square}`)
        }
    }
}

/**
 * Switches the side to move
 * @param {string} currentFen
 * @param {Function} trySetFenFunc func to validate and set the new FEN
 * @param {Function} setFenError state setter for FEN error messages
 */
export const switchSides = (currentFen, trySetFenFunc, setFenError) => {
    try {
        const fenParts = currentFen.split(" ")

        if (fenParts.length < 2) {
            setFenError("Invalid FEN format")
            return
        }

        fenParts[1] = fenParts[1] === "w" ? "b" : "w"
        const newFen = fenParts.join(" ")
        trySetFenFunc(newFen)
    } catch (error) {
        console.error("Error switching sides:", error)
        setFenError("Could not switch sides")
    }
}

/**
 * Gets the current side to move from a FEN string
 * @param {string} currentFen
 * @returns {string} "w" for white, "b" for black
 */
export const getSideToMove = (currentFen) => {
    const fenParts = currentFen.split(" ")
    if (fenParts.length >= 2) {
        return fenParts[1]
    }
    return "w"
}