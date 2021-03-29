const express = require('express');
const http = require("http");
const ws = require("ws");
const indexRouter = require("./routes/index.js");
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
var publicRooms = new Map();
var users = new Map();

wsServer.on('connection', function(ws) {
    let con = ws;
    con.id = connectionId++;

    ws.on("message", function(message) {
        let clientMessage = JSON.parse(message);
        console.log(clientMessage.data);
        let msg = clientMessage.data;

        switch(clientMessage.type){
            case "askCreateRoom":
                let code = makeCode(6);
                con.send(JSON.stringify(new Message("VALID_CRC", {username: msg.username, code: code, slots: msg.slots, acces: msg.acces})));
                break;
            case "askJoinRoom":
                let roomFound;

                //looping thorugh the map until finds the room with the corresponding code
                for(const [code, room] of currentRooms){
                    if(code === msg.code && room.getAvailableSlots() != 0){
                        con.send(JSON.stringify(new Message("VALID_JRC", {username: msg.username, code: msg.code, slots: room.getSlotsFormat()})));
                        roomFound = true;
                    }
                }
                if(!roomFound){
                    console.log("failed to find the room with code " + msg.code);
                }
                break;
            case "askJoinRandomRoom":
                if(publicRooms.size != 0){
                    let randRoom = choiceRandomRoom(publicRooms);
                    con.send(JSON.stringify(new Message("VALID_JRRC", {username: msg.username, code: randRoom.getCode(), slots: randRoom.getSlotsFormat()})));
                }else{
                    console.log("no rooms available");  
                }
                break;
            case "joinRoomCommand":
                currentRooms.get(msg.code).addUserToRoom(new User(con, msg.username));
                con.send(JSON.stringify(new Message("JOIN_JRC")));
                console.log("joined room with code: " + msg.code + " users: " + currentRooms.get(msg.code).getUsers().length);
                console.log("remaining slots: " + currentRooms.get(msg.code).getAvailableSlots());
                break;
            case "createRoomCommand":
                let newRoom = new Room(new User(con, msg.username), msg.slots, msg.code, msg.acces);
                currentRooms.set(newRoom.getCode(), newRoom);
                if(msg.acces){
                    publicRooms.set(newRoom.code, newRoom);
                }
                console.log("Room created with code " + newRoom.getCode() + ` and setted acces to ${newRoom.getAccesFormat()} ` 
                     + ", the host is " + newRoom.getHost().getName());
                con.send(JSON.stringify(new Message("JOIN_CRC")));

                break;
            case "joinRandomRoomCommand":
                publicRooms.get(msg.code).addUserToRoom(new User(con, msg.username));
                console.log("joined room with code: " + msg.code + " users: " + publicRooms.get(msg.code).getUsers().length);
                console.log("remaining slots: " + publicRooms.get(msg.code).getAvailableSlots());
                con.send(JSON.stringify(new Message("JOIN_JRRC")));
                break;
        }
    });

});

function makeCode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function choiceRandomRoom(map){
    let codes = new Array();
    for(const [code, room] of map){
        if(room.getAvailableSlots() != 0){
            codes.push(code);
        }
    }

    let size = Math.floor(Math.random() * codes.length);
    let result = map.get(codes[size]);
    return result;
}

http.createServer(app).listen(port);
console.log("Server started on port " + port);