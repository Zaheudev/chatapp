const joinRoomDialog = document.querySelector("#joinRoomDialog");
const createRoomDialog = document.querySelector("#createRoomDialog");
const joinRandomRoomDialog = document.querySelector("#joinRandomRoomDialog");
const joinRoomButton = document.querySelector("#joinRoomButton");
const joinRandomRoomButton = document.querySelector("#joinRandomRoomButton");
const createRoomButton = document.querySelector("#createRoomButton");

var username = null;
var dialogOpened = false;
var code = null;
var acces = null;

joinRoomButton.addEventListener('click', (e) =>{
    if(dialogOpened === false){
        joinRoomDialog.style = "display: block;";
        dialogOpened = true;
        let fields = joinRoomDialog.querySelectorAll("input");

        joinRoomDialog.querySelector(".submitInput").addEventListener('click', (e) =>{
            username = joinRoomDialog.querySelector(".usernameField").value;
            code = joinRoomDialog.querySelector(".codeField").value;
            client.send(JSON.stringify(new Message("askJoinRoom", {username: username, code: code, ready: false})));
        });
        joinRoomDialog.querySelector(".backButton").addEventListener('click', (e) =>{
            joinRoomDialog.style = "display: none;";
            fields.forEach((e) => {
                e.value = null;
                dialogOpened = false;
            });
        });
    }
});

joinRandomRoomButton.addEventListener('click', (e) =>{
    if(dialogOpened === false){
        joinRandomRoomDialog.style = "display: block;";
        dialogOpened = true;
        let fields = joinRandomRoomDialog.querySelectorAll("input");

        joinRandomRoomDialog.querySelector(".submitInput").addEventListener('click', (e) =>{
            username = joinRandomRoomDialog.querySelector(".usernameField").value;
            client.send(JSON.stringify(new Message("askJoinRandomRoom", {username: username, ready: false})));
        });

        joinRandomRoomDialog.querySelector(".backButton").addEventListener('click', (e) =>{
            joinRandomRoomDialog.style = "display: none;";
            fields.forEach((e) => {
                e.value = null;
                dialogOpened = false;
            });
        });
    }
});

let slots = null;
createRoomButton.addEventListener('click', (e) =>{
    if(dialogOpened === false){
        dialogOpened = true;
        createRoomDialog.style = "display: block";
        let fields = createRoomDialog.querySelectorAll("input");
    
        createRoomDialog.querySelector(".submitInput").addEventListener('click', (e) =>{
            username = createRoomDialog.querySelector(".usernameField").value;
            slots = createRoomDialog.querySelector(".slotsField").value;
            acces = createRoomDialog.querySelector(".checkboxField").checked;
            client.send(JSON.stringify(new Message("askCreateRoom", {username: username, slots: slots, acces: acces, ready: false})));
        });
        createRoomDialog.querySelector(".backButton").addEventListener('click', (e) => {
            createRoomDialog.style = "display: none";
            fields.forEach((e) => {
                e.value = null;
                dialogOpened = false;
            });
        });
    }
});