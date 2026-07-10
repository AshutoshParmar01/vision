import { useRef } from "react";

const Stream = () => {
    const webcamVideo = useRef<HTMLVideoElement>(null);
    const getMedia = async () => {
        try {
            let mediastream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video : { facingMode : "user" }
            });
            if(webcamVideo.current){
                webcamVideo.current.srcObject = mediastream
            }
        } catch (e) {   
            console.log(e)
        }
    }
    return <div>
        <video ref = {webcamVideo} autoPlay playsInline></video>
        <button onClick={getMedia}>startCam</button>
    </div>
}

export default Stream
