import React from 'react';

const WallsLeft = ({ wallsLeft, player }) => {
  const walls = [];
  for (let i = 0; i < wallsLeft; i++) {
    walls.push(<div key={`${player}-wall-${i}`} className="remaining-wall"></div>);
  }

  return (
    <div className={`WallsLeft ${player}`}>
      {walls}
    </div>
  );
}

export default WallsLeft;
