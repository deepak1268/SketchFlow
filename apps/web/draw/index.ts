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
} | {
  type : "pencil",
  points : {x : number, y : number}[]
} | {
  type : "text",
  x : number,
  y : number,
  text : string 
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

  let currentPencilPoints : {x:number, y:number}[] = [];

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;

    if(window.selectedTool === Tool.pencil){
      currentPencilPoints = [{x:startX,y:startY}];
    }
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
      else if (window.selectedTool === Tool.pencil){
        currentPencilPoints.push({x:e.clientX,y:e.clientY});
        if(currentPencilPoints.length > 1){
          ctx.beginPath();
          ctx.moveTo(currentPencilPoints[0]?.x ?? 0,currentPencilPoints[0]?.y ?? 0);
          for(let i = 1; i < currentPencilPoints.length; i++){
            ctx.lineTo(currentPencilPoints[i]?.x ?? 0, currentPencilPoints[i]?.y ?? 0);
          }
          ctx.stroke();
        }
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
    else if(window.selectedTool === Tool.pencil){
      shape = {
        type : "pencil",
        points : currentPencilPoints
      };
      currentPencilPoints = [];
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

  canvas.addEventListener("dblclick", (e) => {
    if (window.selectedTool !== Tool.pointer) return;

    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    const textarea = document.createElement("textarea");

    textarea.value = "";
    textarea.style.position = "absolute";
    textarea.style.left = `${canvasRect.left + x}px`;
    textarea.style.top = `${canvasRect.top + y}px`;
    textarea.style.background = "transparent";
    textarea.style.color = "white";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.font = "16px Arial";
    textarea.style.lineHeight = "20px";
    textarea.style.padding = "0";
    textarea.style.margin = "0";
    textarea.style.resize = "none";
    textarea.style.overflow = "hidden";
    textarea.style.whiteSpace = "pre";
    textarea.style.minWidth = "2px";
    textarea.style.minHeight = "20px";
    textarea.style.zIndex = "1000";

    canvas.parentElement?.appendChild(textarea);
    textarea.focus();

    const adjustTextareaSize = () => {
      textarea.style.height = "auto";
      textarea.style.width = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.style.width = `${Math.max(100, textarea.scrollWidth)}px`;
    };

    adjustTextareaSize();

    textarea.addEventListener("input", adjustTextareaSize);

    let hasFinalized = false;

  const finalizeText = () => {
    if (hasFinalized) return;
    hasFinalized = true;

    const text = textarea.value;

    textarea.removeEventListener("input", adjustTextareaSize);
    document.removeEventListener("mousedown", handleOutsideClick, true);
    textarea.remove();

    if (!text.trim()) return;

    const shape: Shape = {
      type: "text",
      x,
      y,
      text,
    };

    existingShapes.push(shape);
    clearCanvas(canvas, ctx, existingShapes);

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId,
        message: JSON.stringify(shape),
      })
    );
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as Node;
    if (!textarea.contains(target)) {
      finalizeText();
    }
  };

  document.addEventListener("mousedown", handleOutsideClick, true);
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
    } else if(shape.type === "arrow"){
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
    } else if(shape.type === "pencil"){
      if (shape.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(shape.points[0]?.x ?? 0, shape.points[0]?.y ?? 0);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i]?.x ?? 0, shape.points[i]?.y ?? 0);
      }
      ctx.stroke();
    } else {
      ctx.font = "16px Arial";
      ctx.fillStyle = "white";
      ctx.textBaseline = "top";
      const lines = shape.text.split("\n");
      lines.forEach((line, index) => {
        ctx.fillText(line, shape.x, shape.y + index * 20);
      });
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