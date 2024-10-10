import User from "../../../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const resolvers = {
    createDummyUser: async (parent, {name, email, password, rating, country}, context) => {
        try {
            const newUser = new User({
                name: name,
                email: email,
                password: password,
                rating: rating,
                country: country,
            });

            await newUser.save();
            return newUser;
        } catch (error) {
            throw new Error('Error creating user');
        }
    },
    deleteUser: async(parent, {input:{id}}, context) => {
        try {
            const {User} = context;
        
            const user = await User.findByIdAndDelete(id);
            if(!user){
                return {response: "User bulunamadı", statusCode: 400};
            }
            return {response: "User silindi", statusCode: 200};
        } catch (error) {
            throw new Error('Error deleting User');
        }
    },
    register: async(parent, {name, email, password}, context) => {
        const {User, secret} = context;
        const existingUser = await User.findOne({email});
        if(existingUser) {
            throw new Error('User already exists');
        }

        const user = new User({ name, email, password});
        await user.save();

        const token = jwt.sign(
            {id: user.id,
            email: user.email},
            secret,
            {expiresIn: '1d'});
        
        return {
            token,
            user
        };
    },
    login: async (parent, { email, password}, context) => {
        const {User, secret} = context;
        const user = await User.findOne({ email });
        if(!user){
            throw new Error('User not found');
        }

        const valid = await bcrypt.compare(password, user.password)
        if(!valid){
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { id: user.id, 
                email: user.email }, 
            secret, 
            { expiresIn: '1d' });

        return {
            token,
            user
        };        
    },
    sendFriendRequest: async (parent, { userId, friendId }, { User }) => {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if(!user || !friend){
            return {response: "User or Friend not found", statusCode: 400};
        }

        // Check if a friend request already exists or if they're already friends
        const existingRequest = friend.friendRequests.find(request => request.from.toString() === userId);
        if(existingRequest || user.friends.includes(friendId)) {
            return { response: "Friend request already sent or user is already a friend", statusCode: 400};
        }

        // Add friend request to the friend's request list
        friend.friendRequests.push({from: userId});
        await friend.save();

        return { response: "friend request sent", statusCode: 200};
    },
    acceptFriendRequest: async (parent, { userId, friendId }, { User }) => {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if(!user || !friend){
            return { response: "User or friend not fount", statusCode: 400};
        }

        // Find and update the friend request
        const friendRequest = user.friendRequests.find(request => request.from.toString() === friendId);
        if(!friendRequest || friendRequest.status !== 'pending') {
            return { response: "Friend request not found or not pending", statusCode: 400};
        }

        // Accept the request: Add both users to each other's friend list
        user.friends.push(friendId);
        friend.friends.push(userId);

        // Remove the request after acceptance
        user.friendRequests = user.friendRequests.filter(request => request.from.toString() !== friendId);

        await user.save();
        await friend.save();

        return { response: "Friend request accepted", statusCode: 200 };
    },
    rejectFriendRequest: async (parent, { userId, friendId }, { User }) => {
        const user = await User.findById(userId);

        if(!user){
            return {response: "User not found", statusCode: 400};
        }

        // Remove the friend request
        user.friendRequests = user.friendRequests.filter(request => request.from.toString() !== friendId);
        await user.save();

        return { response: "Friend request rejected", statusCode: 200 };
    },
}

export default resolvers;