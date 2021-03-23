const express = require('express');
const http = require("http");
const ws = require("ws");
const indexRouter = require("./routes/index");

const port = process.argv[2];
const app = express();  

const wsServer = new ws.Server({port:8080});

app.get("/", indexRouter);
app.get("/room", indexRouter);


http.createServer(app).listen(port);
console.log("Server started on port " + port);