import { ReactNode } from "react"

interface ButtonProps{
    children: ReactNode;
    onClick: () => void;
    disabled: boolean;
}

export function Button({children,onClick,disabled} : ButtonProps){
    return( 
        <button 
        disabled={disabled}
            className="bg-[#4870eb] rounded-xl px-4 py-2 text-black font-medium cursor-pointer w-full"
            onClick={onClick}
        >
            {children}
        </button>
    )
} 

export function Button2({icon,children,onClick,disabled} : {
    icon : ReactNode,
    children : ReactNode
    onClick : () => void
    disabled : boolean
}){
    return (
        <button className="flex justify-center items-center gap-2 font-medium bg-[#4870eb] text-black p-3 rounded-xl cursor-pointer" onClick={onClick} disabled={disabled}>
            <div>{icon}</div>
            <div>{children}</div>
        </button>
    )
}