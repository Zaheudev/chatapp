const express = require('express');
const http = require("http");
const ws = require("ws");
const indexRouter = require("./routes/index");
const path = require("path");

const Room = require("./room.js");
const User = require("./user.js");

const port = process.argv[2];
const app = express();  

app.use(express.static(__dirname + "/public"));
app.set("views",path.join(__dirname, 'views'));
app.set('view engine','ejs');

app.get("/", indexRouter);
app.get("/room", indexRouter);

const wsServer = new ws.Server({port:8080});

var connectionId = 0;
var currentRooms = new Map();

wsServer.on('connection', function(ws) {
    let con = ws;
    con.id = connectionId++;

    if(currentRooms != 0){
        //looping through the map until finds a room
        let roomFound = false;
        for(const [id, room] of currentRooms){
            if(room.getUsers.length === 1 || room.getUsers().length != room.getSlots()){
                //game found
                console.log("Game Found, joining room " + room.getHost().getName());
                roomFound = true;
                room.addUserToRoom(new User(con, "test"));
            }
        }
        if(roomFound === false){
            // no rooms available, creating new one
            console.log("Creating new room, none rooms available");
            let newRoom = new Room(new User(con, "test"), 2, con.id);
            currentRooms.set(newRoom.getId(), newRoom);
        }
    }else{
        //no rooms running, creating one
        console.log("Creating new room, none rooms found");
        let newRoom = new Room(new User(con, "test"), 2, con.id);
        currentRooms.set(newRoom.getId(), newRoom);
    }
});

http.createServer(app).listen(port);
console.log("Server started on port " + port);