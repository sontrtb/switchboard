// Assign a MediaStream to an HTMLMediaElement and update if tracks change.
function assignStream(stream: MediaStream, element: HTMLVideoElement): void {
    element.autoplay = true;
    element.srcObject = stream;

    element.play().catch((error: Error) => {
        console.error("Failed to play media");
        console.error(error);
    });

    stream.onaddtrack = (): void => {
        element.load();
        element.play().catch((error: Error) => {
            console.error("Failed to play remote media on add track");
            console.error(error);
        });
    };

    stream.onremovetrack = (): void => {
        element.load();
        element.play().catch((error: Error) => {
            console.error("Failed to play remote media on remove track");
            console.error(error);
        });
    };
}

export default assignStream