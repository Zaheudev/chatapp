const joinRoomDialog = document.querySelector("#joinRoomDialog");
const createRoomDialog = document.querySelector("#createRoomDialog");
const joinRoomButton = document.querySelector("#joinRoomButton");
const createRoomButton = document.querySelector("#createRoomButton");

var username = null;

joinRoomButton.addEventListener('click', (e) =>{
    joinRoomDialog.style = "display: block";
    submitInput = joinRoomDialog.querySelector(".submitInput");
    dialog = "joinRoom";
    dialogOpen = true;
    
    joinRoomDialog.querySelector(".submitInput").addEventListener('click', (e) =>{
        username = joinRoomDialog.querySelector(".usernameField").value;
        client.send(JSON.stringify(new Message("username", {username: username, code: "QSWER"})));
    });
});

createRoomButton.addEventListener('click', (e) =>{
    createRoomDialog.style = "display: block";
    submitInput = createRoomDialog.querySelector(".submitInput");
    username = joinRoomDialog.querySelector(".usernameField");
    dialogOpen = true;
    dialog = "createRoom";

    createRoomDialog.querySelector(".submitInput").addEventListener('click', (e) =>{
        username = createRoomDialog.querySelector(".usernameField").value;
        client.send(JSON.stringify(new Message("username", username)));
    });
});