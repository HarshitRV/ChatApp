// Node modules.
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const cors = require("cors");
const Filter = require("bad-words");
const profanity = require("profanity-hindi");

// Utils imports.
const { 
    generateMessage, 
    generateLocationMessage 
} = require("./utils/messages");

const { 
    addUser,
    removeUser,
    getUser,
    getUsersInRoom 
} = require("./utils/user")

// Declarations.
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Middlewares.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res)=>{
    res.render("chats/join");
});

app.route("/chats")
    .get((req, res)=>{
        res.render("chats/chat");
    })

// Connecting socket io
io.on("connection", (socket)=>{
    console.log("New websocket connection");

    // Listen for joinRequest event
    socket.on("joinRoom", ({username, room}, cb)=>{

        const { success, error, user } = addUser({
            id: socket.id,
            username,
            room
        });

        if(!success) return cb(error);

        socket.join(user.room);

        // * Notifies the current user that he has joined the chat.
        socket.emit("message", generateMessage("You joined the chat room.", user.username));

        // * Emit the roomData to the frontend
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        // * Notifies all other users withing the room except the one who joined the room.
        socket.broadcast.to(room).emit("message", generateMessage(`joined the room!`, user.username));

        cb();

        // Listen for the sendMessage event from frontend
        socket.on("sendMessage", ({ message, username }, cb)=>{
            const filter = new Filter();

            const user = getUser(socket.id);

            if(filter.isProfane(message) || profanity.isMessageDirty(message)) return cb("Profanity is not allowed !");

            io.to(user.room).emit("message",generateMessage(message, user.username));

            cb();
        });

        // Listen for geoLocation being sent by the client.
        socket.on("geoLocation", (locationObj, cb)=>{
            const user = getUser(socket.id);
            io.to(user.room).emit("location", generateLocationMessage(locationObj));
            
            cb("Your location was shared with everyone.");
        });

  
        // Notifies everyone when a user leaves the chat.
        socket.on("disconnect", ()=>{
            const { success, user } = removeUser(socket.id);
            if(success){
                io.to(user.room).emit("message", generateMessage("Left the chat.", username));
                io.to(user.room).emit("roomData", {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                });
            }
        });

    });

});

server.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}/`);
});