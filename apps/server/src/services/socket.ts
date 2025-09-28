import { Server, Socket } from "socket.io";

class SocketService {
    private _io: Server;
    
    constructor() {
        console.log("Socket Service Initialized");
        this._io = new Server();
    }

    public initListeners() {
        console.log("Socket Listeners Initialized");
        this._io.on("connection", (socket: Socket) => {
            console.log("New socket connected", socket.id);

            socket.on("event:message", async ({message}: {message: string}) => {
                console.log("New message received", message);
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected", socket.id);
            });
        });
    }

    get io() {
        return this._io;
    }
}

export default new SocketService();