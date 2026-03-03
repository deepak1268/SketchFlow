import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
});
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
const wss = new WebSocketServer({port: 8080})

wss.on('connection',function connection(ws,request){
    const url = request.url;
    if(!url) return;
    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") as string;
    const decoded = jwt.verify(token,JWT_SECRET);
    if(!decoded || typeof decoded == "string" || !decoded.userId){
        ws.close();
        return;
    }

    ws.on('message',function message(data){
        ws.send('ping pong')
    })
})