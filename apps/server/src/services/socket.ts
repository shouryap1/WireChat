import { Server } from "socket.io";
import { pub, sub } from "../config/redis";

class SocketService {
    private _io: Server;

    constructor() {
        console.log("Init Socket Service...");
        this._io = new Server({
            cors: {
                allowedHeaders: ['*'],
                origin: '*'
            },
        });

        sub.subscribe('MESSAGES');
    }

    public initListeners() {
        const io = this.io;
        console.log("Initialize Socket Listeners....");

        io.on('connect', (socket) => {
            console.log(`New Socket Connected`, socket.id);

            socket.on('event:message', async ({ message }: { message: string }) => {
                console.log("New Message Received", message);
                await pub.publish('MESSAGES', JSON.stringify({ message }));
            });
        });

        sub.on('message', (channel, message) => {
            if (channel === 'MESSAGES') {
                console.log("New Message from Redis");
                io.emit('message', message);
            }
        });
    }

    get io() {
        return this._io;
    }
}

export default SocketService;
