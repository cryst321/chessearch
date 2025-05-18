import React from 'react';
import { GiChessKing, GiChessQueen, GiChessKnight, GiChessBishop, GiChessRook, GiChessPawn } from 'react-icons/gi';
import './SideDecoration.scss';

const SideDecoration = ({ isAdminPage }) => {
    const pieces = isAdminPage 
        ? [GiChessQueen, GiChessKing, GiChessQueen]
        : [GiChessKing, GiChessQueen, GiChessKnight, GiChessBishop, GiChessRook, GiChessPawn];

    return (
        <>
            <div className={`side-decoration left ${isAdminPage ? 'admin' : ''}`}>
                {pieces.map((PieceIcon, index) => (
                    <React.Fragment key={`left-${index}`}>
                        <PieceIcon className="piece-icon" />
                        <PieceIcon className="piece-icon faded" />
                    </React.Fragment>
                ))}
            </div>
            <div className={`side-decoration right ${isAdminPage ? 'admin' : ''}`}>
                {pieces.map((PieceIcon, index) => (
                    <React.Fragment key={`right-${index}`}>
                        <PieceIcon className="piece-icon" />
                        <PieceIcon className="piece-icon faded" />
                    </React.Fragment>
                ))}
            </div>
        </>
    );
};

export default SideDecoration; 