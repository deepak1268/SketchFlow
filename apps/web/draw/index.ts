import { BACKEND_URL } from "@/config";
import axios from "axios";
import { Tool } from "@/components/Canvas";

type Shape = {
  type: "rect";
  x: number;
  y: number;
  height: number;
  width: number;
} | {
  type : "circle",
  centerX : number,
  centerY : number,
  radiusX : number,
  radiusY : number, 
} | {
  type : "diamond",
  centerX : number,
  centerY : number,
  height : number,
  width : number,
} | {
  type : "line",
  startX : number,
  startY : number,
  endX : number,
  endY : number 
} | {
  type : "arrow",
  startX : number,
  startY : number,
  endX : number,
  endY : number
} | null;

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

  // @ts-ignore
  const selectedTool = window.selectedTool;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      const centerX = (startX + e.clientX) / 2;
      const centerY = (startY + e.clientY) / 2;
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(canvas, ctx,existingShapes);
      ctx.strokeStyle = "rgba(255,255,255)";
      if(window.selectedTool === Tool.rectangle){
        ctx.strokeRect(startX, startY, width, height);
      }
      else if(window.selectedTool === Tool.circle){
        ctx.beginPath();
        const radiusX = Math.abs(width / 2);
        const radiusY = Math.abs(height / 2);
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      else if(window.selectedTool === Tool.diamond){
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - height / 2); 
        ctx.lineTo(centerX + width / 2, centerY);
        ctx.lineTo(centerX, centerY + height / 2);
        ctx.lineTo(centerX - width / 2, centerY);
        ctx.closePath();
        ctx.stroke();
      }
      else if(window.selectedTool === Tool.arrow){
        const headLength = 10;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.lineTo(e.clientX - headLength * Math.cos(angle - Math.PI / 6),e.clientY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(e.clientX, e.clientY);
        ctx.lineTo(e.clientX - headLength * Math.cos(angle + Math.PI / 6),e.clientY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
      else if (window.selectedTool === Tool.line){
        ctx.beginPath();
        ctx.moveTo(startX,startY);
        ctx.lineTo(e.clientX,e.clientY);
        ctx.stroke();
      }
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    let shape : Shape = null;
    const centerX = (startX + e.clientX) / 2;
    const centerY = (startY + e.clientY) / 2;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    if(window.selectedTool === Tool.rectangle){
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height,
      };
    }
    else if(window.selectedTool === Tool.circle){
      shape = {
        type : "circle",
        centerX,
        centerY,
        radiusX : Math.abs(width/2),
        radiusY : Math.abs(height/2)
      }
    }
    else if(window.selectedTool === Tool.diamond){
      shape = {
        type : "diamond",
        centerX,
        centerY,
        height,
        width 
      }
    }
    else if(window.selectedTool === Tool.line){
      shape = {
        type : "line",
        startX,
        startY,
        endX : e.clientX,
        endY : e.clientY
      }
    }
    else if(window.selectedTool === Tool.arrow){
      shape = {
        type : "arrow",
        startX,
        startY,
        endX : e.clientX,
        endY : e.clientY
      }
    }
    if(shape === null) {
      return
    }
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
    ctx.strokeStyle = "rgba(255,255,255)";
    if(shape === null) return;
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
    else if (shape.type === "circle"){
      ctx.beginPath();
      ctx.ellipse(shape.centerX,shape.centerY,shape.radiusX,shape.radiusY,0,0,Math.PI * 2);
      ctx.stroke();
    }
    else if (shape.type === "diamond"){
      ctx.beginPath();
      ctx.moveTo(shape.centerX, shape.centerY - shape.height / 2); 
      ctx.lineTo(shape.centerX + shape.width / 2, shape.centerY); 
      ctx.lineTo(shape.centerX, shape.centerY + shape.height / 2);
      ctx.lineTo(shape.centerX - shape.width / 2, shape.centerY);
      ctx.closePath();
      ctx.stroke();
    }
    else if (shape.type === "line"){
      ctx.beginPath();
      ctx.moveTo(shape.startX,shape.startY);
      ctx.lineTo(shape.endX,shape.endY);
      ctx.stroke();
    } else {
      const headLength = 10;
      const dx = shape.endX - shape.startX;
      const dy = shape.endY - shape.startY;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(shape.startX,shape.startY);
      ctx.lineTo(shape.endX,shape.endY);
      ctx.lineTo(shape.endX - headLength * Math.cos(angle - Math.PI / 6),shape.endY - headLength * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - headLength * Math.cos(angle + Math.PI / 6),shape.endY - headLength * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
  });
}

async function getExistingShapes(roomId : number){
  try{
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`,{
      withCredentials : true
    });
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