import React from 'react';
import '../../App';


function Wall(props) {
    const handleMouseEnter = () => {
        props.onWallHover(props.id, props.orientation, true);
    };

    const handleMouseLeave = () => {
        props.onWallHover(props.id, props.orientation, false);
    };

    const className = `Wall ${props.orientation} ${props.isHovered ? 'hovered' : ''} ${props.isClicked ? 'clicked' : ''}`;
    return <td className={className} id={props.id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}></td>;
}

export default Wall;
