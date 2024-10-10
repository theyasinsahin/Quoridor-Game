import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_FRIENDS } from '../../graphql/queries';
import './FriendList.css';

const FriendList = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch friends using GraphQL query
  const { data, loading, error } = useQuery(GET_USER_FRIENDS, {
    variables: { userId: user.id },
  });

  if (loading) return (
    <div className="friends-list-container">
        <h2>Your Friends</h2>
        <p className='friends-list'>Loading friends...</p>
    </div>);
  if (error) return (
    <div className="friends-list-container">
        <h2>Your Friends</h2>
        <p className="friends-list">You don't have any friends</p>
    </div>
  );

  const friends = data.userFriends;

  return (
    
      <div className="friends-list-container">
        <h2>Your Friends</h2>
        <ul className='friends-list'>
          {friends.map((friend) => (
            <li key={friend.id}>
              {friend.name} - Rating: {friend.rating} - Country: {friend.country}
            </li>
          ))}
        </ul>
      </div>
    
  );
};

export default FriendList;
