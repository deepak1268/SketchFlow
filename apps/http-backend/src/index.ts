import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), "../../.env"),
});
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createRoomSchema,createUserSchema,signinSchema } from "@repo/common/schema";
import { Prisma,prismaClient } from "@repo/db/client";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./middleware/auth";

const app = express();
app.use(express.json())

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
      );
      return res.json({
        token,
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
    return res.status(200).json({
        message: "Room created successfully."
    })
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

app.listen(3001);
