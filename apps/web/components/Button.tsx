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
            className="bg-teal-500 rounded-xl w-40 px-4 py-2 text-black font-semibold cursor-pointer"
            onClick={onClick}
        >
            {children}
        </button>
    )
} 