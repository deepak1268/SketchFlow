import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { Request,Response,NextFunction } from "express";

export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message : "unathourised"
        })
    }
    try{
        const decoded = jwt.verify(token,JWT_SECRET)
        if(typeof decoded == "string" || !decoded.userId){
            return res.status(200).json({
                message: "Please login"
            });
        }
        else {
            req.userId = decoded.userId
            next()
        }
    } catch(err){
        return res.status(401).json({
            message : "Invalid Token"
        });
    }
}