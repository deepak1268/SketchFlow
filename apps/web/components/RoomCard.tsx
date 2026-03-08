"use client"
import { Room } from "./DashBoard";
import { Trash2,ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoomCard({room,deleteRoom} : {
    room : Room
    deleteRoom(roomName : string) : Promise<void>
}) {

    const router = useRouter();

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-gray-800 bg-[#1a1b24] p-4 group hover:border-[#4870eb]/40 transition-colors min-w-sm"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#E5E9F0] truncate">
          {room.slug}
        </p>
        <p className="text-xs font-medium text-[#838A96] mt-1">
          {new Date(room.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-1 ml-3 shrink-0">
        <button
          className="text-center p-2 rounded-lg text-[#838A96] hover:text-[#EF4444] hover:bg-[#6a52e1] cursor-pointer"
          onClick={() => deleteRoom(room.slug)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          className="text-center p-2 rounded-lg text-[#838A96] hover:text-[#4870eb] hover:bg-[#6a52e1] cursor-pointer"
          onClick={() => router.push(`/canvas/${room.slug}`)}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
