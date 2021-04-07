const client = new WebSocket("ws://localhost:8080");

function Message (type, data) {
    this.type = type;
    this.data = data;
}


client.onmessage = function (event) {
    let msg = JSON.parse(event.data);
    resolveMsg(msg);
}

function resolveMsg(msg){
    switch(msg.type){
        case "VALID_CRC":
            console.log(msg.type);
            let createRoomValid = document.querySelector("#createRoomValid");
            dialogDisable(createRoomDialog, createRoomValid);
            createRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            createRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            createRoomValid.querySelector(".acces").innerHTML = `Acces: ${msg.data.acces ? "public" : "private"}`;
            addSubmitListener(createRoomValid, "createRoomCommand", msg.data);
            break;
        case "VALID_JRC":
            console.log(msg.type);
            let joinRoomValid = document.querySelector("#joinRoomValid");
            dialogDisable(joinRoomDialog, joinRoomValid);
            joinRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            joinRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            addSubmitListener(joinRoomValid, "joinRoomCommand", msg.data);
            break;
        case "VALID_JRRC":
            console.log(msg.type);
            let joinRandomRoomValid = document.querySelector("#joinRandomRoomValid");
            dialogDisable(joinRandomRoomDialog, joinRandomRoomValid);
            joinRandomRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            joinRandomRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            addSubmitListener(joinRandomRoomValid, "joinRandomRoomCommand", msg.data);
            break;
        case "JOIN_JRC":
            console.log(msg.type);
            break;
        case "JOIN_CRC":
            console.log(msg.type);
            break;
        case "JOIN_JRRC":
            console.log(msg.type);
            break;
        case "GET_DATA":
            console.log(msg.type);
            console.log(msg.data);
    }
}

function addSubmitListener(dialog, type, data){
    dialog.querySelector(".Yes").addEventListener('click', (e) =>{
        client.send(JSON.stringify(new Message(type, data)));
    });
}

function dialogDisable(dialog1, dialog2){
    dialog1.style = "display: none;";
    dialog2.style = "display: block;";
}
