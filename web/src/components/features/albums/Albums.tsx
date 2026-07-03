import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FloatingDock } from "../../ui/floating-dock";
import {
  IconPhoto,
  IconUsersGroup,
  IconLayoutDashboard,
  IconArrowNarrowUp,
  IconTextScanAi,
  IconCode,
  IconUserCircle,
  IconPlus,
  IconX,
  IconMusic,
} from "@tabler/icons-react";

interface Album {
  id: string;
  name: string;
  music_url: string;
  photoCount: number;
  coverUrl: string;
}

interface Photo {
  id: string;
  url: string;
}

//  STABLE SUPABASE STORAGE URLS

const DEFAULT_TRACKS = [
  { 
    name: " Calm Background (Default Music)", 
    url: "https://toefuqgmlgribecpdhri.supabase.co/storage/v1/object/public/Music/calm%20background.mp3" 
  },
  { 
    name: " No Music ", 
    url: "" // Empty string tells the slideshow player to play in silence
  },
  { 
    name: "Für Elise (Classic)", 
    url: "https://toefuqgmlgribecpdhri.supabase.co/storage/v1/object/public/Music/Elise.mp3" 
  },
  { 
    name: " Keys of Tomorrow", 
    url: "https://toefuqgmlgribecpdhri.supabase.co/storage/v1/object/public/Music/Keys%20of%20Tomorrow.mp3" 
  },
  { 
    name: " Lofi Chill Beats", 
    url: "https://toefuqgmlgribecpdhri.supabase.co/storage/v1/object/public/Music/lofi%20music.mp3" 
  },
  { 
    name: "Travel Ambient", 
    url: "https://toefuqgmlgribecpdhri.supabase.co/storage/v1/object/public/Music/Travel-ambient.mp3" 
  }
];

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Defaults to the first option (Calm Background)
  const [selectedTrackUrl, setSelectedTrackUrl] = useState(DEFAULT_TRACKS[0].url);
  const [isCustomMusic, setIsCustomMusic] = useState(false);

  const navigate = useNavigate();

  const links = [
    { title: "feed", icon: <IconPhoto className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/gallery" },
    { title: "people", icon: <IconUsersGroup className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/people" },
    { title: "albums", icon: <IconLayoutDashboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/albums" },
    { title: "upload", icon: <IconArrowNarrowUp className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/upload" },
    { title: "AI mode", icon: <IconTextScanAi className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/uc" },
    { title: "contribute", icon: <IconCode className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "https://github.com/pxe-photos/pxephotos" },
    { title: "user", icon: <IconUserCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "/profile" },
  ];

  useEffect(() => {
    fetchAlbums();
    fetchPhotos();
  }, []);

  const fetchAlbums = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/photo/albums", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(res.data);
    } catch (err) {
      console.error("Error fetching albums:", err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/photo/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotos(res.data);
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  };

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName || selectedPhotoIds.length === 0) return;
    setLoading(true);

    const finalMusicUrl = isCustomMusic ? musicUrl : selectedTrackUrl;

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:5000/api/photo/albums",
        {
          name: albumName,
          photoIds: selectedPhotoIds,
          musicUrl: finalMusicUrl || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlbumName("");
      setMusicUrl("");
      setSelectedPhotoIds([]);
      setIsModalOpen(false);
      fetchAlbums();
    } catch (err) {
      console.error("Error creating album:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white antialiased px-6 pt-12 pb-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Your Albums
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create Album Card */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900/40 transition duration-300 rounded-2xl h-64 cursor-pointer group"
          >
            <div className="p-4 rounded-full bg-zinc-900 group-hover:bg-cyan-500/10 transition duration-300">
              <IconPlus className="h-8 w-8 text-zinc-500 group-hover:text-cyan-400 transition duration-300" />
            </div>
            <span className="mt-4 font-medium text-zinc-400 group-hover:text-cyan-400 transition duration-300">
              Create Album
            </span>
          </div>

          {/* List existing albums */}
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => navigate(`/albums/${album.id}`)}
              className="relative group overflow-hidden border border-zinc-900 bg-zinc-950 rounded-2xl h-64 cursor-pointer hover:border-zinc-800 transition duration-300 flex flex-col justify-end"
            >
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                  <IconPhoto className="h-12 w-12 text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent z-10" />

              <div className="relative z-20 p-5">
                <h3 className="text-lg font-semibold truncate text-white">{album.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{album.photoCount} Photos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center h-auto w-auto">
        <FloatingDock items={links} />
      </div>

      {/* CREATE ALBUM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Album</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Album Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Trip 2026"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>

              {/* DROPDOWN SELECT MENU FOR MUSIC */}
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                  <IconMusic className="h-4 w-4 text-cyan-400" /> Background Music
                </label>
                <div className="relative">
                  <select
                    value={isCustomMusic ? "custom" : selectedTrackUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setIsCustomMusic(true);
                      } else {
                        setIsCustomMusic(false);
                        setSelectedTrackUrl(val);
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition cursor-pointer appearance-none"
                  >
                    {DEFAULT_TRACKS.map((track) => (
                      <option key={track.url} value={track.url} className="bg-zinc-950 text-white">
                        {track.name}
                      </option>
                    ))}
                    <option value="custom" className="bg-zinc-950 text-white">
                      🔗 Custom URL...
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                {isCustomMusic && (
                  <input
                    type="url"
                    required={isCustomMusic}
                    placeholder="Paste a direct MP3 link (e.g. https://example.com/song.mp3)"
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white mt-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Select Photos ({selectedPhotoIds.length} Selected)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photos.map((photo) => {
                    const isSelected = selectedPhotoIds.includes(photo.id);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => handlePhotoSelect(photo.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition duration-200 ${
                          isSelected ? "border-cyan-500 scale-95" : "border-zinc-900 hover:border-zinc-700"
                        }`}
                      >
                        <img src={photo.url} alt="" className="h-full w-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                            <div className="bg-cyan-500 text-white rounded-full p-1 shadow-lg">
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || selectedPhotoIds.length === 0}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3.5 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Save Album"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}