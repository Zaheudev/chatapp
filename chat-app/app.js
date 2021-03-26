const express = require('express');
const http = require("http");
const ws = require("ws");
const indexRouter = require("./routes/index");
const path = require("path");

const Room = require("./room.js");
const User = require("./user.js");
const Message = require("./message.js")

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
                roomFound = true;
                room.addUserToRoom(new User(con, "test"));
                console.log("Game Found, joining room " + room.getUsers().length);
            }
        }
        if(roomFound === false){
            // no rooms available, creating new one
            let newRoom = new Room(new User(con, "test"), 4, con.id);
            currentRooms.set(newRoom.getId(), newRoom);
            console.log("Creating new room, none rooms available " + newRoom.getUsers().length);
        }
    }else{
        //no rooms running, creating one
        console.log("Creating new room, none rooms found");
        let newRoom = new Room(new User(con, "test"), 4, con.id);
        currentRooms.set(newRoom.getId(), newRoom);
        console.log("Creating new room, none rooms available " + newRoom.getUsers().length);
    }

    ws.on("message", function(message) {
        //let clientMessage represents the entire message
        let clientMessage = JSON.parse(message);
    
        //use the message type and do something with it's data  e.g: "join" or "createRoom"
        switch(message.type){
            case "e.g":
                //let msg represents the data of the message
                let msg = clientMessage.data;
                break;
        }
    });

});

http.createServer(app).listen(port);
console.log("Server started on port " + port);