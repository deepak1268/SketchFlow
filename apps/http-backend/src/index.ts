import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
});
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import { createRoomSchema,createUserSchema,signinSchema } from "@repo/common/schema";
import { Prisma,prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middleware/auth";
import cookieParser from "cookie-parser"

const app = express();
app.use(express.json())
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000","https://sketchflow-wine.vercel.app"],
    credentials : true
  })
);

app.post("/signup", async (req, res) => {
  const parsedData = createUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(400).send(parsedData.error);
  }
  const { email, password, username } = parsedData.data;
  try {
    const hashedPass = await bcrypt.hash(password, 8);
    await prismaClient.user.create({
      data: {
        email,
        password: hashedPass,
        username,
      },
    });
    return res.status(200).json({
      message: "Signup Successful",
    });
  } catch (err) {
    console.error(err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = err.meta?.target;
      if (Array.isArray(target)) {
        const field = target[0];

        if (field === "email") {
          return res.status(409).json({
            message: "Email is already registered",
          });
        }
        if (field === "username") {
          return res.status(409).json({
            message: "Username is already taken",
          });
        }
      }
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = signinSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(400).send(parsedData.error);
  }
  const { username, email, password } = parsedData.data;
  try {
    const user = username
      ? await prismaClient.user.findUnique({
          where: {
            username,
          },
        })
      : await prismaClient.user.findUnique({
          where: {
            email,
          },
        });
    if (!user) {
      if (username) {
        return res.status(404).json({
          message: "User with this username does not exist.",
        });
      } else {
        return res.status(404).json({
          message: "User with this email does not exist.",
        });
      }
    }
    const validUser = await bcrypt.compare(password, user.password);
    if (validUser) {
      const token = jwt.sign(
        {
          userId: user.id,
        },
        JWT_SECRET,
        {expiresIn : "7d"}
      );
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
      });
      return res.status(200).json({
        message : "Login successful"
      });
    } else
      return res.status(404).json({
        message: "Invalid credentials",
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/create-room",authMiddleware ,async (req, res) => {
  const parsedData = createRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(400).send(parsedData.error);
  }
  const {name} = parsedData.data;
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: name,
        adminId: req.userId,
      },
    });
    return res.status(200).json(room);
  } catch (err) {
    console.error(err);
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(409).json({
        message: "Room with this name already exists.",
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/chats/:roomId", authMiddleware , async (req,res) => {
  const roomId : number = Number(req.params.roomId);
  try{
    const messages = await prismaClient.chat.findMany({
      where : {
        roomId
      },
      orderBy : {
        id: "desc"
      },
      take :1000
    });
    res.status(200).json({messages});
  } catch(err){
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
})

app.get("/room/:slug", async (req,res) => {
  const slug = req.params.slug;
  try{
    const room = await prismaClient.room.findFirst({
      where: {
        slug
      }
    });
    return res.status(200).json({room});
  } catch(err){
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
})

app.get("/userRoom", authMiddleware , async (req,res) => {
  const adminId = req.userId;
  try{
    const rooms = await prismaClient.room.findMany({
      where : {
        adminId
      }
    });
    res.status(200).json(rooms);
  } catch(err){
    console.error(err);
    res.status(500).json({
      message : "Internal Server Error"
    })
  }
})

app.delete("/deleteRoom",authMiddleware,async (req,res) => {
  const slug = req.body.roomName;
  try{
    await prismaClient.room.delete({
      where : {
        slug
      }
    })
    res.status(200).json({
      message: "room deleted"
    })
  } catch(err){
    console.error(err);
    res.status(500).json({
      message : "Internal Server Error"
    })
  }
})

app.post("/logout", (req,res) => {
  res.clearCookie("token");
  res.json({
    message : "Logout Successful"
  })
})

app.get("/check-auth",(req,res) => {
  const token = req.cookies.token;
  if(!token){
    return res.json({
      authenticated : false
    });
  }
  try{
    const decoded = jwt.verify(token,JWT_SECRET)
    if(typeof decoded == "string" || !decoded.userId){
      return res.status(200).json({
        authenticated : false
      });
    }
    return res.status(200).json({
      authenticated : true
    })
  } catch(err){
    return res.status(401).json({
      authenticated : false
    });
  }
})

app.listen(3001);