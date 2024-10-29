import React from 'react';
import './Notation.css';

const Notation = (props) => {

    const {notations, getHistoryStateAt} = props;

    const handleNotationButtonClick = (index) => {
        getHistoryStateAt(index);
    }

    return (
        <div className="notation-content">
            {notations.map((move, index) => {
                // Her iki elemanı bir grup olarak ele alıyoruz (örneğin: ["e2", "e8"])
                if (index % 2 === 0) {
                    return (
                        <div className="notation-move" key={index / 2}>
                            <span>{index / 2 + 1}.</span>
                            <button onClick={() => handleNotationButtonClick(index)} className="move">{notations[index]}</button>
                            {notations[index+1] && <button onClick={() => handleNotationButtonClick(index+1)} className="move">{notations[index + 1]}</button>}
                        </div>
                    );
                } else {
                    return null; // Tek eleman için bir şey döndürme (çiftli grup halinde işleniyor)
                }
            })}
        </div>
    );
}

export default Notation;

