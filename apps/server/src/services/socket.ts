import { Server } from "socket.io";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DB) || 0,
  password: process.env.REDIS_PASSWORD || "your_redis_password",
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

class SocketService {
  private _io: Server;
  private static _instance: SocketService;

  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    // Subscribe to Redis channel
    sub.subscribe("MESSAGES");
  }

  public static get instance(): SocketService {
    if (!SocketService._instance) {
      SocketService._instance = new SocketService();
    }
    return SocketService._instance;
  }

  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners...");

    io.on("connection", (socket) => {
      console.log(`New Socket Connected`, socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Received:", message);

        // Publish message to Redis
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    // Listen to Redis channel
    sub.on("message", async (channel: string, message: string) => {
      if (channel === "MESSAGES") {
        console.log("New message from Redis:", message);

        // Emit to all connected sockets
        io.emit("message", JSON.parse(message));
      }
    });
  }

  get io() {
    return this._io;
  }

  public static get io() {
    return SocketService.instance.io;
  }

  public static initListeners() {
    return SocketService.instance.initListeners();
  }
}

export default SocketService;
