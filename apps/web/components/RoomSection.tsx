"use client";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { Input } from "./Input";
import { Button2 } from "./Button";

export default function RoomSection({
  icon,
  title,
  description,
  val,
  setVal,
  executeFunction,
  loading
}: {
  icon: ReactNode;
  title: string;
  description: string;
  val: string;
  setVal: Dispatch<SetStateAction<string>>;
  executeFunction: () => void;
  loading : boolean
}) {
  return (
    <div className="bg-[#191b24] flex flex-col justify-center px-8 py-6 rounded-xl">
      <div className="flex items-center gap-2">
        <div className="text-[#4870eb]">{icon}</div>
        <div className="font-bold text-xl">{title}</div>
      </div>
      <div className="mt-1 mb-6 text-neutral-400">{description}</div>
      <Input
        label="Room Name"
        type="text"
        placeholder="Enter room name"
        val={val}
        setVal={setVal}
      />
      <br />
      <Button2 icon={icon} onClick={executeFunction} disabled={loading}>
        {title}
      </Button2>
    </div>
  );
}
