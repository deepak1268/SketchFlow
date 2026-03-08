"use client"
import { useEffect, useState } from "react"
import Navbar from "./Navbar"
import RoomSection from "./RoomSection"
import { PlusIcon,LogInIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { BACKEND_URL } from "@/config"
import { Trash2,ArrowRight } from "lucide-react"
import RoomCard from "./RoomCard"

export interface Room {
    id : number,
    slug : string,
    createdAt : string,
}

export default function Dashboard(){
    
    const [myRooms,setMyRooms] = useState<Room[]>([]);
    const [createRoomName,setCreateRoomName] = useState("");
    const [enterRoomName,setEnterRoomName] = useState("");
    const [loading,setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // when the page loads we need to fetch all the existing rooms of the user
        try{
            async function getRooms(){
                const token = localStorage.getItem("authorization");
                console.log(`${BACKEND_URL}/userRoom`);
                const res = await axios.get(`${BACKEND_URL}/userRoom`,{
                    headers : {
                        "authorization" : token
                    }
                });
                setMyRooms(res.data);
            }
            getRooms();
        } catch(err){
            console.error(err)
            alert("some error occured")
        }
    },[])

    async function createRoom(){
      try{
        setLoading(true);
        const token = localStorage.getItem("authorization");
        const res = await axios.post(`${BACKEND_URL}/create-room`,
          {
            name : createRoomName
          },
          {
            headers : {
              "authorization" : token
            }
          }
        )
        setMyRooms(prev => [...prev, res.data]);
        setCreateRoomName("");
        alert("Room created.");
      } catch(err){
        console.error(err);
        alert("error occured while creating room")
      } finally{
        setLoading(false);
      }
    }
    
    async function handleDeleteRoom(roomName : string){
      try{
        const token = localStorage.getItem("authorization");
        await axios.delete(`${BACKEND_URL}/deleteRoom`,{
          data:{
            roomName
          },
          headers:{
            "authorization" : token
          }
        })
        setMyRooms(prev => prev.filter(room => room.slug !== roomName));
        alert("Room deleted");
      } catch(err){
        console.error(err);
        alert("error occured while deleting room")
      }
    }  

    return <div className="min-h-screen w-screen bg-[#111217]">

        <Navbar />
        
        <div className="flex flex-col justify-center items-center py-14">

            <div>
                <h1 className="text-3xl font-bold leading-tight tracking-tight mb-2">Dashboard</h1>
                <p className="font-medium text-neutral-400">Create a new room or join an existing one to start collaborating.</p>
                <div className="flex mt-10 gap-6">
                    <RoomSection
                        icon={<PlusIcon />}
                        title="Create Room"
                        description="Start a new drawing room and invite others."
                        val={createRoomName}
                        setVal={setCreateRoomName}
                        executeFunction={createRoom}
                        loading={loading}
                    />
                    <RoomSection 
                        icon={<LogInIcon />}
                        title="Join Room"
                        description="Enter a room name to join an existing session."
                        val={enterRoomName}
                        setVal={setEnterRoomName}
                        executeFunction={() => router.push(`/canvas/${enterRoomName}`)}
                        loading={loading}
                    />
                </div>
            </div>

            {myRooms.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[#E5E9F0] mb-4">Your Rooms</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {myRooms.map((room) => (
                <RoomCard room={room} deleteRoom={handleDeleteRoom} key={room.slug}/>
              ))}
            </div>
          </div>
        )}

        </div>

        
        
    </div>
}