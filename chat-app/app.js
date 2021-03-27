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

    // if(currentRooms != 0){
    //     //looping through the map until finds a room
    //     let roomFound = false;
    //     for(const [id, room] of currentRooms){
    //         if(room.getUsers.length === 1 || room.getUsers().length != room.getSlots()){
    //             //room found
    //             roomFound = true;
    //             room.addUserToRoom(new User(con, "test"));
    //             console.log("Game Found, joining room " + room.getUsers().length);
    //         }
    //     }
    //     if(roomFound === false){
    //         // no rooms available, creating new one
    //         let newRoom = new Room(new User(con, "test"), 4, con.id);
    //         currentRooms.set(newRoom.getId(), newRoom);
    //         console.log("Creating new room, none rooms available " + newRoom.getUsers().length);
    //     }
    // }else{
    //     //no rooms running, creating one
    //     console.log("Creating new room, none rooms found");
    //     let newRoom = new Room(new User(con, "test"), 4, con.id);
    //     currentRooms.set(newRoom.getId(), newRoom);
    //     console.log("Creating new room, none rooms available " + newRoom.getUsers().length);
    // }

    ws.on("message", function(message) {
        let clientMessage = JSON.parse(message);
        console.log(clientMessage.data);
        let msg = clientMessage.data;

        switch(clientMessage.type){
            case "joinRoomCommand":
                //looping thorugh the map until finds the room with the corresponding code
                for(const [code, room] of currentRooms){
                    if(room.getCode() === msg.code && room.getAvailableSlots() != 0){
                        room.addUserToRoom(new User(con, msg.username));
                        console.log("joined room with code: " + code + " users: " + room.getUsers().length);
                        console.log("remaining slots: " + room.getAvailableSlots());
                    }
                    console.log("wrong code or not enough space");
                }
                break;
            case "createRoomCommand":
                let newRoom = new Room(new User(con, msg.username), msg.slots, makeCode(6), msg.acces);
                currentRooms.set(newRoom.getCode(), newRoom);
                console.log("Room created with code " + `and setted acces to ${newRoom.getAcces() ? "public" : "private"}` 
                    + newRoom.getCode() + ", the host is " + newRoom.getHost().getName());
                break;
            case "joinRandomRoomCommand":
                if(currentRooms != 0){
                    for(const [code, room] of currentRooms){
                        if(room.getPublic() && room.getAvailableSlots() != 0){
                            room.addUserToRoom(new User(con, msg));
                            console.log("joined room with code: " + code + " users: " + room.getUsers().length);
                            console.log("remaining slots: " + room.getAvailableSlots());
                        }
                    }
                }
                console.log("no rooms available, create a room or wait for available rooms");
                break;
        }
    });

});

function makeCode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

http.createServer(app).listen(port);
console.log("Server started on port " + port);