"use client"

import { WS_URL } from "@/config";
import { useEffect, useState } from "react"
import Canvas from "./Canvas";

// this component is only being used to make the websocket connetion first. After the connection being made only the canvas will be displayed.
export default function RoomCanavas({roomId} : {roomId: number}){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    
    // on mount the ws connection is made
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}`);

        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type : "join-room",
                roomId
            }))
        }
    },[])

    if(socket===null){
        return <div className="flex justify-center items-center text-white text-4xl font-bold">
            Connecting to server...
        </div>
    }

    return <Canvas roomId={roomId} socket={socket}/>    
}