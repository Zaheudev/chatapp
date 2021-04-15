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
    }
});

function jrF1(){
    username = joinRoomDialog.querySelector(".usernameField").value;
    code = joinRoomDialog.querySelector(".codeField").value;
    client.send(JSON.stringify(new Message("askJoinRoom", {username: username, code: code})));
}

function jrF2(){
    joinRoomDialog.style = "display: none;";
    let fields = joinRoomDialog.querySelectorAll("input");
    dialogOpened = false;
    fields.forEach((e) => {
        e.value = null;
    });
}

joinRandomRoomButton.addEventListener('click', (e) =>{
    if(dialogOpened === false){
        joinRandomRoomDialog.style = "display: block;";
        dialogOpened = true;
    }
});

function jrrF1(){
    username = joinRandomRoomDialog.querySelector(".usernameField").value;
    client.send(JSON.stringify(new Message("askJoinRandomRoom", {username: username})));
}

function jrrF2(){
    let fields = joinRandomRoomDialog.querySelectorAll("input");
    joinRandomRoomDialog.style = "display: none;";
    dialogOpened = false;
    fields.forEach((e) => {
        e.value = null;
    });
}

let slots = null;
createRoomButton.addEventListener('click', (e) =>{
    if(dialogOpened === false){
        dialogOpened = true;
        createRoomDialog.style = "display: block";
    }
});

function crcF1() {
    username = createRoomDialog.querySelector(".usernameField").value;
    slots = createRoomDialog.querySelector(".slotsField").value;
    acces = createRoomDialog.querySelector(".checkboxField").checked;
    client.send(JSON.stringify(new Message("askCreateRoom", {username: username, slots: slots, acces: acces})));
}

function crcF2() {
    let fields = createRoomDialog.querySelectorAll("input");
    dialogOpened = false;
    createRoomDialog.style = "display: none";
    fields.forEach((e) => {
        if(e.className != "slotsField"){
            e.value = null;
        }
    });
}

function removeSpaces(string) {
    return string.split(' ').join('');
}