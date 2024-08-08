const { createServer } = require('http');
const { Server } = require("socket.io");
const port = 8080;

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: "http://localhost:3000/",
})

const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
    console.log("a user connected");
    allUsers[socket.id] = {
        socket: socket,
        online: true,
    }

    socket.on("request_to_play", (data) => {
        const currentUser = allUsers[socket.id];
        currentUser.playerName = data.playerName

        let opponentPlayer;

        for (const key in allUsers) {
            const user = allUsers[key];
            if(user.online && !user.playing && socket.id !== key) {
                opponentPlayer = user;
                break;
            }
        }

        if(opponentPlayer){
            allRooms.push({
                player1: opponentPlayer,
                player2: currentUser,
            })
            console.log("oyuncu bulundu");
        }else{
            currentUser.socket.emit("OpponentNotFound");
        }
    })
})

httpServer.listen(port);
console.log(port, "dinleniyor");