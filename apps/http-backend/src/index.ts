import express from "express"
import {createRoomSchema, createUserSchema, signinSchema} from "@repo/common/schema"

const app = express();

app.post("/signup",async (req,res) => {
    const data = createUserSchema.safeParse(req.body)
    if(!data.success){
        console.log(data.error);
        return res.status(404).send(data.error)
    }
    
})

app.post("/signin",async (req,res) => {
    const data = signinSchema.safeParse(req.body)
    if(!data.success){
        console.log(data.error);
        return res.status(404).send(data.error)
    }
})

app.post("/create-room",async (req,res) => {
    const data = createRoomSchema.safeParse(req.body)
    if(!data.success){
        console.log(data.error);
        return res.status(404).send(data.error)
    }
})

app.listen(3001)