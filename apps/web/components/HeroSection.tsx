"use client";
import { MoveRightIcon } from "lucide-react";
import Image from "next/image";
import heroImage from "@/public/heroImage.png";

export default function HeroSection() {
  return (

    <div className="flex flex-col justify-center items-center mt-20">

      <div className="font-bold text-7xl text-white leading-tight tracking-tight">
        Sketch your ideas
      </div>
      <span className="font-bold text-7xl text-[#4870eb] leading-tight tracking-tight drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] mb-5">
        together
      </span>

      <p className="text-lg text-center font-medium text-slate-400 max-w-xl mx-auto mb-10">
        A collaborative whiteboard tool that lets you sketch diagrams,
        wireframes, and anything else — with a hand-drawn feel.
      </p>

      <div className="flex items-center justify-center gap-4 mb-18">
        <button
          className="text-black bg-[#4870eb] flex justify-center items-center gap-2 px-6 py-4 rounded-xl cursor-pointer hover:opacity-90"
          onClick={() => console.log("heelo")}
        >
          <span className="text-lg font-semibold ">Open Canvas</span>
          <MoveRightIcon />
        </button>
        <a
          href="https://github.com/deepak1268/Excalidraw"
          target="_blank"
          className="text-white text-lg font-semibold cursor-pointer px-6 py-4 rounded-xl bg-[#232630] hover:opacity-90"
        >
          View on Github
        </a>
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* glow background */}
        <div className="absolute -inset-4 rounded-2xl bg-[hsl(225_80%_60%/0.05)] blur-3xl" />
        {/* image container */}
        <div className="relative rounded-xl border border-[hsl(230_12%_20%)] overflow-hidden shadow-[0_0_40px_-10px_rgba(96,124,255,0.4)]">
          <Image
          src={heroImage}
          alt="Drawboard canvas interface showing collaborative drawing tools"
          className="w-full"
        />
        </div>
      </div>

    </div>
  );
}
