import { useState } from "react";
import { mediaUrl } from "../../config/api";
import useVideoLibrary from "../../hooks/useVideoLibrary";
import { formatDateTime } from "../../utils/format";
import { DownloadIcon, PlayIcon, VideoCameraIcon } from "../../components/common/Icons";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/** Thumbnail that turns into an inline player when clicked. */
const VideoCard = ({ video, isPlaying, onTogglePlay }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative bg-black cursor-pointer group" style={{ aspectRatio: "9/16" }} onClick={onTogglePlay}>
      {isPlaying ? (
        <video src={mediaUrl(video.video_url)} preload="auto" controls autoPlay className="w-full h-full object-contain" />
      ) : video.thumbnail_url ? (
        <img src={mediaUrl(video.thumbnail_url)} alt={video.title} className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full" />
      )}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <PlayIcon className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 text-sm truncate">{video.title || "Untitled"}</h3>
      <p className="text-xs text-gray-400 mt-1">{formatDateTime(video.created_at)}</p>
      {video.summary && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{video.summary}</p>}
      <a
        href={mediaUrl(video.video_url)}
        download
        className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        onClick={(e) => e.stopPropagation()}
      >
        <DownloadIcon className="w-3.5 h-3.5" />
        Download
      </a>
    </div>
  </div>
);

/** Grid of every video the user has generated. */
const MyVideosView = ({ socket }) => {
  const { videos, loading } = useVideoLibrary(socket);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-2rem)] bg-gray-50">
        <LoadingSpinner className="h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Videos</h2>
        <p className="text-sm text-gray-500 mb-6">All your previously generated videos</p>

        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <VideoCameraIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-gray-500 font-medium">No videos yet</p>
            <p className="text-sm text-gray-400 mt-1">Go to Dashboard to generate your first video</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isPlaying={playingVideoId === video.id}
                onTogglePlay={() => setPlayingVideoId(playingVideoId === video.id ? null : video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVideosView;
