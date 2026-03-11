import { Shape } from "@/types/shapes";

export function clearCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  existingShapes: Shape[],
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.forEach((shape) => {
    ctx.strokeStyle = "rgba(255,255,255)";
    if (shape === null) return;
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.ellipse(
        shape.centerX,
        shape.centerY,
        shape.radiusX,
        shape.radiusY,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    } else if (shape.type === "diamond") {
      ctx.beginPath();
      ctx.moveTo(shape.centerX, shape.centerY - shape.height / 2);
      ctx.lineTo(shape.centerX + shape.width / 2, shape.centerY);
      ctx.lineTo(shape.centerX, shape.centerY + shape.height / 2);
      ctx.lineTo(shape.centerX - shape.width / 2, shape.centerY);
      ctx.closePath();
      ctx.stroke();
    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
    } else if (shape.type === "arrow") {
      const headLength = 10;
      const dx = shape.endX - shape.startX;
      const dy = shape.endY - shape.startY;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.lineTo(
        shape.endX - headLength * Math.cos(angle - Math.PI / 6),
        shape.endY - headLength * Math.sin(angle - Math.PI / 6),
      );
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(
        shape.endX - headLength * Math.cos(angle + Math.PI / 6),
        shape.endY - headLength * Math.sin(angle + Math.PI / 6),
      );
      ctx.stroke();
    } else if (shape.type === "pencil") {
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
      const lines = (shape.text ?? "").split("\n");
      lines.forEach((line, index) => {
        ctx.fillText(line, shape.x, shape.y + index * 20);
      });
    }
  });
}

export function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.strokeStyle = "white";
  if(!shape) return;
  switch (shape.type) {
    case "rect":
      drawRectangle(ctx, shape);
      break;

    case "circle":
      drawCircle(ctx, shape);
      break;

    case "diamond":
      drawDiamond(ctx, shape);
      break;

    case "line":
      drawLine(ctx, shape);
      break;

    case "arrow":
      drawArrow(ctx, shape);
      break;

    case "pencil":
      drawPencil(ctx, shape);
      break;

    case "text":
      drawText(ctx, shape);
      break;
  }
}

function drawRectangle(
  ctx: CanvasRenderingContext2D,
  shape: Extract<Shape, { type: "rect" }>,
) {
  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  shape: Extract<Shape, { type: "circle" }>,
) {
  ctx.beginPath();
  ctx.ellipse(
    shape.centerX,
    shape.centerY,
    shape.radiusX,
    shape.radiusY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  shape: Extract<Shape, { type: "diamond" }>,
) {
  ctx.beginPath();
  ctx.moveTo(shape.centerX, shape.centerY - shape.height / 2);
  ctx.lineTo(shape.centerX + shape.width / 2, shape.centerY);
  ctx.lineTo(shape.centerX, shape.centerY + shape.height / 2);
  ctx.lineTo(shape.centerX - shape.width / 2, shape.centerY);
  ctx.closePath();
  ctx.stroke();
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  shape: Extract<Shape, { type: "line" }>,
) {
  ctx.beginPath();
  ctx.moveTo(shape.startX, shape.startY);
  ctx.lineTo(shape.endX, shape.endY);
  ctx.stroke();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  shape: Extract<Shape, { type: "arrow" }>,
) {
  const headLength = 10;
  const dx = shape.endX - shape.startX;
  const dy = shape.endY - shape.startY;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(shape.startX, shape.startY);
  ctx.lineTo(shape.endX, shape.endY);
  ctx.lineTo(
    shape.endX - headLength * Math.cos(angle - Math.PI / 6),
    shape.endY - headLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(shape.endX, shape.endY);
  ctx.lineTo(
    shape.endX - headLength * Math.cos(angle + Math.PI / 6),
    shape.endY - headLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

function drawPencil(
  ctx: CanvasRenderingContext2D,
  shape: Extract<Shape, { type: "pencil" }>,
) {
  if (shape.points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(shape.points[0]?.x ?? 0, shape.points[0]?.y ?? 0);
  for (let i = 1; i < shape.points.length; i++) {
    ctx.lineTo(shape.points[i]?.x ?? 0, shape.points[i]?.y ?? 0);
  }
  ctx.stroke();
}

function drawText(
  ctx: CanvasRenderingContext2D,
  shape: Extract<Shape, { type: "text" }>,
) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.textBaseline = "top";

  const lineHeight = 20;
  const lines = (shape.text ?? "").split("\n");

  lines.forEach((line, index) => {
    ctx.fillText(line, shape.x, shape.y + index * lineHeight);
  });
}
