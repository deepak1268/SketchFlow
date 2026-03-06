import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import TopBar from "./TopBar";

export enum Tool {
    pointer,
    rectangle,
    circle,
    diamond,
    arrow,
    line
}

export default function Canvas({roomId,socket} : {roomId : number , socket: WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool,setSelectedTool] = useState<Tool>(Tool.pointer);

    useEffect(() => {
        if(canvasRef.current) initDraw(canvasRef.current,roomId,socket);
    },[])

    // this is the ugly way of doing it as you changing the window object => will be later replaced by the game class (better method)
    useEffect(() => {   
        // @ts-ignore 
        window.selectedTool = selectedTool;
    },[selectedTool]);

    return <div>
        <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
    </div>
}