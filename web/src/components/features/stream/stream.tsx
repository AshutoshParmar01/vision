import { useRef } from "react";

const Stream = () => {

    const webcamVideo =
        useRef<HTMLVideoElement>(null);

    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    const intervalRef =
        useRef<number | null>(null);

    const captureFrame = async () => {

        const video =
            webcamVideo.current;

        const canvas =
            canvasRef.current;

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
                    "frame.png"
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

                    intervalRef.current =
                        window.setInterval(

                            captureFrame,

                            500

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

                <div className="overflow-hidden rounded-2xl border border-neutral-800">

                    <video

                        ref={webcamVideo}

                        autoPlay

                        playsInline

                        muted

                        className="w-full aspect-video object-cover"

                    />

                </div>

                <canvas

                    ref={canvasRef}

                    className="hidden"

                />

                <div className="flex justify-center mt-8">

                    <button

                        onClick={getMedia}

                        className="rounded-xl bg-white px-6 py-3 text-black font-semibold"

                    >

                        Start Camera

                    </button>

                </div>

            </div>

        </div>

    );

};

export default Stream;
