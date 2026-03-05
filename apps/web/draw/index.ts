import { BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = {
  type: "rect";
  x: number;
  y: number;
  height: number;
  width: number;
};

export async function initDraw(canvas: HTMLCanvasElement,roomId : number,socket : WebSocket) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if(message.type === "chat"){
        const parsedShape = JSON.parse(message.message);
        existingShapes.push(parsedShape);
        clearCanvas(canvas,ctx,existingShapes);
    }
  }

  clearCanvas(canvas,ctx,existingShapes);
  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(canvas, ctx,existingShapes);
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(startX, startY, width, height);
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    const shape = {
      type: "rect" as const,
      x: startX,
      y: startY,
      width,
      height,
    };
    existingShapes.push(shape);
    clearCanvas(canvas, ctx,existingShapes);
    socket.send(JSON.stringify({
        type : "chat",
        roomId,
        message: JSON.stringify(shape)
    }));
    
  });
}

function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,existingShapes : Shape[]) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.forEach((shape) => {
    if (shape.type === "rect") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

async function getExistingShapes(roomId : number){
  try{
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages =  res.data.messages;
    const shapes = messages.map((x : {message : string}) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  })
  return shapes;
  } catch(err){
    console.error(err);
    return [];
  }
}