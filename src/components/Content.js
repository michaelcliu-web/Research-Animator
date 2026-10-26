import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { mediaUrl, uploadPaper } from "../config/api";
import {
  DEFAULT_SKILL_LEVEL,
  EXAMPLE_PAPERS,
  GENERATION_STAGES,
  SKILL_LEVELS,
  examplePaperUrl,
} from "../config/constants";
import LoadingSpinner from "./common/LoadingSpinner";
import {
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  CloseIcon,
  DocumentIcon,
  DocumentUploadIcon,
  DownloadIcon,
  FilmIcon,
  PlayIcon,
  QuestionIcon,
  QuizIcon,
  SendIcon,
  SpeakerIcon,
  SpeakerMutedIcon,
  UserIcon,
  VideoCameraIcon,
} from "./common/Icons";

const StageIndicator = ({ currentStage }) => {
  const currentIdx = GENERATION_STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center gap-2">
      {GENERATION_STAGES.map((s, idx) => {
        const isDone = currentIdx >= 0 && idx < currentIdx;
        const isCurrent = s.key === currentStage || s.key + "_done" === currentStage;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                isDone ? "bg-green-500" : isCurrent ? "bg-indigo-600 animate-pulse" : "bg-gray-300"
              }`} />
              <span className={`text-xs font-medium whitespace-nowrap ${
                isDone ? "text-green-600" : isCurrent ? "text-indigo-700" : "text-gray-400"
              }`}>
                {s.label}
              </span>
            </div>
            {idx < GENERATION_STAGES.length - 1 && (
              <div className={`w-6 h-px flex-shrink-0 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const PaperModal = ({ pdfUrl, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let revoke = null;
    fetch(mediaUrl(pdfUrl))
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        revoke = url;
        setBlobUrl(url);
      })
      .catch(() => {});
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [pdfUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden" style={{ height: "85vh" }}>
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Original Research Paper</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
            <CloseIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {blobUrl ? (
          <iframe src={blobUrl + "#toolbar=0&navpanes=0&scrollbar=1"} title="Research Paper" className="w-full" style={{ height: "calc(85vh - 48px)" }} />
        ) : (
          <div className="flex items-center justify-center" style={{ height: "calc(85vh - 48px)" }}>
            <LoadingSpinner className="h-8 w-8 text-indigo-600" />
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardView = ({ stage, pdfUrl, streamingText, videoUrl, keyTakeaways, quiz, suggestedPapers, onReset, onFileSelect, uploading, skillLevel, setSkillLevel }) => {
  const textEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loadingExample, setLoadingExample] = useState(null);
  const [takeawaysOpen, setTakeawaysOpen] = useState(true);
  const [quizOpen, setQuizOpen] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [suggestedOpen, setSuggestedOpen] = useState(true);

  useEffect(() => { setQuizAnswers({}); }, [quiz]);

  const handleExampleClick = async (paper) => {
    if (uploading || loadingExample) return;
    setLoadingExample(paper.file);
    try {
      const res = await fetch(examplePaperUrl(paper.file));
      const blob = await res.blob();
      const file = new File([blob], paper.file, { type: "application/pdf" });
      onFileSelect(file);
    } catch (err) {
      toast.error("Failed to load example paper.");
    } finally {
      setLoadingExample(null);
    }
  };

  useEffect(() => {
    if (textEndRef.current) textEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [streamingText]);

  const isIdle = !stage;
  const showPdf = stage === "parsing_pdf";
  const showSummary = stage === "summarizing" || stage === "summarizing_done" ||
    stage === "generating_storyboard" || stage === "processing_scene" ||
    stage === "concatenating" || stage === "done";
  const showSpinner = stage === "processing_scene" || stage === "concatenating";
  const showResult = stage === "done";

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      toast.error("Please upload a PDF file.");
    }
  }, [onFileSelect]);

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-8 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {showResult ? "Your video is ready" : isIdle ? "Reel Research" : "Generating your video"}
            </h2>
            {isIdle && (
              <p className="text-sm text-gray-500 mt-1">Turn any research paper into an animated explainer video</p>
            )}
          </div>
          {pdfUrl && !showPdf && (
            <button
              onClick={() => setShowPaperModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <DocumentIcon className="w-4 h-4" />
              View Paper
            </button>
          )}
        </div>

        <div className="mb-6">
          <StageIndicator currentStage={stage} />
        </div>

        {isIdle && (<>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Explanation level</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {SKILL_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSkillLevel(value)}
                  className={`px-4 py-1.5 transition-colors ${
                    skillLevel === value
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-16
              transition-all duration-200 text-center
              ${dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50"}
              ${uploading ? "pointer-events-none opacity-60" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <DocumentUploadIcon className="w-8 h-8 text-indigo-600" strokeWidth={1.5} />
              </div>
              {uploading ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <LoadingSpinner className="h-5 w-5 text-indigo-600" />
                  Uploading...
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">Drop your research paper here</p>
                  <p className="text-sm text-gray-400">or click to browse &middot; PDF only</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-gray-500 mb-3">Or try a classic paper</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {EXAMPLE_PAPERS.map((paper) => (
                <button
                  key={paper.file}
                  onClick={() => handleExampleClick(paper)}
                  disabled={uploading || !!loadingExample}
                  className={`group bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:border-indigo-300 hover:shadow-md transition-all ${
                    loadingExample === paper.file ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <div className="relative bg-gray-100 overflow-hidden" style={{ height: "180px" }}>
                    <iframe
                      src={`${examplePaperUrl(paper.file)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      title={paper.title}
                      className="w-[200%] h-[200%] origin-top-left pointer-events-none"
                      style={{ transform: "scale(0.5)" }}
                      tabIndex={-1}
                    />
                    <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-600/5 transition-colors" />
                    {loadingExample === paper.file && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <LoadingSpinner className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{paper.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{paper.authors}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>)}

        {showPdf && pdfUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            style={{ height: "70vh" }}
          >
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-sm font-medium text-gray-600">Reading paper...</span>
            </div>
            <iframe src={mediaUrl(pdfUrl)} title="Research Paper" className="w-full h-full" style={{ height: "calc(70vh - 40px)" }} />
          </motion.div>
        )}

        {showResult && videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col items-center"
          >
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg" style={{ width: "min(100%, 360px)", aspectRatio: "9/16" }}>
              <video
                src={mediaUrl(videoUrl)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              <a
                href={mediaUrl(videoUrl)}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </a>
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Generate another
              </button>
            </div>
          </motion.div>
        )}

        {keyTakeaways && keyTakeaways.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
          >
            <button
              onClick={() => setTakeawaysOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-sm">Key Takeaways</span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${takeawaysOpen ? "rotate-180" : ""}`} />
            </button>
            {takeawaysOpen && (
              <div className="px-5 pb-5 space-y-3">
                {keyTakeaways.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.term}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.definition}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {quiz && quiz.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
          >
            <button
              onClick={() => setQuizOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-sm">Knowledge Check</span>
              <div className="flex items-center gap-2">
                {Object.keys(quizAnswers).length === quiz.length && (
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {Object.entries(quizAnswers).filter(([i, a]) => a === quiz[i].answer).length}/{quiz.length} correct
                  </span>
                )}
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${quizOpen ? "rotate-180" : ""}`} />
              </div>
            </button>
            {quizOpen && (
              <div className="px-5 pb-5 space-y-5">
                {quiz.map((q, qi) => {
                  const selected = quizAnswers[qi];
                  const answered = selected !== undefined;
                  return (
                    <div key={qi}>
                      <p className="text-sm font-medium text-gray-800 mb-2">{qi + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, oi) => {
                          const isCorrect = oi === q.answer;
                          const isSelected = selected === oi;
                          let cls = "w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ";
                          if (!answered) {
                            cls += "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700";
                          } else if (isCorrect) {
                            cls += "border-green-400 bg-green-50 text-green-800 font-medium";
                          } else if (isSelected) {
                            cls += "border-red-300 bg-red-50 text-red-700";
                          } else {
                            cls += "border-gray-100 text-gray-400";
                          }
                          return (
                            <button key={oi} className={cls} disabled={answered}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {answered && (
                        <p className="mt-2 text-xs text-gray-500 italic">{q.explanation}</p>
                      )}
                    </div>
                  );
                })}
                {Object.keys(quizAnswers).length === quiz.length && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Score: <span className="font-semibold text-indigo-600">{Object.entries(quizAnswers).filter(([i, a]) => a === quiz[i].answer).length}/{quiz.length}</span>
                    </span>
                    <button
                      onClick={() => setQuizAnswers({})}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >Retry</button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {suggestedPapers && suggestedPapers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
          >
            <button
              onClick={() => setSuggestedOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-sm">Read Next</span>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${suggestedOpen ? "rotate-180" : ""}`} />
            </button>
            {suggestedOpen && (
              <div className="px-5 pb-5 space-y-3">
                {suggestedPapers.map((p, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.authors}{p.year ? ` · ${p.year}` : ""}</p>
                      <p className="text-sm text-gray-500 mt-1">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {showSummary && (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              style={{ maxHeight: "50vh" }}
            >
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
                {stage === "summarizing" ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                ) : (
                  <CheckIcon className="w-4 h-4 text-green-600" />
                )}
                <span className="text-sm font-medium text-gray-600">Paper Summary</span>
                <span className="text-xs text-gray-400 ml-auto">Gemini Flash</span>
              </div>
              <div className="p-4 overflow-y-auto flex-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {streamingText || <span className="text-gray-400 animate-pulse">Analyzing paper...</span>}
                <div ref={textEndRef} />
              </div>
            </motion.div>
          </div>
        )}

        {showSpinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
          >
            <LoadingSpinner className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Rendering Manim animation...</p>
            <p className="text-gray-400 text-sm mt-1">This may take a minute</p>
          </motion.div>
        )}
      </div>

      {showPaperModal && pdfUrl && (
        <PaperModal pdfUrl={pdfUrl} onClose={() => setShowPaperModal(false)} />
      )}
    </div>
  );
};

const VideoHistory = ({ socket }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.websocket_type === "list_videos") {
          setVideos(data.videos || []);
          setLoading(false);
        }
      } catch (e) {}
    };

    const sendRequest = () => {
      socket.send(JSON.stringify({ websocket_type: "list_videos" }));
    };

    socket.addEventListener("message", handleMessage);

    if (socket.readyState === WebSocket.OPEN) {
      sendRequest();
    } else {
      socket.addEventListener("open", sendRequest);
    }

    return () => {
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("open", sendRequest);
    };
  }, [socket]);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

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
              <div
                key={video.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="relative bg-black cursor-pointer group"
                  style={{ aspectRatio: "9/16" }}
                  onClick={() => setPlayingVideo(playingVideo === video.id ? null : video.id)}
                >
                  {playingVideo === video.id ? (
                    <video
                      src={mediaUrl(video.video_url)}
                      preload="auto"
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : video.thumbnail_url ? (
                    <img
                      src={mediaUrl(video.thumbnail_url)}
                      alt={video.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                  {playingVideo !== video.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <PlayIcon className="w-7 h-7 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {video.title || "Untitled"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(video.created_at)}</p>
                  {video.summary && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{video.summary}</p>
                  )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReelItem = ({ video, isVisible, socket }) => {
  const videoRef = useRef(null);
  const chatBodyRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [takeawaysOpen, setTakeawaysOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [suggestedOpen, setSuggestedOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [answering, setAnswering] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible && !paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, paused]);

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.websocket_type === "ask_answer" && data.video_id === video.id) {
          if (data.error) {
            setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong: " + data.error }]);
            setAnswering(false);
          } else if (data.status === "streaming" && data.chunk) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "assistant" && last.streaming) {
                return [...prev.slice(0, -1), { ...last, text: last.text + data.chunk }];
              }
              return [...prev, { role: "assistant", text: data.chunk, streaming: true }];
            });
          } else if (data.status === "done") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "assistant") {
                return [...prev.slice(0, -1), { ...last, streaming: false }];
              }
              return prev;
            });
            setAnswering(false);
          }
        }
      } catch (e) {}
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, video.id]);

  const togglePlay = () => {
    if (!isVisible) return;
    setPaused((p) => !p);
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q || answering || !socket || socket.readyState !== WebSocket.OPEN) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setAnswering(true);
    socket.send(JSON.stringify({
      websocket_type: "ask_question",
      video_id: video.id,
      question: q,
    }));
  };

  return (
    <div className="flex items-center gap-3 justify-center">
      {takeawaysOpen && video.key_takeaways && video.key_takeaways.length > 0 && (
        <div
          className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex-shrink-0"
          style={{ width: "300px", height: "min(580px, 70vh)" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">Key Takeaways</h4>
            <button onClick={() => setTakeawaysOpen(false)} className="text-gray-400 hover:text-gray-600">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {video.key_takeaways.map((item, i) => (
              <div key={i} className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.term}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.definition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quizOpen && video.quiz && video.quiz.length > 0 && (
        <div
          className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex-shrink-0"
          style={{ width: "300px", height: "min(580px, 70vh)" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-800">Knowledge Check</h4>
            <div className="flex items-center gap-2">
              {Object.keys(quizAnswers).length === video.quiz.length && (
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {Object.entries(quizAnswers).filter(([i, a]) => a === video.quiz[i].answer).length}/{video.quiz.length}
                </span>
              )}
              <button onClick={() => setQuizOpen(false)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
            {video.quiz.map((q, qi) => {
              const selected = quizAnswers[qi];
              const answered = selected !== undefined;
              return (
                <div key={qi}>
                  <p className="text-sm font-medium text-gray-800 mb-2">{qi + 1}. {q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.answer;
                      const isSelected = selected === oi;
                      let cls = "w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ";
                      if (!answered) {
                        cls += "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700";
                      } else if (isCorrect) {
                        cls += "border-green-400 bg-green-50 text-green-800 font-medium";
                      } else if (isSelected) {
                        cls += "border-red-300 bg-red-50 text-red-700";
                      } else {
                        cls += "border-gray-100 text-gray-400";
                      }
                      return (
                        <button key={oi} className={cls} disabled={answered}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {answered && (
                    <p className="mt-1.5 text-xs text-gray-500 italic">{q.explanation}</p>
                  )}
                </div>
              );
            })}
            {Object.keys(quizAnswers).length === video.quiz.length && (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Score: <span className="font-semibold text-indigo-600">{Object.entries(quizAnswers).filter(([i, a]) => a === video.quiz[i].answer).length}/{video.quiz.length}</span>
                </span>
                <button onClick={() => setQuizAnswers({})} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Retry</button>
              </div>
            )}
          </div>
        </div>
      )}

      {suggestedOpen && video.suggested_papers && video.suggested_papers.length > 0 && (
        <div
          className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex-shrink-0"
          style={{ width: "300px", height: "min(580px, 70vh)" }}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <h4 className="text-sm font-semibold text-gray-800">Read Next</h4>
            <button onClick={() => setSuggestedOpen(false)} className="text-gray-400 hover:text-gray-600">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {video.suggested_papers.map((p, i) => (
              <div key={i} className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.authors}{p.year ? ` · ${p.year}` : ""}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

        <div
          className="absolute bottom-16 left-0 right-0 px-3"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = t;
              setCurrentTime(t);
            }}
            className="w-full h-1 accent-white cursor-pointer"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
          <h3 className="text-white font-bold text-sm drop-shadow-lg">
            {video.title || "Untitled"}
          </h3>
          {video.summary && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2 drop-shadow">
              {video.summary}
            </p>
          )}
        </div>

        {paused && isVisible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <PlayIcon className="w-7 h-7 text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 pb-6">
        <button
          onClick={() => setMuted(!muted)}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <SpeakerMutedIcon className="w-5 h-5 text-gray-700" />
          ) : (
            <SpeakerIcon className="w-5 h-5 text-gray-700" />
          )}
        </button>
        <a
          href={mediaUrl(video.video_url)}
          download
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="Download"
        >
          <DownloadIcon className="w-5 h-5 text-gray-700" />
        </a>
        {video.key_takeaways && video.key_takeaways.length > 0 && (
          <button
            onClick={() => { setTakeawaysOpen((o) => !o); setChatOpen(false); setQuizOpen(false); setSuggestedOpen(false); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              takeawaysOpen ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Key takeaways"
          >
            <ClipboardCheckIcon className="w-5 h-5" />
          </button>
        )}
        {video.quiz && video.quiz.length > 0 && (
          <button
            onClick={() => { setQuizOpen((o) => !o); setTakeawaysOpen(false); setChatOpen(false); setSuggestedOpen(false); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              quizOpen ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Knowledge check"
          >
            <QuizIcon className="w-5 h-5" />
          </button>
        )}
        {video.suggested_papers && video.suggested_papers.length > 0 && (
          <button
            onClick={() => { setSuggestedOpen((o) => !o); setTakeawaysOpen(false); setQuizOpen(false); setChatOpen(false); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              suggestedOpen ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Read next"
          >
            <BookOpenIcon className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => { setChatOpen((o) => !o); setTakeawaysOpen(false); setQuizOpen(false); setSuggestedOpen(false); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            chatOpen ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Ask about this paper"
        >
          <QuestionIcon className="w-5 h-5" />
        </button>
      </div>

      {chatOpen && (
        <div
          className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex-shrink-0"
          style={{ width: "340px", height: "min(580px, 70vh)" }}
          onWheel={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Ask about this paper</h4>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{video.title || "Untitled"}</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <div ref={chatBodyRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" onWheel={(e) => e.stopPropagation()}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <QuestionIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-gray-400">Ask anything about this paper</p>
                <p className="text-xs text-gray-300 mt-1">e.g. "What method did they use?" or "Explain the results"</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                  {msg.streaming && (
                    <span className="inline-block w-1.5 h-4 bg-indigo-400 rounded-full ml-1 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            ))}
            <div />
          </div>

          <div className="px-3 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); handleSend(); } }}
                placeholder="Ask a question..."
                disabled={answering}
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 disabled:bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={answering || !input.trim()}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {answering ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReelsFeed = ({ socket }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.websocket_type === "list_videos") {
          setVideos(data.videos || []);
          setLoading(false);
        }
      } catch (e) {}
    };

    const sendRequest = () => {
      socket.send(JSON.stringify({ websocket_type: "list_videos" }));
    };

    socket.addEventListener("message", handleMessage);

    if (socket.readyState === WebSocket.OPEN) {
      sendRequest();
    } else {
      socket.addEventListener("open", sendRequest);
    }

    return () => {
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("open", sendRequest);
    };
  }, [socket]);

  useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.idx);
            setVisibleIdx(idx);
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
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
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll bg-gray-50"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {videos.map((video, idx) => (
        <div
          key={video.id}
          ref={(el) => (itemRefs.current[idx] = el)}
          data-idx={idx}
          className="h-screen flex items-center justify-center py-6"
          style={{ scrollSnapAlign: "start" }}
        >
          <ReelItem video={video} isVisible={visibleIdx === idx} socket={socket} />
        </div>
      ))}
    </div>
  );
};

const Content = ({ socket, selectedMode, getToken }) => {
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [keyTakeaways, setKeyTakeaways] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [suggestedPapers, setSuggestedPapers] = useState([]);
  const [skillLevel, setSkillLevel] = useState(DEFAULT_SKILL_LEVEL);

  const handleSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "pong") return;
      if (data.websocket_type !== "generate_video") return;

      if (data.status === "DONE") {
        setVideoUrl(data.video_url);
        setKeyTakeaways(data.key_takeaways || []);
        setQuiz(data.quiz || []);
        setSuggestedPapers(data.suggested_papers || []);
        setStage("done");
      } else if (data.status === "error") {
        setStage("");
        toast.error("Video generation failed: " + (data.message || "Unknown error"));
      } else if (data.status === "parsing_pdf") {
        setStage("parsing_pdf");
        if (data.pdf_url) setPdfUrl(data.pdf_url);
      } else if (data.status === "summarizing") {
        setStage("summarizing");
        if (data.chunk) setStreamingText((prev) => prev + data.chunk);
      } else if (data.status === "summarizing_done") {
        setStage("summarizing_done");
      } else if (data.status === "generating_storyboard") {
        setStage("generating_storyboard");
      } else if (data.status === "storyboard_done") {
        setStage("generating_storyboard");
      } else if (data.status === "processing_scene") {
        setStage("processing_scene");
      } else if (data.status === "concatenating") {
        setStage("concatenating");
      } else {
        setStage(data.status);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.addEventListener("message", handleSocketMessage);
    return () => socket.removeEventListener("message", handleSocketMessage);
  }, [socket, handleSocketMessage]);

  const handleFileSelect = async (file) => {
    setUploading(true);
    setStage("");
    setStreamingText("");
    setPdfUrl("");
    setVideoUrl("");
    setKeyTakeaways([]);
    setQuiz([]);
    setSuggestedPapers([]);

    try {
      const paper_id = await uploadPaper(file, await getToken());

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ websocket_type: "generate_video", paper_id, skill_level: skillLevel }));
        setStage("parsing_pdf");
      } else {
        toast.error("WebSocket not connected. Please refresh and try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload paper. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setVideoUrl("");
    setKeyTakeaways([]);
    setQuiz([]);
    setSuggestedPapers([]);
    setStage("");
    setStreamingText("");
    setPdfUrl("");
  };

  if (selectedMode === "feed") {
    return <ReelsFeed socket={socket} />;
  }

  if (selectedMode === "my_videos") {
    return <VideoHistory socket={socket} />;
  }

  if (selectedMode === "settings") {
    return (
      <div className="bg-gray-50 min-h-screen px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Settings</h2>
          <p className="text-sm text-gray-500 mb-6">Manage your account and preferences</p>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Account</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">Signed in via Clerk</p>
                  <p className="text-xs text-gray-400 mt-0.5">Manage your account from the sidebar</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">About</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">App</span>
                  <span className="font-medium">Reel Research</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Animation engine</span>
                  <span className="font-medium">Manim (3Blue1Brown)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Summary model</span>
                  <span className="font-medium">Gemini Flash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Animation model</span>
                  <span className="font-medium">Claude Opus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Narration</span>
                  <span className="font-medium">ElevenLabs TTS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Video format</span>
                  <span className="font-medium">9:16 vertical (Reels / Shorts)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardView
      stage={stage}
      pdfUrl={pdfUrl}
      streamingText={streamingText}
      videoUrl={videoUrl}
      keyTakeaways={keyTakeaways}
      quiz={quiz}
      suggestedPapers={suggestedPapers}
      onReset={handleReset}
      onFileSelect={handleFileSelect}
      uploading={uploading}
      skillLevel={skillLevel}
      setSkillLevel={setSkillLevel}
    />
  );
};

export default Content;
