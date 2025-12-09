import http from "http";
import SocketService from './services/socket.js';
import { startMessageConsumer } from './services/kafka.js';

async function init(){

    // const socketService =  new SocketService();
    const httpServer = http.createServer();
    const port = process.env.port ? process.env.port : 8000;

    SocketService.io.attach(httpServer)

    httpServer.listen(port, () => console.log(`HTTP Server started at port : ${port}`));
    SocketService.initListeners();

    // Start Kafka consumer
    try {
        await startMessageConsumer();
        console.log("Kafka consumer started successfully");
    } catch (error) {
        console.error("Failed to start Kafka consumer:", error);
    }

}



init();

