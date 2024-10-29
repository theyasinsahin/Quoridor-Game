import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SEND_FRIEND_REQUEST } from '../../graphql/mutations';

const SendFriendRequest = (props) => {
  const [friendName, setFriendName] = useState('');
  const [sendFriendRequest, { data, loading, error }] = useMutation(SEND_FRIEND_REQUEST);

  const handleAddFriend = () => {
    const {sortedUsers, loggedInUser} = props;
    const friend = sortedUsers.find(user => user.name === friendName);
    const friendId = friend ? friend.id : null;  // Eğer kullanıcı bulunamazsa null döner

    sendFriendRequest({ variables: { userId: loggedInUser.id, friendId } })
      .then(response => {
        console.log(response.data.sendFriendRequest);
        // Handle success, e.g., update the UI or reset the form
      })
      .catch(err => {
        console.error('Error sending friend request:', err);
    });
  };

  return (
    <div>
      <input
        type="text"
        value={friendName}
        onChange={(e) => setFriendName(e.target.value)}
        placeholder="Enter user's name"
      />
      <button onClick={handleAddFriend}>Send Friend Request</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error sending friend request: {error.message}</p>}
    </div>
  );
};

export default SendFriendRequest;