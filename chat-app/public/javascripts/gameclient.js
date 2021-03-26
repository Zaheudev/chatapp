const client = new WebSocket("ws://localhost:8080");

function Message (type, data) {
    this.type = type;
    this.data = data;
}