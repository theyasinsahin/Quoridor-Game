import React from 'react';
import '../../App';


const Wall = (props) => {
    const {orientation, isHovered, isClicked, id, onWallHover, onWallClick, playAs, initialPlayer, nickNames} = props;
    
    
    const handleMouseEnter = () => {
        if(!((playAs === "player2" && (nickNames[0] === "AI" || nickNames[0] === "Bot") && initialPlayer=== "player1") || ( playAs === "player1" && (nickNames[1] === "AI" || nickNames[1] === "Bot") && initialPlayer === "player2"))){
            onWallHover(id, orientation, true);
        }
    };

    const handleMouseLeave = () => {
        if(!((playAs === "player2" && (nickNames[0] === "AI" || nickNames[0] === "Bot") && initialPlayer=== "player1") || ( playAs === "player1" && (nickNames[1] === "AI" || nickNames[1] === "Bot") && initialPlayer === "player2"))){
            onWallHover(id, orientation, false);
        }
    };

    const handleClick = () => {
        onWallClick(id, orientation, true);
    }

    
    const className = `Wall ${orientation} ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`;
    return (
    <td 
        className={className} 
        id={id} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}        
        >
    </td>);
}

export default Wall;
