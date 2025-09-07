import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import User from './models/user.js';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from 'socket.io';

//create express appp and http server
const app = express();
const server = http.createServer(app);

// intilaize socked server
export const io = new Server(server,{
    cors: {origin: "*"}
})

//store online users
export const userSocketMap = {} //user id and socket id

//socket io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //exit online user to  client
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })

})


//middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors({
  origin:  process.env.FRONTEND_URL,
  credentials: true
}));


//Route setup

app.use("/api/status" , (req,res)=> res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);


//connect to mongodb
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=> console.log("Server is running on PORT:"
    + PORT)
);