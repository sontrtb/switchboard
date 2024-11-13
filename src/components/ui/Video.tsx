import { forwardRef, LegacyRef } from "react";

interface IVideoProps {
    isMe?: boolean
    className?: string
}

const Video = forwardRef(function Video(props: IVideoProps, ref?: LegacyRef<HTMLVideoElement>) {
    const { isMe, className } = props
    return (
        <video
            ref={ref}
            className={`rounded-lg border-2 border-solid ${isMe ? "w-[200px] bg-neutral-300" : "w-full bg-slate-200"}  m-10 ${className}`}
        />
    )
});

export default Video