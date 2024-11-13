import { Icon } from "@iconify/react/dist/iconify.js"
import { Fragment } from "react/jsx-runtime";

interface IIncomingCallProps {
    isShow: boolean
    onAccept: () => void
    onReject: () => void
}

function IncomingCall(props: IIncomingCallProps) {
    const {isShow, onAccept, onReject} = props;

    if(!isShow) {
        return <Fragment />
    }

    return (
        <div className="fixed h-[120px] w-[450px] w-5 bg-slate-50 p-5 z-50 shadow-md rounded-md top-5 right-5 flex justify-between">
            <div>
                <p className="text-slate-400">Có cuộc gọi đến</p>
                <h2 className="text-4xl mt-2">103</h2>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onAccept}
                    className='h-16 w-16 bg-green-100 flex justify-center items-center rounded-full shadow-md cursor-pointer'
                >
                    <Icon icon="line-md:phone-call-loop" color="#22c55e" fontSize="36px"/>
                </button>
                <button
                    onClick={onReject}
                    className='h-16 w-16 bg-rose-100 flex justify-center items-center rounded-full shadow-md cursor-pointer'
                >
                    <Icon icon="solar:end-call-outline" color="#ef4444" fontSize="36px"/>
                </button>
            </div>
        </div>
    )
}

export default IncomingCall