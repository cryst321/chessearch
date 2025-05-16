import React from "react"
import "./Tooltip.scss"

const Tooltip = ({ children, content }) => {
    return (
        <div className="tooltip-container">
            {children}
            <div className="tooltip-content">{content}</div>
        </div>
    )
}

export default Tooltip
