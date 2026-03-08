"use client"
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";

export default function Navbar(){
    
    const router = useRouter();
    const[auth,setAuth] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkAuth(){
            try{
                const res = await axios.get(`${BACKEND_URL}/check-auth`,{
                    withCredentials : true
                })
                setAuth(res.data.authenticated);
            } catch(err){
                setAuth(false);
            }
        }
        checkAuth();
    },[])

    async function logout(){
        try{
            await axios.post(`${BACKEND_URL}/logout`,{},{
                withCredentials : true
            });
            setAuth(false);
            router.push("/");
        } catch(err){
            console.error(err)
            alert("Logout failed")
        }
    } 

    return(
        <div className="sticky top-0 z-50 flex justify-between px-14 py-6 border-b border-slate-800 bg-[#111217]">
            <div className="flex items-center justify-center gap-3">
                <div className="bg-[#4870eb] p-2 rounded-xl cursor-pointer" onClick={() => router.push("/")}>
                    <Pencil color="black"/>
                </div>
                <div className="font-bold text-2xl cursor-pointer" onClick={() => router.push("/")}>
                    Excalidraw
                </div>
            </div>
            {auth==false && <div className="flex items-center justify-center gap-3 font-semibold">
                <button
                    className="hover:opacity-90 cursor-pointer"
                    onClick={() => router.push("/signup")}
                >
                    Sign Up
                </button>
                <button 
                    className="bg-[#4870eb] text-black px-5 py-2 rounded-xl cursor-pointer hover:opacity-90"
                    onClick={() => router.push("/signin")}
                >
                    Log In
                </button>
            </div>}
            {auth && <button className="bg-[#4870eb] text-black px-5 py-2 rounded-xl cursor-pointer hover:opacity-90 font-semibold" onClick={logout}>
                Log Out
            </button>}
        </div>
    )
} 