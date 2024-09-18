import React from 'react';

const Space = (props) => {
  const { id, isClicked, isHovered } = props;
  const className = `Space ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`;
  
  
  return (
    <td className={className} id={id}></td>
  );
}
  
export default Space;