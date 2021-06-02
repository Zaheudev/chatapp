const client = new WebSocket("ws://localhost:8080");

function Message (type, data) {
    this.type = type;
    this.data = data;
}

var roomCode = null;

var data = null;
var realusr = null;

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
        case "PRIVATE_DATA":
            realusr = msg.data;
            break;
        case "GET_DATA":
            document.querySelector("#code").innerHTML = `CODE: ${solvedMsg.code}`;
            document.querySelector("#acces").innerHTML = `ACCES: ${solvedMsg.acces ? "public" : "private"}`.toUpperCase();
            document.querySelector("#users").innerHTML = `USERS: ${solvedMsg.users.length}/${solvedMsg.slots}`;
            document.querySelector("#host").innerHTML = `HOST: ${getHost(solvedMsg.users).name}`;
            roomCode = solvedMsg.code;
            hostSettings(solvedMsg.users, realusr, roomCode);
            updateUsersList(solvedMsg.users);
            break;
        case "VALID_MSG":
            let node = document.createElement("p");  
            let msgNode = `${solvedMsg.username === realusr ? "YOU" : solvedMsg.username}: ${solvedMsg.text}`
            node.append(msgNode);
            document.querySelector("#history").append(node);
            let objDiv = document.querySelector("#history");
            objDiv.scrollTop = objDiv.scrollHeight - objDiv.clientHeight;
            break;
        case "HOST":
            hostSettings(solvedMsg.users, getHost(solvedMsg.users).name, solvedMsg.code);
            document.querySelector("#host").innerHTML = `HOST: ${getHost(solvedMsg.users).name}`;
            updateUsersList(solvedMsg.users);
            alert("You are the new HOST!");
            break;
        case "NewHost":
            document.querySelector("#host").innerHTML = `HOST: ${getHost(solvedMsg.users).name}`;
            alert(`The new Host is ${getHost(solvedMsg.users).name}`);
            updateUsersList(solvedMsg.users);
            break;
        case "UserLeft":
            document.querySelector("#users").innerHTML = `USERS: ${solvedMsg.room.users.length}/${solvedMsg.room.slots}`;
            updateUsersList(solvedMsg.room.users);
            alert(`User ${solvedMsg.username} left the room!`);
            break;
        case "userJoined":
            alert(`User ${msg.data} joined!`);
            break;
        case "updatedAcces":
            document.querySelector("#acces").innerHTML = `ACCES: ${solvedMsg ? "public" : "private"}`.toUpperCase();
            break;
        case "deleteRoom":
            document.querySelector("#bottomSection").querySelector("form").submit();
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

function getHost(arr){
    let host;
    arr.forEach(usr => {
        if(usr.role === "host") {
            host = usr;
        }
    });
    return host;
}

function hostSettings(arr, usr, code){
    // how this works is temporary!!
    arr.forEach(e =>{
        if(e.role === "host"){
            if(e.name === usr){
                if(!document.body.contains(document.querySelector("#deleteButton"))){
                    let form = document.createElement("form");
                    form.setAttribute('id', 'deleteButton');
                    form.setAttribute('method', 'GET');
                    form.setAttribute('action', '/');
                    let submit = document.createElement('input');
                    submit.setAttribute('type', 'submit');
                    submit.setAttribute('value', "DELETE ROOM!");
                    form.append(submit);
                    document.querySelector("#bottomSection").append(form);
                    submit.addEventListener('click', (e) => {
                        client.send(JSON.stringify(new Message("deleteRoom", {code: code, from: client.id})));
                    });
                }
                if(!document.body.contains(document.querySelector("#accesButton"))){
                    let node = document.createElement("button");
                    node.setAttribute('id','accesButton');
                    node.setAttribute('class', 'hostButton');
                    node.innerHTML = "CHANGE ACCES";
                    document.querySelector("#details").appendChild(node);
                    node.addEventListener('click', (e) =>{
                        let acces = document.querySelector("#acces").innerHTML
                        let boolean = (acces.includes("PUBLIC")) ? false : true;
                        client.send(JSON.stringify(new Message("updateAcces", {code: code, acces: boolean, from: client.id})));
                    });
                }
            }
        }
    });
}

function removeHostSettings(arr){
    document.querySelector('#accesButton').remove();
    document.querySelector('#deleteButton').remove();
}

function updateUsersList(arr){
    //updates the entire list after a player is joining or is leaving
    let div = document.createElement('div');
    let host = getHost(arr);
    div.setAttribute('id', 'list');
    arr.forEach(e => {
        let tagDiv = document.createElement("div");
        let node = document.createElement("h4");
        node.innerHTML = e.name;
        tagDiv.append(node);
        if(node.innerHTML === realusr){
            node.innerHTML = `${e.name} (YOU)`
        }
        if(e.role === "host" && e.name != host.name){
            node.innerHTML = `${e.name} (HOST)`
        }
        div.append(tagDiv);
        if(host.name === realusr && e.role != host.role){
            let button = document.createElement("button");
            let img = document.createElement("img");
            img.setAttribute("width", "20");
            img.setAttribute("height", "20");
            img.setAttribute("src", "../images/hostIcon.png");
            button.append(img);
            button.setAttribute("id", `${e.name}`);
            node.append(button);
            button.addEventListener('click', (element) => {
                client.send(JSON.stringify(new Message('GiveHost', {room: e.roomId, to: e, from: getHost(arr)})));
                removeHostSettings(arr);
            });
        }
    });
    let section = document.querySelector("#listSection");
    section.replaceChild(div ,document.querySelector("#list"));
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
