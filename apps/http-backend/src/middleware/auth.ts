import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { Request,Response,NextFunction } from "express";

export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const token = req.headers["authorization"] || "";
    const decoded = jwt.verify(token,JWT_SECRET)
    if(typeof decoded == "string" || !decoded.userId){
        res.status(200).json({
            message: "Please login"
        })
    }
    else {
        // @ts-ignore
        req.userId = decoded.userId
        next()
    }
}