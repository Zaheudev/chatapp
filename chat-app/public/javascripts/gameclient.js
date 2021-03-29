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
            createRoomDialog.style = "display: none;";
            createRoomValid.style = "display: block;";
            createRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            createRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            createRoomValid.querySelector(".acces").innerHTML = "Acces: " + msg.data.acces;
            addSubmitListener(createRoomValid, "createRoomCommand", msg.data);
            break;
        case "VALID_JRC":
            console.log(msg.type);
            let joinRoomValid = document.querySelector("#joinRoomValid");
            joinRoomDialog.style = "display: none;";
            joinRoomValid.style = "display: block;";
            joinRoomValid.querySelector(".code").innerHTML = "Code: " + msg.data.code;
            joinRoomValid.querySelector(".slots").innerHTML = "Slots: " + msg.data.slots;
            addSubmitListener(joinRoomValid, "joinRoomCommand", msg.data);
            break;
        case "VALID_JRRC":
            console.log(msg.type);
            let joinRandomRoomValid = document.querySelector("#joinRandomRoomValid");
            joinRandomRoomDialog.style = "display: none;";
            joinRandomRoomValid.style = "display: block;";
            break;
    }
}

function addSubmitListener(dialog, type, data){
    dialog.querySelector(".Yes").addEventListener('click', (e) =>{
        client.send(JSON.stringify(new Message(type, data)));
    });
}