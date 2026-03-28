import React, { useState, useRef, useCallback, useEffect } from "react";
import { UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "universal-cookie";
import toast from "react-hot-toast";

const cookies = new Cookies();

const STAGES = [
  { key: "parsing_pdf", label: "Reading paper" },
  { key: "summarizing", label: "Understanding & simplifying" },
  { key: "generating_animation", label: "Creating animation code" },
  { key: "rendering", label: "Rendering video" },
  { key: "done", label: "Result" },
];

const API_BASE = process.env.REACT_APP_API_URL?.replace("/api/", "") || "";

const StageIndicator = ({ currentStage }) => {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center gap-2">
      {STAGES.map((s, idx) => {
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
            {idx < STAGES.length - 1 && (
              <div className={`w-6 h-px flex-shrink-0 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const UploadZone = ({ onFileSelect, uploading }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      } else {
        toast.error("Please upload a PDF file.");
      }
    },
    [onFileSelect]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-50">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Paper Animator
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Turn any research paper into an animated explainer video
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <StageIndicator currentStage="" />
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
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            {uploading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
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
      </div>
    </div>
  );
};


const PaperModal = ({ pdfUrl, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    let revoke = null;
    fetch(API_BASE + pdfUrl)
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
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {blobUrl ? (
          <iframe src={blobUrl + "#toolbar=0&navpanes=0&scrollbar=1"} title="Research Paper" className="w-full" style={{ height: "calc(85vh - 48px)" }} />
        ) : (
          <div className="flex items-center justify-center" style={{ height: "calc(85vh - 48px)" }}>
            <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

const ProcessingView = ({ stage, pdfUrl, streamingText, streamingCode, videoUrl, summary, onReset }) => {
  const textEndRef = useRef(null);
  const codeEndRef = useRef(null);
  const [showPaperModal, setShowPaperModal] = useState(false);

  useEffect(() => {
    if (textEndRef.current) textEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [streamingText]);

  useEffect(() => {
    if (codeEndRef.current) codeEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [streamingCode]);

  const showPdf = stage === "parsing_pdf";
  const showSummary = stage === "summarizing" || stage === "summarizing_done" ||
    stage === "generating_animation" || stage === "generating_animation_done" ||
    stage === "rendering" || stage === "done";
  const showCode = stage === "generating_animation" || stage === "generating_animation_done" ||
    stage === "rendering" || stage === "done";
  const showSpinner = stage === "rendering";
  const showResult = stage === "done";

  return (
    <div className="bg-gray-50 px-6 py-8 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {showResult ? "Your video is ready" : "Generating your video"}
          </h2>
          {pdfUrl && !showPdf && (
            <button
              onClick={() => setShowPaperModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View Paper
            </button>
          )}
        </div>

        <div className="mb-6">
          <StageIndicator currentStage={stage} />
        </div>

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
            <iframe src={API_BASE + pdfUrl} title="Research Paper" className="w-full h-full" style={{ height: "calc(70vh - 40px)" }} />
          </motion.div>
        )}

        {showResult && videoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
              <video
                src={API_BASE + videoUrl}
                controls
                autoPlay
                className="w-full aspect-video"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              <a
                href={API_BASE + videoUrl}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
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
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-600">Paper Summary</span>
                <span className="text-xs text-gray-400 ml-auto">Gemini Flash</span>
              </div>
              <div className="p-4 overflow-y-auto flex-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {streamingText || <span className="text-gray-400 animate-pulse">Analyzing paper...</span>}
                <div ref={textEndRef} />
              </div>
            </motion.div>

            {showCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 overflow-hidden flex flex-col"
                style={{ maxHeight: "50vh" }}
              >
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2 flex-shrink-0">
                  {stage === "generating_animation" ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  ) : (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="text-sm font-medium text-gray-300">Manim Animation Code</span>
                  <span className="text-xs text-gray-500 ml-auto">Claude Opus</span>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {streamingCode || <span className="text-gray-500 animate-pulse">Generating animation...</span>}
                  </pre>
                  <div ref={codeEndRef} />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {showSpinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
          >
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
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

const Content = ({ socket }) => {
  const [view, setView] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [streamingCode, setStreamingCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");

  const handleSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "pong") return;
      if (data.websocket_type !== "generate_video") return;

      if (data.status === "DONE") {
        setVideoUrl(data.video_url);
        setSummary(data.summary || "");
        setStage("done");
      } else if (data.status === "error") {
        setView("upload");
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
      } else if (data.status === "generating_animation") {
        setStage("generating_animation");
        if (data.chunk) setStreamingCode((prev) => prev + data.chunk);
      } else if (data.status === "generating_animation_done") {
        setStage("generating_animation_done");
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
    setStreamingText("");
    setStreamingCode("");
    setPdfUrl("");
    setSummary("");
    setVideoUrl("");

    try {
      const formData = new FormData();
      formData.append("pdf_file", file);

      const token = cookies.get("token");
      const res = await axios.post(
        process.env.REACT_APP_API_URL + "papers/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + token,
          },
        }
      );

      const { paper_id } = res.data;

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ websocket_type: "generate_video", paper_id }));
        setView("processing");
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
    setView("upload");
    setVideoUrl("");
    setSummary("");
    setStage("");
    setStreamingText("");
    setStreamingCode("");
    setPdfUrl("");
  };

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50">
        <UserButton afterSignOutUrl="/" />
      </div>

      <AnimatePresence mode="wait">
        {view === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <UploadZone onFileSelect={handleFileSelect} uploading={uploading} />
          </motion.div>
        )}
        {view === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ProcessingView
              stage={stage}
              pdfUrl={pdfUrl}
              streamingText={streamingText}
              streamingCode={streamingCode}
              videoUrl={videoUrl}
              summary={summary}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Content;
