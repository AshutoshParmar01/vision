import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IconX,
  IconPlayerPlay,
  IconPlayerPause,
  IconChevronLeft,
  IconChevronRight,
  IconVolume,
  IconVolumeOff,
  //--
  IconDownload,
  IconLoader2,
  //--
} from "@tabler/icons-react";
//--
import { saveAs } from "file-saver";
//--

interface Album {
  id: string;
  name: string;
  music_url: string;
}

interface Photo {
  id: string;
  url: string;
}

export default function AlbumView() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showAutoplayOverlay, setShowAutoplayOverlay] = useState(true);
  //--
  const [isDownloading, setIsDownloading] = useState(false);
  //-

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideshowInterval = useRef<any>(null);
  // cancel dnload
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {

    fetchAlbumDetails();

    return () => {

      stopSlideshow();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

    };

  }, [albumId]);

  useEffect(() => {
    if (isPlaying && photos.length > 1) {
      startSlideshow();
    } else {
      stopSlideshow();
    }
    return () => stopSlideshow();
  }, [isPlaying, photos]);

  const fetchAlbumDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`http://localhost:5000/api/photo/albums/${albumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbum(res.data.album);
      setPhotos(res.data.photos);
    } catch (err) {
      console.error("Error loading album details:", err);
    }
  };

  const startSlideshow = () => {
    stopSlideshow();
    slideshowInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 4000); // 4 seconds per slide transition
  };

  const stopSlideshow = () => {
    if (slideshowInterval.current) {
      clearInterval(slideshowInterval.current);
    }
  };

  // Modern browsers block autoplay audio. The user must click or interact with the page first.
  // This fullscreen click handler enables starting the audio safely on user action.
  const handleInteraction = () => {
    setShowAutoplayOverlay(false);
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log("Audio playback failed:", err);
      });
    }
  };

  const togglePlay = () => {

    if (isPlaying) {

      // Pause slideshow
      stopSlideshow();

      // Pause background music
      if (audioRef.current) {
        audioRef.current.pause();
      }

    } else {

      // Resume slideshow
      startSlideshow();

      // Resume background music
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Audio playback failed:", err);
        });
      }

    }

    setIsPlaying(!isPlaying);

  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  //--
  const handleDownloadVideo = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("authToken");

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await axios.get(
        `http://localhost:5000/api/photo/albums/${albumId}/video`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
          signal: controller.signal,
        }
      );

      const videoBlob = new Blob([response.data], { type: "video/mp4" });
      saveAs(videoBlob, `${album?.name || "slideshow"}.mp4`);
    } catch (err: any) {

      if (
        err.name === "CanceledError" ||
        err.code === "ERR_CANCELED"
      ) {
        console.log("Download cancelled.");
        return;
      }

      console.error("Failed to download video:", err);

      alert(
        "Could not generate the slideshow video."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {

    abortControllerRef.current?.abort();

    setIsDownloading(false);

  };
  //--

  if (!album || photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Loading album...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none">
      {/* HTML5 Audio Tag */}
      {album.music_url && (
        <audio
          ref={audioRef}
          src={album.music_url}
          loop
          autoPlay
        />
      )}

      {/* Autoplay Overlay click catcher */}
      {showAutoplayOverlay && (
        <div
          onClick={handleInteraction}
          className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center cursor-pointer text-center p-6"
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 animate-pulse mb-6">
            <IconPlayerPlay className="h-8 w-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to {album.name}</h2>
          <p className="text-sm text-zinc-400 max-w-sm">
            Click anywhere to start the slideshow & play background music
          </p>
        </div>
      )}

      {/* Main Slideshow Image Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        {photos.map((photo, index) => (
          <img
            key={photo.id}
            src={photo.url}
            alt=""
            className={`absolute max-w-full max-h-full object-contain transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          />
        ))}
        {/* Soft dark shadows for control overlays */}
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/80 to-transparent z-20" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/80 to-transparent z-20" />
      </div>

      {/* Top Album Details & Close Button */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30">
        <div>
          <h2 className="text-xl font-bold text-white">{album.name}</h2>
          <p className="text-xs text-zinc-400 mt-1">
            {currentIndex + 1} of {photos.length}
          </p>
        </div>


        <div className="flex items-center gap-3">
          {/* SLIDESHOW VIDEO DOWNLOAD BUTTON */}
          {!isDownloading ? (

            <button
              onClick={handleDownloadVideo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
            >
              <IconDownload className="h-5 w-5 text-cyan-400" />
              <span className="text-xs font-medium">
                Download Video
              </span>
            </button>

          ) : (

            <>
              {/* Download Status */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-300">

                <IconLoader2 className="h-5 w-5 animate-spin text-cyan-400" />

                <span className="text-xs font-medium">
                  Downloading Video...
                </span>

              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancelDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
              >
                <IconX className="h-5 w-5" />

                <span className="text-xs font-medium">
                  Cancel
                </span>
              </button>
            </>

          )}
          <button
            onClick={() => {

              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }

              navigate("/albums");

            }}
            className="p-3 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
          >
            <IconX className="h-6 w-6" />
          </button>
        </div>
      </div>


      {/* Floating Control Panel at the bottom */}
      <div className="absolute bottom-8 flex items-center gap-6 z-30 px-6 py-3 rounded-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
        <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition">
          <IconChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
        >
          {isPlaying ? (
            <IconPlayerPause className="h-5 w-5 fill-current" />
          ) : (
            <IconPlayerPlay className="h-5 w-5 fill-current ml-0.5" />
          )}
        </button>

        <button onClick={handleNext} className="text-zinc-400 hover:text-white transition">
          <IconChevronRight className="h-6 w-6" />
        </button>

        <div className="h-6 w-px bg-zinc-800" />

        <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition">
          {isMuted ? <IconVolumeOff className="h-5 w-5" /> : <IconVolume className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}