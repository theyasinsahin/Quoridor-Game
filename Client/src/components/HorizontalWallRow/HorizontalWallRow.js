import React from 'react';
import Wall from '../Wall/Wall';
import Space from '../Space/space';

const HorizontalWallRow = (props) => {
  const { rowIndex, onWallHover, hoveredWalls, onWallClick, clickedWalls, clickedSpaces, hoveredSpaces, initialPlayer, playAs, nickNames, isThereComp } = props;
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
        onWallClick={onWallClick}
        isHovered={hoveredWalls.includes(hWallId)}
        isClicked={clickedWalls.includes(hWallId)}
        initialPlayer = {initialPlayer}
        playAs = {playAs}
        nickNames = {nickNames}
        isThereComp = {isThereComp}
      />
    );

    if (i !== boardSize - 1) {
      const spaceId = `space-${rowIndex}-${i}`;
      row.push(
        <Space
          key={spaceId}
          id={spaceId}
          onWallHover={onWallHover}
          onWallClick={onWallClick}
          isClicked={clickedSpaces.includes(spaceId)}
          isHovered={hoveredSpaces.includes(spaceId)}
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
