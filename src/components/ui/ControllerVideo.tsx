import { Icon } from '@iconify/react';

interface IControllerVideoProps {
    endCall: () => void
}

function ControllerVideo(props: IControllerVideoProps) {
    const {endCall} = props;

    return (
        <div className="absolute bottom-14">
            <button
                className='h-20 w-20 bg-rose-100 flex justify-center items-center rounded-full shadow-md cursor-pointer'
                onClick={endCall}
            >
                <Icon icon="subway:call-3" fontSize="40px" color='#ef4444'/>
            </button>
        </div>
    )
}

export default ControllerVideo