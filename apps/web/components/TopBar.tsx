import {
  MousePointerIcon,
  RectangleHorizontalIcon,
  CircleIcon,
  ArrowRightIcon,
  MinusIcon,
  DiamondIcon,
  PencilIcon
} from "lucide-react";
import { ReactNode, SetStateAction, Dispatch } from "react";
import { Tool } from "./Canvas";

function ToolButton({
  children,
  onClick,
  activated
}: {
  children: ReactNode;
  onClick: () => void;
  activated: boolean
}) {
  return (
    <button
      className={`p-2 rounded-md  cursor-pointer ${activated ? "bg-[#4870eb]" : "hover:bg-gray-900"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function TopBar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: Dispatch<SetStateAction<Tool>>;
}) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 flex justify-center items-center bg-gray-800 text-neutral-400 px-2 py-1 gap-2 rounded-xl">
      <ToolButton onClick={() => setSelectedTool(Tool.pointer)} activated={selectedTool===Tool.pointer}>
        <MousePointerIcon />
      </ToolButton>
      <ToolButton onClick={() => setSelectedTool(Tool.rectangle)} activated={selectedTool===Tool.rectangle}>
        <RectangleHorizontalIcon />
      </ToolButton>
      <ToolButton onClick={() => setSelectedTool(Tool.circle)} activated={selectedTool===Tool.circle}>
        <CircleIcon />
      </ToolButton>
      <ToolButton onClick={() => setSelectedTool(Tool.diamond)} activated={selectedTool===Tool.diamond}>
        <DiamondIcon />
      </ToolButton>
      <ToolButton onClick={() => setSelectedTool(Tool.arrow)} activated={selectedTool===Tool.arrow}>
        <ArrowRightIcon />
      </ToolButton>
      <ToolButton onClick={() => setSelectedTool(Tool.line)} activated={selectedTool===Tool.line}>
        <MinusIcon />
      </ToolButton>
      <ToolButton onClick={() => setSelectedTool(Tool.pencil)} activated={selectedTool===Tool.pencil}>
        <PencilIcon />
      </ToolButton>
    </div>
  );
}
