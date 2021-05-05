const express = require('express');
const http = require("http");
const ws = require("ws");
const indexRouter = require("./routes/index.js");
const path = require("path");

const Room = require("./room.js");
const User = require("./user.js");
const Message = require("./message.js");

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
var roomIds = new Map();

var tempCode = null;
var tempUser = null;

wsServer.on('connection', function(ws) {
    let con = ws;
    con.id = connectionId++;

    console.log(con.id + " connected");

    ws.on("message", function(message) {
        let clientMessage = JSON.parse(message);
        console.log(clientMessage.data);
        console.log(clientMessage.type);
        let msg = clientMessage.data;

        switch(clientMessage.type){
            // 'ask' cases are for processing data and asking the user if they really want to proceed that act
            case "askCreateRoom":
                let code = makeCode(6);
                con.send(JSON.stringify(new Message("VALID_CRC", {username: msg.username, code: code, slots: msg.slots, acces: msg.acces})));
                break;
            case "askJoinRoom":
                let roomFound;
                let valid = false;
                //looping thorugh the map until finds the room with the corresponding code
                for(const [code, room] of currentRooms){
                    if(code === msg.code && room.getAvailableSlots() != 0){
                        valid = checkForUsername(msg.username, code);
                        if(valid === 1){
                            con.send(JSON.stringify(new Message("VALID_JRC", {username: msg.username, code: msg.code, slots: room.getSlotsFormat()})));
                        }
                        roomFound = true;
                    }
                }
                if(valid === 0){
                    con.send(JSON.stringify(new Message("usernameTaken")));
                }
                if(!roomFound){
                    console.log("failed to find the room with code " + msg.code);
                    con.send(JSON.stringify(new Message("wrongCode")));
                }
                break;
            case "askJoinRandomRoom":
                //deletes every item from room to assign new ones
                publicRooms.clear();
                for(const [code, room] of currentRooms){
                    if(room.acces){
                        //assigning new items to map
                        publicRooms.set(code, room);
                    }
                }
                if(publicRooms.size != 0){
                    let randRoom = choiceRandomRoom(publicRooms, msg.username);
                    if(randRoom != null){
                        con.send(JSON.stringify(new Message("VALID_JRRC", {username: msg.username, code: randRoom.getCode(), slots: randRoom.getSlotsFormat()})));
                    }else{
                        console.log("no rooms available");
                        con.send(JSON.stringify(new Message("noRooms")));
                    }
                }else{
                    console.log("no rooms available");  
                    con.send(JSON.stringify(new Message("noRooms")));
                }
                break;
                //cases like joinRoomCommand, createRoomCommand and joinRandomRoomCommand are running after user agreed an ask case
            case "joinRoomCommand":
                let newUserjr = new User(con, msg.username, con.id, msg.code, "N/A");
                currentRooms.get(msg.code).addUserToRoom(newUserjr);
                users.set(msg.code, newUserjr);
                console.log("joined room with code: " + msg.code + " users: " + currentRooms.get(msg.code).getUsers().length);
                console.log("remaining slots: " + currentRooms.get(msg.code).getAvailableSlots());
                tempCode = msg.code;
                tempUser = newUserjr;
                con.send(JSON.stringify(new Message("JOIN_JRC")));
                break;
            case "createRoomCommand":
                let newHost = new User(con, msg.username, con.id, msg.code, "host");
                let newRoom = new Room(newHost, msg.slots, msg.code, msg.acces);
                users.set(msg.code, newHost)
                currentRooms.set(newRoom.getCode(), newRoom);
                tempCode = msg.code;
                tempUser = newHost;
                console.log("Room created with code " + newRoom.getCode() + ` and setted acces to ${newRoom.getAccesFormat()} ` 
                     + ", the host is " + newRoom.getHost().getName());
                con.send(JSON.stringify(new Message("JOIN_CRC", newHost), getCircularReplacer()));
                break;
            case "joinRandomRoomCommand":
                let newUserjrr = new User(con, msg.username, con.id, msg.code, "N/A");
                publicRooms.get(msg.code).addUserToRoom(newUserjrr);
                users.set(msg.code, newUserjrr);
                tempCode = msg.code;
                tempUser = newUserjrr;
                con.send(JSON.stringify(new Message("JOIN_JRRC")));
                console.log("joined room with code: " + msg.code + " users: " + publicRooms.get(msg.code).getUsers().length);
                console.log("remaining slots: " + publicRooms.get(msg.code).getAvailableSlots());
                break;
            case "joined":
                //this case is getting from roomPage after the new WebSocket is loaded and means a player joined a certain room
                users.get(tempUser.getRoomId()).setWs(con);
                users.get(tempUser.getRoomId()).setId(con.id);
                tempUser.setId(con.id);
                roomIds.set(tempUser.getId(), tempUser);
                let room = currentRooms.get(tempCode);
                let usrArr = room.getUsers();
                
                con.send(JSON.stringify(new Message("PRIVATE_DATA", tempUser.getName())));
                usrArr.forEach(e => {
                    e.getWs().send(JSON.stringify(new Message("GET_DATA", room), getCircularReplacer()));
                });
                console.log("new id: " + tempUser.getWs().id);
                break;
            case "MESSAGE":
                //this case is for when a player sends a text message in chat room
                let arr = currentRooms.get(msg.code).getUsers();
                arr.forEach(e => {
                    e.getWs().send(JSON.stringify(new Message("VALID_MSG", {text: msg.text, username: msg.from})));
                });
                break;
            case "updateAcces":
                //this case is getting from the host WebSocket of the room and updates the acces of the room (part of the setting of the room) and updates to all users
                let usersArr = currentRooms.get(msg.code).getUsers();
                currentRooms.get(msg.code).setAcces(msg.acces);
                usersArr.forEach(e => {
                    if(e.getId() === currentRooms.get(msg.code).getHost().getId()){
                        usersArr.forEach(e => {
                            e.getWs().send(JSON.stringify(new Message("updatedAcces", currentRooms.get(msg.code).getAcces())));
                        });
                    }
                });
                break;
            case "GiveHost":
                let arr2 = currentRooms.get(msg.room).getUsers();

                arr2.forEach(e => {
                    if(e.name === msg.to.name){
                        currentRooms.get(msg.room).getHost().setRole("N/A");
                        e.setRole("host");
                        currentRooms.get(msg.room).setHost(e);
                        e.getWs().send(JSON.stringify(new Message('HOST', currentRooms.get(msg.room)), getCircularReplacer()));
                        arr2.forEach(e => {
                            e.getWs().send(JSON.stringify(new Message("NewHost", currentRooms.get(msg.room)), getCircularReplacer()));
                        });
                    }
                });
                break;
            case "deleteRoom":
                let host = currentRooms.get(msg.code).getHost();
                currentRooms.get(msg.code).getUsers().forEach(e => {
                    if(e.getId() === host.getId()){
                        if(e.getRole() === "host"){
                            currentRooms.get(msg.code).getUsers().forEach(e => {
                                e.getWs().send(JSON.stringify(new Message("deleteRoom", msg.data)));
                                if(currentRooms.get(msg.code).getUsers() < 1){
                                    currentRooms.delete(msg.code);
                                }
                            });
                        }
                    }
                });
                break;
        }
    });

    ws.on("close", function(code){
        console.log(con.id + " DISCONNECTED");

        for(const [id, user] of roomIds){
            if(id === con.id){
                //this for loop is used to check if the ws who got disconnected is from a roomPage and not from homePage
                let room = currentRooms.get(user.getRoomId());
                if(room != null){
                    room.removeUser(user);
                    if(room.getUsers().length === 0){
                        currentRooms.delete(user.getRoomId());
                    }else{
                        if(user.role === "host"){
                            //assigning a new host and sending a message to it!
                            let newHost = changeHost(true, currentRooms.get(user.getRoomId()).getHost());
                            newHost.getWs().send(JSON.stringify(new Message("HOST", currentRooms.get(user.getRoomId())), getCircularReplacer()));
                            currentRooms.get(user.getRoomId()).getUsers().forEach(e => {
                                //sending message to all users from the room to update the host!
                                e.getWs().send(JSON.stringify(new Message("NewHost", currentRooms.get(user.getRoomId())), getCircularReplacer()));
                            });
                        }
                    }
                    room.getUsers().forEach(e => {
                        //sends the message "UserLeft" to all websockets connected to the room of the leaver to update the room for everyone
                        e.getWs().send(JSON.stringify(new Message("UserLeft", {room: room, username: user.getName()}), getCircularReplacer()));
                    });
                }
            }
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

function choiceRandomRoom(map, name){
    let codes = new Array();
    for(const [code, room] of map){
        if(room.getAvailableSlots() != 0 && checkForUsername(name, code) === 1){
            codes.push(code);
        }
    }

    let size = Math.floor(Math.random() * codes.length);
    let result = map.get(codes[size]);
    return result;
}

function checkForUsername(name, roomcode){
    let arr = currentRooms.get(roomcode).getUsers();
    let valid = 1;
    if(arr === null) valid = 2;
    arr.forEach(e =>{
        if(e.name === name){
            valid = 0;
        }
    });
    return valid;
}

function changeHost(random, oldHost, newHost){
    if(random){
        //if random parameter is true then sets the host to a random user connected (used when the host disconnects)
        let room = currentRooms.get(oldHost.getRoomId());
        let size = Math.floor(Math.random() * room.getUsers().length);
        let result = room.users[size];
        result.setRole("host");
        room.setHost(result);
        return result;
    }else{
        //if random parameter is false then sets the host to 'newHost' user (used when oldhost wants to parse the host to a user of his choice)
        if(newHost != null){
            let room1 = currentRooms.get(oldHost.getRoomId()); 
            room1.getUser(oldHost.name).setRole("N/A");
            room1.getUser(newHost.name).setRole("host");
            currentRooms.get(oldHost.getRoomId()).setHost(newHost);
            return room1.getUser(newHost.name);
        }
    }
}

function getCircularReplacer(){
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };


http.createServer(app).listen(port);
console.log("Server started on port " + port);