import { ReactNode } from "react";

interface IButtonProps {
    children: ReactNode
    onClick: () => void
}

function Button(props: IButtonProps) {
    const {onClick, children} = props;
    return (
        <button
            type="button"
            className= "w-full py-2.5 px-5 me-2 my-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export default Button