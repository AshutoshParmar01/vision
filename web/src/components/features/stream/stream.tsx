import { useRef } from "react";

const Stream = () => {

    const webcamVideo =
        useRef<HTMLVideoElement>(null);

    const overlayCanvas =
        useRef<HTMLCanvasElement>(null);

    const captureCanvas =
        useRef<HTMLCanvasElement>(null);

    const intervalRef =
        useRef<number | null>(null);

    const drawFaces = (faces: any[]) => {

        const canvas =
            overlayCanvas.current;

        const video =
            webcamVideo.current;

        if (!canvas || !video)
            return;

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        const ctx =
            canvas.getContext("2d");

        if (!ctx)
            return;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 4;

        ctx.fillStyle = "#8b5cf6";
        ctx.font = "22px Arial";

        for (const face of faces) {

            const [
                x1,
                y1,
                x2,
                y2
            ] = face.bbox;

            ctx.strokeRect(
                x1,
                y1,
                x2 - x1,
                y2 - y1
            );

            ctx.fillText(
                face.person?.name ??
                "Unknown",
                x1,
                y1 - 10
            );

        }

    };

    const captureFrame = async () => {

        const video =
            webcamVideo.current;

        const canvas =
            captureCanvas.current;

        if (!video || !canvas)
            return;

        if (video.videoWidth === 0)
            return;

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        const ctx =
            canvas.getContext("2d");

        if (!ctx)
            return;

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(

            async (blob) => {

                if (!blob)
                    return;

                const formData =
                    new FormData();

                formData.append(
                    "photo",
                    blob,
                    "frame.jpg"
                );

                try {

                    const token =
                        localStorage.getItem("authToken");

                    const response =
                        await fetch(

                            "http://localhost:5000/api/recognize",

                            {

                                method: "POST",

                                headers: {

                                    Authorization:
                                        `Bearer ${token}`

                                },

                                body: formData

                            }

                        );

                    const data =
                        await response.json();

                    console.log(data);

                    drawFaces(
                        data.faces
                    );

                }
                catch (err) {

                    console.log(err);

                }

            },

            "image/jpeg",
            0.8

        );

    };

    const getMedia = async () => {

        try {

            const mediaStream =
                await navigator.mediaDevices.getUserMedia({

                    audio: false,

                    video: {
                        facingMode: "user"
                    }

                });

            if (!webcamVideo.current)
                return;

            webcamVideo.current.srcObject =
                mediaStream;

            webcamVideo.current.onloadedmetadata =
                () => {

                    webcamVideo.current?.play();

                    if (intervalRef.current)
                        clearInterval(intervalRef.current);

                    intervalRef.current =
                        window.setInterval(

                            captureFrame,

                            100

                        );

                };

        }
        catch (err) {

            console.log(err);

        }

    };

    return (

        <div className="min-h-screen bg-black flex items-center justify-center px-6">

            <div className="w-full max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl">

                <h1 className="text-4xl font-bold text-white mb-6">

                    Live Recognition

                </h1>

                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-neutral-800
                    "
                >

                    <video

                        ref={webcamVideo}

                        autoPlay

                        muted

                        playsInline

                        className="
                            w-full
                            aspect-video
                            object-cover
                        "

                    />

                    <canvas

                        ref={overlayCanvas}

                        className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            pointer-events-none
                        "

                    />

                </div>

                <canvas

                    ref={captureCanvas}

                    className="hidden"

                />

                <div className="flex justify-center mt-8">

                    <button

                        onClick={getMedia}

                        className="
                            rounded-xl
                            bg-white
                            px-6
                            py-3
                            font-semibold
                            text-black
                            hover:bg-neutral-200
                            transition
                        "

                    >

                        Start Camera

                    </button>

                </div>

            </div>

        </div>

    );

};

export default Stream;
