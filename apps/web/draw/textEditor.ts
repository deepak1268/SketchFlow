type CreateTextEditorArgs = {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  onSubmit: (text: string) => void;
};

export function createTextEditor({
  canvas,
  x,
  y,
  onSubmit,
}: CreateTextEditorArgs) {
  const canvasRect = canvas.getBoundingClientRect();
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

    onSubmit(text);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as Node;
    if (!textarea.contains(target)) {
      finalizeText();
    }
  };

  document.addEventListener("mousedown", handleOutsideClick, true);
}