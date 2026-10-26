import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../../config/api";
import usePaperChat from "../../hooks/usePaperChat";
import useQuiz from "../../hooks/useQuiz";
import SidePanel from "../../components/common/SidePanel";
import KeyTakeawaysList from "../../components/study/KeyTakeawaysList";
import QuizQuestions, { QuizScoreBadge } from "../../components/study/QuizQuestions";
import ReadNextList from "../../components/study/ReadNextList";
import {
  BookOpenIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  PlayIcon,
  QuestionIcon,
  QuizIcon,
  SpeakerIcon,
  SpeakerMutedIcon,
} from "../../components/common/Icons";
import ChatPanel from "./ChatPanel";

const hasItems = (list) => Array.isArray(list) && list.length > 0;

const roundButtonClass = "w-10 h-10 rounded-full flex items-center justify-center transition-colors";

/** Round icon button beside the video that opens one of its side panels. */
const PanelToggleButton = ({ title, isActive, onClick, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`${roundButtonClass} ${
      isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

/** Click to pause/play, a seek bar, and the title/summary overlay. */
const ReelVideo = ({ video, isVisible, muted }) => {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Only the video scrolled into view plays.
  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible && !paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, paused]);

  const togglePlay = () => {
    if (isVisible) setPaused((wasPaused) => !wasPaused);
  };

  const seekTo = (seconds) => {
    if (videoRef.current) videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  return (
    <div
      className="relative bg-black rounded-xl overflow-hidden cursor-pointer flex-shrink-0"
      style={{ width: "360px", aspectRatio: "9/16" }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={mediaUrl(video.video_url)}
        loop
        muted={muted}
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />

      <div className="absolute bottom-16 left-0 right-0 px-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={(e) => seekTo(parseFloat(e.target.value))}
          className="w-full h-1 accent-white cursor-pointer"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <h3 className="text-white font-bold text-sm drop-shadow-lg">{video.title || "Untitled"}</h3>
        {video.summary && <p className="text-white/70 text-xs mt-1 line-clamp-2 drop-shadow">{video.summary}</p>}
      </div>

      {paused && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <PlayIcon className="w-7 h-7 text-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * One video in the feed, with action buttons on its right and at most one
 * side panel open at a time (takeaways, quiz, and read-next on the left; chat on the right).
 */
const ReelItem = ({ video, isVisible, socket }) => {
  const [muted, setMuted] = useState(false);
  // Which side panel is showing: "takeaways" | "quiz" | "readNext" | "chat" | null.
  const [openPanel, setOpenPanel] = useState(null);
  // Kept here rather than in the panels so state survives closing and reopening them.
  const quiz = useQuiz(video.quiz || []);
  const chat = usePaperChat(socket, video.id);
  const [chatDraft, setChatDraft] = useState("");

  const togglePanel = (panel) => setOpenPanel((current) => (current === panel ? null : panel));
  const closePanel = () => setOpenPanel(null);

  return (
    <div className="flex items-center gap-3 justify-center">
      {openPanel === "takeaways" && (
        <SidePanel title="Key Takeaways" onClose={closePanel}>
          <KeyTakeawaysList takeaways={video.key_takeaways} variant="panel" />
        </SidePanel>
      )}

      {openPanel === "quiz" && (
        <SidePanel title="Knowledge Check" headerExtra={<QuizScoreBadge quiz={quiz} />} onClose={closePanel}>
          <QuizQuestions questions={video.quiz} quiz={quiz} variant="panel" />
        </SidePanel>
      )}

      {openPanel === "readNext" && (
        <SidePanel title="Read Next" onClose={closePanel}>
          <ReadNextList papers={video.suggested_papers} variant="panel" />
        </SidePanel>
      )}

      <ReelVideo video={video} isVisible={isVisible} muted={muted} />

      <div className="flex flex-col items-center gap-4 pb-6">
        <button
          onClick={() => setMuted(!muted)}
          className={`${roundButtonClass} bg-gray-100 hover:bg-gray-200`}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <SpeakerMutedIcon className="w-5 h-5 text-gray-700" /> : <SpeakerIcon className="w-5 h-5 text-gray-700" />}
        </button>
        <a
          href={mediaUrl(video.video_url)}
          download
          className={`${roundButtonClass} bg-gray-100 hover:bg-gray-200`}
          onClick={(e) => e.stopPropagation()}
          title="Download"
        >
          <DownloadIcon className="w-5 h-5 text-gray-700" />
        </a>
        {hasItems(video.key_takeaways) && (
          <PanelToggleButton title="Key takeaways" isActive={openPanel === "takeaways"} onClick={() => togglePanel("takeaways")}>
            <ClipboardCheckIcon className="w-5 h-5" />
          </PanelToggleButton>
        )}
        {hasItems(video.quiz) && (
          <PanelToggleButton title="Knowledge check" isActive={openPanel === "quiz"} onClick={() => togglePanel("quiz")}>
            <QuizIcon className="w-5 h-5" />
          </PanelToggleButton>
        )}
        {hasItems(video.suggested_papers) && (
          <PanelToggleButton title="Read next" isActive={openPanel === "readNext"} onClick={() => togglePanel("readNext")}>
            <BookOpenIcon className="w-5 h-5" />
          </PanelToggleButton>
        )}
        <PanelToggleButton title="Ask about this paper" isActive={openPanel === "chat"} onClick={() => togglePanel("chat")}>
          <QuestionIcon className="w-5 h-5" />
        </PanelToggleButton>
      </div>

      {openPanel === "chat" && (
        <ChatPanel
          videoTitle={video.title || "Untitled"}
          chat={chat}
          draft={chatDraft}
          onDraftChange={setChatDraft}
          onClose={closePanel}
        />
      )}
    </div>
  );
};

export default ReelItem;
