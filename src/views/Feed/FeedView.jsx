import { useEffect, useRef, useState } from "react";
import useVideoLibrary from "../../hooks/useVideoLibrary";
import { FilmIcon } from "../../components/common/Icons";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ReelItem from "./ReelItem";

/** Full-screen vertical feed of the user's videos, one per screen, TikTok-style. */
const FeedView = ({ socket }) => {
  const { videos, loading } = useVideoLibrary(socket);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // Track which video is mostly on screen so only that one plays.
  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisibleIndex(Number(entry.target.dataset.index));
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );
    itemRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [videos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner className="h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <FilmIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-gray-500 font-medium">No videos in your feed</p>
          <p className="text-sm text-gray-400 mt-1">Generate a video from the Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen overflow-y-scroll bg-gray-50" style={{ scrollSnapType: "y mandatory" }}>
      {videos.map((video, index) => (
        <div
          key={video.id}
          ref={(element) => (itemRefs.current[index] = element)}
          data-index={index}
          className="h-screen flex items-center justify-center py-6"
          style={{ scrollSnapAlign: "start" }}
        >
          <ReelItem video={video} isVisible={visibleIndex === index} socket={socket} />
        </div>
      ))}
    </div>
  );
};

export default FeedView;
