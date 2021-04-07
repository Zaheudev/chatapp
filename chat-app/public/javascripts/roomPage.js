const textField = document.querySelector("#textField");
const sendButton = document.querySelector("#sendField");


client.onopen = function(event) {
    client.send(JSON.stringify(new Message("joined")));
}