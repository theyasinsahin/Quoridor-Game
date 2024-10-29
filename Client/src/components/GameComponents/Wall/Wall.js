import React from 'react';
import '../../../App';
import { socket } from '../../../Socket';


const Wall = (props) => {
    const {orientation, isHovered, isClicked, id, onWallHover, onWallClick, playAs, initialPlayer, nickNames, playerId, playerRole} = props;
    
    
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
        
        const action = {type: "wall", id:id, orientation: orientation};
        // Emit the move to the server
        socket.emit('player-move', playerId, {action, playerRole});
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
