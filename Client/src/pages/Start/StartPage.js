import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import './StartPage.css';
import useLogout from '../../hooks/Logout/logout';
import SendFriendRequest from '../../components/FriendRequest/FriendRequest';
import { GET_USER_FRIENDS, GET_USERS_FOR_RATING } from '../../graphql/queries';
import FriendList from '../../components/FriendList/FriendList';
import FriendRequestList from '../../components/FriendRequestsList/FriendRequestsList';


import { socket } from '../../Socket';


const StartPage = (props) => {

    const user = JSON.parse(localStorage.getItem('user'));
    const [friends, setFriends] = useState([]);

    const logout = useLogout();

    // Fetch friends using GraphQL query
    const { dataFriends, loadingFriends, errorFriends } = useQuery(GET_USER_FRIENDS, {
        variables: { userId: user.id },
    });

    useEffect(() => {
        if (dataFriends && !loadingFriends && !errorFriends) {
        setFriends(dataFriends.userFriends);
        }
    }, [dataFriends, loadingFriends, errorFriends]);

    const [showSearchBox, setShowSearchBox] = useState(false);
    const [friendName, setFriendName] = useState('');

    const handleAddFriendClick = () => {
        setShowSearchBox(!showSearchBox); // Toggle search box visibility
    };

    const handleFriendNameChange = (event) => {
        setFriendName(event.target.value); // Update friend name from input
    };

    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const [gameMode, setGameMode] = useState('2Player');
    const [playerRole, setPlayerRole] = useState('player1');
    const [isThereComp, setIsThereComp] = useState(false);
    const [topUsers, setTopUsers] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [sortedUsers, setSortedUsers] = useState([]);

    const navigate = useNavigate();
    
    // Fetch users and handle loading, error
    const { loading, error, data } = useQuery(GET_USERS_FOR_RATING);


    useEffect(() => {
        if (data && !loading && !error) {
            const sortedUsers = [...data.users].sort((a, b) => b.rating - a.rating);
            const loggedUser = sortedUsers.find(u => u.name === user.name);
            const top5 = sortedUsers.slice(0, 5);
            setSortedUsers(sortedUsers);
            setLoggedInUser(loggedUser);
            setTopUsers(top5);
            setPlayer1Name(loggedUser.name);

        }
    }, [data, loading, error]);

    const handleSeeAllClick = () => {
        navigate('/high-rating-table', { state: { sortedUsers } });
    };
    


    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (gameMode === 'Online') {
            // Emit the join-room event without specifying a room ID
            socket.emit('join-room', playerRole === 'player1' ? player1Name : player2Name);
          
            // Listen for room updates (when players join or leave)
            socket.on('room-update', (players) => {
                console.log('Players in room:', players);
            });

            // Show waiting message if only one player is in the room
            socket.on('waiting', () => {
                navigate('/waiting-page');
            });
    
            // Start the game and receive player roles
            socket.on('start-game', (players) => {
                console.log("start-game: ",players);
                const player1 = players.find(p => p.role === 'player1');
                const player2 = players.find(p => p.role === 'player2');
                console.log("player1: ", player1);
                console.log("player2: ", player2);
                // Navigate to game screen with assigned player roles
                navigate('/game', { 
                    state: { 
                        player1Name: player1.id === socket.id ? player1.name : player2.name, 
                        player2Name: player1.id === socket.id ? player2.name : player1.name, 
                        mode: gameMode, 
                        playerRole: player1.id === socket.id ? 'player1' : 'player2', 
                        isThereComp,
                        playerId: player1.id === socket.id ? player2.id : player1.id, 
                    } 
                });
            });
        }else{
            navigate('/game', { state: { player1Name, player2Name, mode: gameMode, playerRole, isThereComp } });
        }
    };
    
    

    
    
    const handleModeClick = (selectedMode) => {
        if(selectedMode !== gameMode){
            if(selectedMode === "AI" || selectedMode === "Bot"){
                setIsThereComp(true);
            }else{
                setIsThereComp(false);
            }
            setGameMode(selectedMode);
            setPlayer2Name('');
            if (selectedMode === 'AI' || selectedMode === 'Bot' || selectedMode==="Online") {
                setPlayer2Name(selectedMode); // Set player2Name to 'AI' or 'Bot' when against AI or Bot mode is selected
            }
        }
        console.log(friends);
    };

    return (
        <div className="container">
        <h1 className='title'>Quoridor Game</h1>
        <img src="/images/quoridor-logo-removebg.png" alt="Quoridor Logo" className="logo" />

        {/* Flexbox Container to position content and table side by side */}
        <div className="content-wrapper">
            
            <div className="content">
                <form onSubmit={handleSubmit}>
                    <div>
                        <h2>Welcome {loggedInUser?.name}!</h2>
                    </div>
                    {(gameMode !== 'AI' && gameMode !== 'Bot' && gameMode !== 'Online') && (
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
                        onClick={() => handleModeClick('Online')}
                        style={{ backgroundColor: gameMode === 'Online' ? 'rgb(255, 221, 179)' : 'rgb(252, 242, 230)' }}
                    >
                        Online
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
                {/* Conditionally render player role selection if gameMode is 'AI' or 'Bot' */}
                {(gameMode === 'AI' || gameMode === 'Bot') && (
                    <div>
                        <h2>Choose Your Role</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setPlayerRole('player1')}
                                style={{ backgroundColor: playerRole === 'player1' ? 'rgb(255, 221, 179)' : 'rgb(252, 242, 230)' }}
                            >
                                Play as First Player
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlayerRole('player2')}
                                style={{ backgroundColor: playerRole === 'player2' ? 'rgb(255, 221, 179)' : 'rgb(252, 242, 230)' }}
                            >
                                Play as Second Player
                            </button>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={!gameMode}>Start Game</button>
                <button className='logout' onClick={logout}>Logout</button>

            </form>
            </div>

            {/* High Rating Table */}
            <div className="high-rating-table">
            <h2 className='high-rating-table-title'>High Rating Table</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error loading users</p>
            ) : (
                <div>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Rating</th>
                            <th>Country</th>

                        </tr>
                    </thead>
                    <tbody>
                        {topUsers.map((u, index) => (
                            <tr
                                key={u.id}
                                style={{
                                    backgroundColor: u.name === loggedInUser.name ? 'red' : 'rgb(255, 221, 179)',
                                    color: u.name === loggedInUser.name ? 'white' : 'rgb(115, 115, 115)',
                                }}
                            >
                                <td>{index + 1}</td>
                                <td>{u.name}</td>
                                <td>{u.rating}</td>
                                <td>{u.country}</td>
                            </tr>
                        ))}

                        {/* If the logged-in user is not in the top 5 */}
                        {loggedInUser && loggedInUser.rating < topUsers[4]?.rating && (
                            <>
                                <tr 
                                style={{color: 'rgb(115,115,115)', backgroundColor: 'rgb(255,221,179)'}}>
                                    <td>...</td>
                                    <td>...</td>
                                    <td>...</td>
                                    <td>...</td>
                                </tr>
                                <tr 
                                style={{ backgroundColor: 'red', color: 'white' }}>
                                    <td>{data.users.findIndex(u => u.name === loggedInUser.name) + 1}</td>
                                    <td>{loggedInUser.name}</td>
                                    <td>{loggedInUser.rating}</td>
                                    <td>{loggedInUser.country}</td>
                                </tr>
                            </>
                        )}
                    </tbody>

                </table>
                <button className="see-all" onClick={handleSeeAllClick}>See all table</button>
                <button className='see-all' onClick={handleAddFriendClick}>Add Friend</button>

                <FriendList/>
                <FriendRequestList/>
                </div>
            )}
            </div>
        </div>  
        {showSearchBox && (
                <SendFriendRequest sortedUsers={sortedUsers} loggedInUser={loggedInUser}/>
            )}

    </div>
    );
};

export default StartPage;
