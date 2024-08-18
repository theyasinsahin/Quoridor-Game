import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartPage.css';

const StartPage = (props) => {

    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const [gameMode, setGameMode] = useState('2Player');
    const navigate = useNavigate();

    /*useEffect(() => {
        setPlayer1Name(props.user.name);
    }, [props.user.name]);    */

    const handleSubmit = (e) => {
        navigate('/game', { state: { player1Name, player2Name, mode: gameMode } });
    };

    const handleModeClick = (selectedMode) => {
        if(selectedMode !== gameMode){
            setGameMode(selectedMode);
            setPlayer2Name('');
            if (selectedMode === 'AI' || selectedMode === 'Bot') {
                setPlayer2Name(selectedMode); // Set player2Name to 'AI' or 'Bot' when against AI or Bot mode is selected
            }
        }
        
    };

    return (
        <div className="container">
        <h1 className='title'>Quoridor Game</h1>
        <div className="content">
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        <span>First Player  </span>
                        <input type="text" value={player1Name} onChange={(e) => setPlayer1Name(e.target.value)} required />
                    </label>
                </div>
                {(gameMode !== 'AI' && gameMode !== 'Bot') && (
                <div>
                    <label>
                        <span>Second Player</span>
                        <input type="text" value={player2Name} onChange={(e) => setPlayer2Name(e.target.value)} required />
                    </label>
                </div>
                )}
                <h2>Select Game Mode</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    type="button"
                    onClick={() => handleModeClick('2Player')}
                    style={{ backgroundColor: gameMode === '2Player' ? 'rgb(255, 221, 179)' : 'rgb(252, 242, 230)' }}
                >
                    2 Player
                </button>
                <button
                    type="button"
                    onClick={() => handleModeClick('AI')}
                    style={{ backgroundColor: gameMode === 'AI' ? 'rgb(255, 221, 179)' : 'rgb(252, 242, 230)' }}
                >
                    Against AI
                </button>
                <button
                    type="button"
                    onClick={() => handleModeClick('Bot')}
                    style={{ backgroundColor: gameMode === 'Bot' ? 'rgb(255, 221, 179)' : 'rgb(252, 242, 230)' }}
                >
                    Against Bot
                </button>
            </div>
            <button type="submit" disabled={!gameMode}>Start Game</button>
            </form>
        </div>
</div>

    );
};

export default StartPage;
