"use client"
import { Input } from "./Input"
import { Button } from "./Button"
import { useState } from "react"
import { Signup,Signin } from "@/lib/auth"
import { useRouter } from "next/navigation"



export default function AuthPage({signin} : {signin : boolean}) {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [username,setUsername] = useState("");
    const [loading,setLoading] = useState(false);
    const router = useRouter();

    async function handleSignup() {
        setLoading(true);
        try {
            const res = await Signup({username,email,password});
            alert("Signup Success")
            router.push("/signin");
        } catch (err) {
            alert("Some error occured");
            console.error(err);
        } finally{
            setLoading(false);
        }
    }

    async function handleSignin() {
        setLoading(true);
        try {
            const res = await Signin({email, password});
            const token = res.data.token;
            localStorage.setItem("authorization",token);
            alert("Signin success")
        } catch (err) {
            alert("some error occured")
            console.error(err);
        }
        finally{
            setLoading(false);
        }
    }


  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-[#111217]">
        <div className="flex flex-col justify-center items-center rounded-xl bg-neutral-800 px-8 py-6">
            <div className="font-bold text-2xl mb-10">
                Welcome to Excalidraw
            </div>
            <div className="flex flex-col gap-4 min-w-sm mb-8">
                {!signin ? <Input val={username} setVal={setUsername} label={"Username"} type={"username"} placeholder="Enter your username"></Input> : null} 
                <Input val={email} setVal={setEmail} label={"Email"} type={"email"} placeholder="Enter your email"></Input>
                <Input val={password} setVal={setPassword} label={"Password"} type={"password"} placeholder="Enter your password"></Input>
            </div>
            <Button disabled={loading} onClick={signin ? handleSignin : handleSignup}>
                {signin ? loading ? "Logging In" : "Login" : loading ? "Signing Up" : "Sign Up"}
            </Button>
        </div>
    </div>
  )
}
