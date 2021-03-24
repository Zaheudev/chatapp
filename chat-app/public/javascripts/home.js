const joinRoomDialog = document.querySelector("#joinRoomDialog");
const createRoomDialog = document.querySelector("#createRoomDialog");
const joinRoomButton = document.querySelector("#joinRoomButton");
const createRoomButton = document.querySelector("#createRoomButton");

var submitInput;

console.log(submitInput);
joinRoomButton.addEventListener('click', (e) =>{
    joinRoomDialog.style = "display: block";
    submitInput = joinRoomDialog.querySelector(".submitInput");
    console.log(submitInput);
});

createRoomButton.addEventListener('click', (e) =>{
    createRoomDialog.style = "display: block";
    submitInput = createRoomDialog.querySelector(".submitInput");
    console.log(submitInput);
});

if(submitInput != null){
    submitInput.addEventListener('click', (e))
}