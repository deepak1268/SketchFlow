import axios from "axios";
import { BACKEND_URL } from "@/config";

export async function Signup({username,email,password}:{username:string,email:string,password:string}){
    return axios.post(`${BACKEND_URL}/signup`,{
        username,
        email,
        password
    })
}

export async function Signin({email,password}:{email:string,password:string}){
    return axios.post(`${BACKEND_URL}/signin`,{
        email,
        password
    },{
        withCredentials : true
    })
}