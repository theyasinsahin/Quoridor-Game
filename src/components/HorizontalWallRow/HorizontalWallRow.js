import React from 'react';
import Wall from '../Wall/Wall';
import Space from '../Space/space';

const HorizontalWallRow = (props) => {
  const { rowIndex, onWallHover, hoveredWalls } = props;
  const boardSize = 9;
  const row = [];

  for (let i = 0; i < boardSize; i++) {
    const hWallId = `hwall-${rowIndex}-${i}`;
    row.push(
      <Wall
        key={hWallId}
        id={hWallId}
        orientation="horizontal"
        onWallHover={onWallHover}
        isHovered={hoveredWalls.includes(hWallId)}
      />
    );

    if (i !== boardSize - 1) {
      row.push(
        <Space
          key={`space-${rowIndex}-${i}`}
          id={`space-${rowIndex}-${i}`}
        />
      );
    }
  }

  return (
    <tr key={`hrow-${rowIndex}`} id={`hrow-${rowIndex}`}>
      {row}
    </tr>
  );
}

export default HorizontalWallRow;
