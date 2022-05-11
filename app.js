const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res)=>{
    res.render('index');
});

const chats = [];

io.on("connection", (socket)=>{
    console.log("New websocket connection");

    // Notifies the current user that he has joined the chat.
    socket.emit("con", "connected");

    // Notifies all other users except the one who joined the chat.
    socket.broadcast.emit("con", "A new user joined.")

    socket.on("sendMessage", (message, callback)=>{

        const filter = new Filter();
        if(filter.isProfane(message))
            return callback("Profanity is not allowed !");

        chats.push(message)
        io.emit("message", chats);
        callback();
    });

    // Listen for geoLocation being sent by the client.
    socket.on("geoLocation", (location, cb)=>{
        io.emit("location", location);
        cb("Your location was shared with everyone.")
    });

    // Notifies everyone when a user leaves the chat.
    socket.on("disconnect", ()=>{
        io.emit("con", "A uses has left the chat.")
    });

});

server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})