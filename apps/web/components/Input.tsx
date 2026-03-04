import { SetStateAction,Dispatch } from "react";

interface InputProps {
  placeholder: string;
  label: string;
  type: string;
  val: string;
  setVal: Dispatch<SetStateAction<string>>;
}

export function Input({ placeholder,label,type,val,setVal}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={type} className="font-semibold">
        {label}
      </label>

      <input
        id={type}
        type={type}
        placeholder={placeholder}
        value={val}
        className="bg-neutral-700 border-none rounded-md px-3 py-2"
        onChange={(e)=> setVal(e.target.value)}
      />
    </div>
  );
}
