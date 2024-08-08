import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

const StartPage = () => {

    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const [gameMode, setGameMode] = useState('');
    const navigate = useNavigate();
    
    const handleSubmit = (e) => {
        navigate('/game', { state: { player1Name, player2Name, mode: gameMode } });
    };

    const handleModeClick = (selectedMode) => {
        setGameMode(selectedMode);
        if (selectedMode === 'AI' || selectedMode === 'Bot') {
            setPlayer2Name(selectedMode); // Set player2Name to 'AI' or 'Bot' when against AI or Bot mode is selected
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Quoridor Game</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>
                        Player 1 Name:
                        <input type="text" value={player1Name} onChange={(e) => setPlayer1Name(e.target.value)} required />
                    </label>
                </div>
                {(gameMode !== 'AI' && gameMode !== 'Bot') && (
                    <div>
                        <label>
                            Player 2 Name:
                            <input type="text" value={player2Name} onChange={(e) => setPlayer2Name(e.target.value)} required />
                        </label>
                    </div>
                )}
                <h2>Select Game Mode</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={() => handleModeClick('2Player')}
                        style={{ backgroundColor: gameMode === '2Player' ? 'lightblue' : 'white' }}
                    >
                        2 Player
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeClick('AI')}
                        style={{ backgroundColor: gameMode === 'AI' ? 'lightblue' : 'white' }}
                    >
                        Against AI
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeClick('Bot')}
                        style={{ backgroundColor: gameMode === 'Bot' ? 'lightblue' : 'white' }}
                    >
                        Against Bot
                    </button>
                </div>
                <button type="submit" disabled={!gameMode}>Start Game</button>
            </form>
        </div>
    );
};

export default StartPage;
