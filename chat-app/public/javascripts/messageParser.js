const client = new WebSocket("ws://localhost:8080");

function Message (type, data) {
    this.type = type;
    this.data = data;
}

var realusr = null;
var roomCode = null;

var data = null;

client.onmessage = function (event) {
    let msg = JSON.parse(event.data);
    resolveMsg(msg);
}

function resolveMsg(msg){
    console.log(msg.type);
    console.log(msg.data);
    let solvedMsg = msg.data;
    switch(msg.type){
        case "VALID_CRC":
            let createRoomValid = document.querySelector("#createRoomValid");
            dialogDisable(createRoomDialog, createRoomValid);
            createRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            createRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            createRoomValid.querySelector(".acces").innerHTML = `Acces: ${msg.data.acces ? "public" : "private"}`;
            data = msg.data;
            addBackListener(createRoomValid);
            break;
        case "VALID_JRC":
            let joinRoomValid = document.querySelector("#joinRoomValid");
            dialogDisable(joinRoomDialog, joinRoomValid);
            joinRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            joinRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            data = msg.data;
            addBackListener(joinRoomValid);
            break;
        case "VALID_JRRC":
            let joinRandomRoomValid = document.querySelector("#joinRandomRoomValid");
            dialogDisable(joinRandomRoomDialog, joinRandomRoomValid);
            joinRandomRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            joinRandomRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            data = msg.data;
            addBackListener(joinRandomRoomValid);
            break;
        case "JOIN_JRC":
            console.log(msg.type);
            document.querySelector("#joinRoomValid").querySelector("form").submit();
            break;
        case "JOIN_CRC":
            console.log(msg.type);
            document.querySelector("#createRoomValid").querySelector("form").submit();
            break;
        case "JOIN_JRRC":
            console.log(msg.type);
            document.querySelector("#joinRandomRoomValid").querySelector("form").submit();
            break;
        case "GET_DATA":
            const getHost = function(){
                let host;
                solvedMsg.users.forEach(usr => {
                    if(usr.role === "host") {
                        host = usr;
                    }
                });
                return host;
            }
            document.querySelector("#code").innerHTML = `CODE: ${solvedMsg.code}`;
            document.querySelector("#acces").innerHTML = `ACCES: ${solvedMsg.acces ? "public" : "private"}`.toUpperCase();
            document.querySelector("#users").innerHTML = `USERS: ${solvedMsg.users.length}/${solvedMsg.slots}`;
            document.querySelector("#host").innerHTML = `HOST: ${getHost().name}`;
            roomCode = solvedMsg.code;
            break;
        case "VALID_MSG":
            let node = document.createElement("p");  
            let msgNode = `${solvedMsg.username === realusr ? "YOU" : solvedMsg.username}: ${solvedMsg.text}`
            node.append(msgNode);
            document.querySelector("#history").append(node);
            break;
        case "UserLeft":
            document.querySelector("#users").innerHTML = `USERS: ${solvedMsg.room.users.length}/${solvedMsg.room.slots}`;
            alert(`User ${solvedMsg.username} left the room!`);
            break;
        case "PRIVATE_DATA":
            realusr = msg.data;
            break;
        case "wrongCode":
            alert("Wrong Code!");
            break;
        case "usernameTaken":
            alert("Change your username before joining this room");
            break;
        case "noRooms":
            alert("No rooms available. Create one by yourself and wait for users to connect! Or try change your username!");
            break;
    }
}

function submitData(type){
    client.send(JSON.stringify(new Message(type, data)));
}

function addBackListener(dialog){
    dialog.querySelector(".No").addEventListener('click', (e) => {
        dialog.style = "display: none;";
        dialogOpened = false;
    });
}

function dialogDisable(dialog1, dialog2){
    dialog1.style = "display: none;";
    dialog2.style = "display: block;";
}
