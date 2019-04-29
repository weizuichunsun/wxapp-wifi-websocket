
// 请使用 npm install 命令
const http = require("http");
const WebSocketServer = require("websocket").server;

const httpServer = http.createServer((request, response) => {
  console.log("[" + new Date() + "] Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

const wsServer = new WebSocketServer({
  httpServer,
  autoAcceptConnections: true
});


const formatTime = (date) => {

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');

}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

wsServer.on("connect", connection => {
  connection
    .on("message", message => {
      if (message.type === "utf8") {
        console.log(">> message content from client: " + message.utf8Data);
        // connection.sendUTF("[from server] " + message.utf8Data);

        try {
          if (parseInt(message.utf8Data)) {
            var date = formatTime(new Date(parseInt(message.utf8Data)));
          }
          else {
            date = "";
          }
          var value = {
            date: date,
            status: 1
          };
        } catch (e) {
          var date = "";
          var value = {
            date: message.utf8Data,
            status: 0
          };
        }


        value = JSON.stringify(value);
        console.log(">> value: " + value);

        connection.sendUTF(value);
      }
    })
    .on("close", (reasonCode, description) => {
      console.log(
        "[" +
        new Date() +
        "] Peer " +
        connection.remoteAddress +
        " disconnected."
      );
    });
});

httpServer.listen(8000, () => {
  console.log("[" + new Date() + "] Serveris listening on port 8000");
});
