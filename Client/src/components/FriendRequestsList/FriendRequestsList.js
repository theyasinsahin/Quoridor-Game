import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PENDING_REQUESTS } from '../../graphql/queries';
import '../FriendList/FriendList.css';

const FriendRequestList = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch friends using GraphQL query
  const { data, loading, error } = useQuery(GET_PENDING_REQUESTS, {
    variables: { userId: user.id },
  });

  if (loading) return (
    <div className="friends-list-container">
        <h2>Your Friends</h2>
        <p className='friends-list'>Loading friend request...</p>
    </div>);
  if (error) return (
    <div className="friends-list-container">
        <h2>Your Friends</h2>
        <p className="friends-list">You don't have any friend request</p>
    </div>
  );

  const {friendRequests} = data;

  return (
    
      <div className="friends-list-container">
        <h2>Your Friend Requests</h2>
        <ul className='friends-list'>
          {friendRequests.map((friendRequest) => (
            <li key={friendRequest.from.id}>
              {friendRequest.from.name} - Status: {friendRequest.status}
            </li>
          ))}
        </ul>
      </div>
    
  );
};

export default FriendRequestList;
