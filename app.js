// Node modules.
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const cors = require("cors");
const Filter = require("bad-words");

// Utils imports.
const { generateMessage, generateLocationMessage } = require("./utils/messages");

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
    res.render("index");
});

app.get("/join", (req, res)=>{
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
    socket.on("joinRoom", ({username, room})=>{
        socket.join(room);
        console.log(socket.rooms)
        // Notifies the current user that he has joined the chat.
        socket.emit("message", generateMessage("You joined the chat room.", username));

        // Notifies all other users withing the room except the one who joined the room.
        socket.broadcast.to(room).emit("message", generateMessage(`You joined the room!`, username));
    
        socket.on("sendMessage", ({ message, username }, cb)=>{
            const filter = new Filter();

            if(filter.isProfane(message)) return cb("Profanity is not allowed !");

            io.to(room).emit("message",generateMessage(message, username));

            cb();
        });

        // Listen for geoLocation being sent by the client.
        socket.on("geoLocation", (locationObj, cb)=>{
            io.to(room).emit("location", generateLocationMessage(locationObj));
            
            cb("Your location was shared with everyone.");
        });
   
  
        // Notifies everyone when a user leaves the chat.
        socket.on("disconnect", ()=>{
            console.log(socket.rooms); 
            io.emit("message", generateMessage("Left the chat.", username));
        });

    });

});

server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})