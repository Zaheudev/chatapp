const textField = document.querySelector("#textField");
const sendButton = document.querySelector("#sendButton");


client.onopen = function(event) {
    client.send(JSON.stringify(new Message("joined")));

}

setTimeout(()=>{
    if(document.querySelector("#list").childElementCount == 0){
        location.reload();
    }
}, 1000);

sendButton.addEventListener('click', (e) => {
    if(textField.value.length != 0){
        client.send(JSON.stringify(new Message("MESSAGE", {text: textField.value, from: realusr, code: roomCode})));
        textField.value = null;
        console.log(realusr);
    }
});