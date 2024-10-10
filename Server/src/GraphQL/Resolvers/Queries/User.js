export default {
    me: (parent, args, context) => {
        console.log("merhaba");
        const {User} = context;
        return {name: "Yasin", email: "yasin@gmail.com", id:1, rank: 2000, country: "Turkiye"};
    },
    users: async (parent, args, context) => {
        try{
            const {User} = context;
            return await User.find({});
        } catch (error) {
            throw new Error('Error fetching users');
        }
    },
    userFriends: async (parent, { userId }, { User }) => {
        const user = await User.findById(userId).populate('friends');
        return user.friends;
    },
    friendRequests: async (parent, { userId }, { User }) => {
        // Find the user and populate the 'from' field of friend requests
        const user = await User.findById(userId).populate('friendRequests.from');
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Find the first pending request
        const pendingRequest = user.friendRequests.filter(request => request.status === 'pending');

        // Return an array: either with the found pending request or an empty array
        return pendingRequest;
      },
    userInfos: async (parent, { userId }, { User }) => {
        const user = await User.findById(userId);

        return user;
    }
      
      
}

