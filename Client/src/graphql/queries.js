import { gql } from "@apollo/client";

export const GET_USERS_FOR_RATING = gql`
  query GetUsers {
    users {
      name
      rating
      country
      id
    }
  }
`;

export const GET_USER_FRIENDS = gql`
  query UserFriends($userId: ID!) {
    userFriends(userId: $userId) {
      id
      name
      rating
      country
    }
  }
`;

export const GET_PENDING_REQUESTS = gql`
    query FriendRequests($userId: ID!) {
        friendRequests(userId: $userId) {
            from {
                id
                name
                email
            }
            status
        }
    }
`;

export const GET_USER_INFOS = gql`
  query UserInfos($userId: ID!) {
    userInfos(userId: $userId){
      name
      email
      country
    }
  }
`
  