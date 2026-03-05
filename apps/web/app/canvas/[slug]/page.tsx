import { BACKEND_URL } from "@/config";
import axios from "axios";
import RoomCanavas from "@/components/RoomCanvas";

export default async function CanvasPage({params} : {
    params : {
        slug : string
    }
}) {
    const { slug } = await params;
    let roomId : number;
    // now you need to hit the backend to get the roomId for the current room-name
    try{
        const res = await axios.get(`${BACKEND_URL}/room/${slug}`);
        roomId = Number(res.data.room.id);
    } catch(err) {
        console.error(err);
        alert('Some error occured')
        throw new Error("Room fetch failed");
    }

    return <div>
        <RoomCanavas roomId={roomId}/>
    </div>
} 