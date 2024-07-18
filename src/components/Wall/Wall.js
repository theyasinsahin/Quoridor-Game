import React from 'react';
import '../../App';


const Wall = (props) => {
    const {orientation, isHovered, isClicked, id} = props;
    const handleMouseEnter = () => {
        props.onWallHover(id, orientation, true);
    };

    const handleMouseLeave = () => {
        props.onWallHover(id, orientation, false);
    };
    
    const className = `Wall ${orientation} ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`;
    return (
    <td 
        className={className} 
        id={id} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}>
    </td>);
}

export default Wall;
