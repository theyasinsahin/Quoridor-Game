import React, { useState } from "react";

const CopyButton = (props) => {
  const {notations} = props;

  

  const handleCopy = () => {
    const formattedMoves = notations.reduce((acc, item, index) => {
        // Add numbering for every pair
        if (index % 2 === 0) {
          const moveNumber = index / 2 + 1;
          return acc + `${moveNumber}. ${item} `;
        } else {
          return acc + `${item} `;
        }
      }, '').trim();

    navigator.clipboard.writeText(formattedMoves) // Metni panoya kopyala
      .then(() => {
        alert("Metin kopyalandı: " + formattedMoves); // Başarı mesajı göster
      })
      .catch(err => {
        console.error("Kopyalama hatası: ", err);
      });
    };

  return (
    <button className="undo-button" onClick={handleCopy}>
      Copy Game
    </button>
  );
};

export default CopyButton;
