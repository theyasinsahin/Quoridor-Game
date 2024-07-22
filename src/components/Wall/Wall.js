import React from 'react';
import '../../App';


const Wall = (props) => {
    const {orientation, isHovered, isClicked, id, onWallHover, onWallClick} = props;
    
    
    const handleMouseEnter = () => {
        onWallHover(id, orientation, true);
    };

    const handleMouseLeave = () => {
        onWallHover(id, orientation, false);
    };

    const handleClick = () => {
        onWallClick(id, orientation);
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
