import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;



export const ADD_FRIEND = gql`
  mutation AddFriend($userId: ID!, $friendId: ID!) {
    addFriend(userId: $userId, friendId: $friendId) {
      response
      statusCode
    }
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!, $friendId: ID!) {
    sendFriendRequest(userId: $userId, friendId: $friendId) {
      response
      statusCode
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($userId: ID!, $friendId: ID!) {
    acceptFriendRequest(userId: $userId, friendId: $friendId) {
      response
      statusCode
    }
  }
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($userId: ID!, $friendId: ID!) {
    rejectFriendRequest(userId: $userId, friendId: $friendId) {
      response
      statusCode
    }
  }
`;




