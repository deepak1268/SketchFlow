import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
});
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: number;
  rooms: number[];
  ws: WebSocket;
}

const users: User[] = [];

function checkUser(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string" || !decoded || !decoded.userId) return null;
    return Number(decoded.userId);
  } catch (e) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) return;
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") as string;
  const userId = checkUser(token);
  if (userId == null) {
    ws.close();
    return;
  }

  const user: User = {
    userId,
    rooms: [],
    ws,
  };

  users.push(user);

  ws.on("message", async function message(data) {
    // the above data can either be string or binary data
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }
    const type: string = parsedData.type;
    const roomId: number = parsedData.roomId;
    if (type === "join-room" && !user.rooms.includes(roomId)) {
      user.rooms.push(roomId);
    } else if (type === "leave-room") {
      user.rooms = user.rooms.filter((room) => room !== roomId);
    } else {
      // THIS CAN BE IMPROVED BY USING A MESSAGE QUEUE
      const message: string = parsedData.message;
      await prismaClient.chat.create({
        data: {
          roomId,
          userId,
          message,
        },
      });
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            }),
          );
        }
      });
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((user) => user.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
});
