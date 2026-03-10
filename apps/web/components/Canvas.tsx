import { useEffect, useRef, useState } from "react";
import TopBar from "./TopBar";
import Game from "@/draw/game";

export enum Tool {
    pointer,
    rectangle,
    circle,
    diamond,
    arrow,
    line,
    pencil
}

export default function Canvas({roomId,socket} : {roomId : number , socket: WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const [selectedTool,setSelectedTool] = useState<Tool>(Tool.pointer);

    useEffect(() => {
        if(!canvasRef.current) return;
        const game = new Game(canvasRef.current,roomId,socket);
        gameRef.current = game;

        async function intializeGame(){
            await game.init();
            game.initHandler();
            game.initMouseHandlers();
            game.setTool(selectedTool);
        }
        intializeGame();

        return () => {
            game.destroy();
        }
    },[roomId,socket])

    useEffect(() => {   
        if(!gameRef.current) return;
        gameRef.current.setTool(selectedTool);
    },[selectedTool]);

    return <div>
        <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
    </div>
}