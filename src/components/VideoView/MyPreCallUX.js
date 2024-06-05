import { useLocalMedia, VideoView } from "@whereby.com/browser-sdk/react";

function MyPreCallUX() {
    const localMedia = useLocalMedia({ audio: false, video: true });

    const { currentCameraDeviceId, cameraDevices, localStream } = localMedia.state;
    const { setCameraDevice, toggleCameraEnabled } = localMedia.actions;

    return (
        <div className="preCallView">
            {/* Render any UI, making use of state */}
            {cameraDevices.map((d) => (
                <p
                    key={d.deviceId}
                    onClick={() => {
                        if (d.deviceId !== currentCameraDeviceId) {
                            setCameraDevice(d.deviceId);
                        }
                    }}
                >
                    {d.label}
                </p>
            ))}
            <VideoView muted stream={localStream} />
        </div>
    );
}

export default MyPreCallUX