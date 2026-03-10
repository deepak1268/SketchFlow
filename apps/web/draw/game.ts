import { getExistingShapes } from "@/lib/api";
import { Shape } from "@/types/shapes";
import { clearCanvas, drawShape } from "./render";
import { Tool } from "@/components/Canvas";
import { createTextEditor } from "./textEditor";

export default class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: number;
  private selectedTool: Tool = Tool.pointer;
  private clicked: boolean = false;
  private startX = 0;
  private startY = 0;
  private currentPencilPoints: { x: number; y: number }[] = [];
  private socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.existingShapes = [];
    this.socket = socket;
  }

  setTool(tool : Tool){
    this.selectedTool = tool;
  }

  destroy(){
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("dblclick", this.doubleClickHandler);
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    clearCanvas(this.canvas, this.ctx, this.existingShapes);
  }

  initHandler() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape);
        clearCanvas(this.canvas, this.ctx, this.existingShapes);
      }
    };
  }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("dblclick", this.doubleClickHandler);
  }

  getPreviewShape = (e: MouseEvent): Shape | null => {
    const centerX = (this.startX + e.clientX) / 2;
    const centerY = (this.startY + e.clientY) / 2;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    const selectedTool = this.selectedTool;

    if (selectedTool === Tool.rectangle) {
      return {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (selectedTool === Tool.circle) {
      return {
        type: "circle",
        centerX,
        centerY,
        radiusX: Math.abs(width / 2),
        radiusY: Math.abs(height / 2),
      };
    } else if (selectedTool === Tool.diamond) {
      return {
        type: "diamond",
        centerX,
        centerY,
        height,
        width,
      };
    } else if (selectedTool === Tool.line) {
      return {
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
    } else if (selectedTool === Tool.arrow) {
      return {
        type: "arrow",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
    } else if (selectedTool === Tool.pencil) {
      return {
        type: "pencil",
        points: this.currentPencilPoints,
      };
    }
    return null;
  };

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    const selectedTool = this.selectedTool;
    if (selectedTool === Tool.pencil) {
      this.currentPencilPoints = [{ x: this.startX, y: this.startY }];
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;
    if (this.selectedTool === Tool.pencil) {
      this.currentPencilPoints.push({ x: e.clientX, y: e.clientY });
    }
    clearCanvas(this.canvas, this.ctx, this.existingShapes);
    const previewShape = this.getPreviewShape(e);
    if (previewShape) {
      drawShape(this.ctx, previewShape);
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const previewShape = this.getPreviewShape(e);
    if (previewShape) {
      if (previewShape.type === "pencil") {
        this.currentPencilPoints = [];
      }
      this.existingShapes.push(previewShape);
      clearCanvas(this.canvas, this.ctx, this.existingShapes);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          roomId: this.roomId,
          message: JSON.stringify(previewShape),
        }),
      );
    }
  };

  doubleClickHandler = (e: MouseEvent) => {
    if (this.selectedTool !== Tool.pointer) return;

    const canvasRect = this.canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    createTextEditor({
      canvas: this.canvas,
      x,
      y,
      onSubmit: (text) => {
        const shape: Shape = {
          type: "text",
          x,
          y,
          text,
        };

        this.existingShapes.push(shape);
        clearCanvas(this.canvas, this.ctx, this.existingShapes);

        this.socket.send(
          JSON.stringify({
            type: "chat",
            roomId: this.roomId,
            message: JSON.stringify(shape),
          }),
        );
      },
    });

  };

}