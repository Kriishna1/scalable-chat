import http from "http";
import SocketService from './services/socket.js';

async function init(){

    // const socketService =  new SocketService();
    const httpServer = http.createServer();
    const port = process.env.port ? process.env.port : 8000;

    SocketService.io.attach(httpServer)

    httpServer.listen(port, () => console.log(`HTTP Server started at port : ${port}`));

}



init();

