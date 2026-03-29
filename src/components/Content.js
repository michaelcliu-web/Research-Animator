import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "universal-cookie";
import toast from "react-hot-toast";

const cookies = new Cookies();

const STAGES = [
  { key: "parsing_pdf", label: "Reading paper" },
  { key: "summarizing", label: "Understanding & simplifying" },
  { key: "generating_storyboard", label: "Planning scenes" },
  { key: "processing_scene", label: "Animating scenes" },
  { key: "concatenating", label: "Assembling video" },
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

const EXAMPLE_PAPERS = [
  { file: "PageRankBringingOrdertotheWeb.pdf", title: "PageRank", authors: "Page & Brin, 1998" },
  { file: "NIPS-2017-attention-is-all-you-need-Paper.pdf", title: "Attention Is All You Need", authors: "Vaswani et al., 2017" },
  { file: "MagicNumberSeven-Miller1956.pdf", title: "The Magical Number Seven", authors: "Miller, 1956" },
  { file: "Dunning_Kruger_Effect.pdf", title: "Dunning-Kruger Effect", authors: "Kruger & Dunning, 1999" },
  { file: "Kahneman_Tversky_1979_Prospect_theory.pdf", title: "Prospect Theory", authors: "Kahneman & Tversky, 1979" },
  { file: "playingatariwithdeepreinforcementlearning.pdf", title: "Deep Reinforcement Learning", authors: "Mnih et al., 2013" },
  { file: "nikola-bregovic-entry_tcm18-225169.pdf", title: "The Mpemba Effect", authors: "Bregović" },
  { file: "1953-nature-papers-watson-crick-wilkins-franklin.pdf", title: "DNA Double Helix", authors: "Watson & Crick, 1953" },
  { file: "einstein1905_photoeff.pdf", title: "Photoelectric Effect", authors: "Einstein, 1905" },
  { file: "science.239.4843.992.pdf", title: "High-Temp Superconductors", authors: "Wu et al., 1987" },
];

const DashboardView = ({ stage, pdfUrl, streamingText, streamingCode, videoUrl, summary, keyTakeaways, quiz, suggestedPapers, onReset, onFileSelect, uploading, skillLevel, setSkillLevel }) => {
  const textEndRef = useRef(null);
  const codeEndRef = useRef(null);
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
      const res = await fetch(`/research-paper-examples/${paper.file}`);
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

  useEffect(() => {
    if (codeEndRef.current) codeEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [streamingCode]);

  const isIdle = !stage;
  const showPdf = stage === "parsing_pdf";
  const showSummary = stage === "summarizing" || stage === "summarizing_done" ||
    stage === "generating_storyboard" || stage === "processing_scene" ||
    stage === "concatenating" || stage === "done";
  const showCode = false;
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

        {isIdle && (<>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Explanation level</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {[
                { value: "5th_grade", label: "5th Grade" },
                { value: "10th_grade", label: "10th Grade" },
                { value: "college", label: "College+" },
              ].map(({ value, label }) => (
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
                      src={`/research-paper-examples/${paper.file}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      title={paper.title}
                      className="w-[200%] h-[200%] origin-top-left pointer-events-none"
                      style={{ transform: "scale(0.5)" }}
                      tabIndex={-1}
                    />
                    <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-600/5 transition-colors" />
                    {loadingExample === paper.file && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
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
            <iframe src={API_BASE + pdfUrl} title="Research Paper" className="w-full h-full" style={{ height: "calc(70vh - 40px)" }} />
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
                src={API_BASE + videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
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
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${takeawaysOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
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
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${quizOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
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
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${suggestedOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
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
            <p className="text-gray-600 font-medium">
              {stage === "generating_narration" ? "Generating narration with ElevenLabs..." : "Rendering Manim animation..."}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {stage === "generating_narration" ? "Adding voiceover to your video" : "This may take a minute"}
            </p>
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
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
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
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
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
                      src={API_BASE + video.video_url}
                      preload="auto"
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : video.thumbnail_url ? (
                    <img
                      src={API_BASE + video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                  {playingVideo !== video.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
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
                    href={API_BASE + video.video_url}
                    download
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
          src={API_BASE + video.video_url}
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
              <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
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
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
        <a
          href={API_BASE + video.video_url}
          download
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="Download"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
        {video.key_takeaways && video.key_takeaways.length > 0 && (
          <button
            onClick={() => { setTakeawaysOpen((o) => !o); setChatOpen(false); setQuizOpen(false); setSuggestedOpen(false); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              takeawaysOpen ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Key takeaways"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        )}
        <button
          onClick={() => { setChatOpen((o) => !o); setTakeawaysOpen(false); setQuizOpen(false); setSuggestedOpen(false); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            chatOpen ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Ask about this paper"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={chatBodyRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" onWheel={(e) => e.stopPropagation()}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
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
  const [streamingCode, setStreamingCode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [keyTakeaways, setKeyTakeaways] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [suggestedPapers, setSuggestedPapers] = useState([]);
  const [skillLevel, setSkillLevel] = useState("college");

  const handleSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "pong") return;
      if (data.websocket_type !== "generate_video") return;

      if (data.status === "DONE") {
        setVideoUrl(data.video_url);
        setSummary(data.summary || "");
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
    setStreamingCode("");
    setPdfUrl("");
    setSummary("");
    setVideoUrl("");
    setKeyTakeaways([]);
    setQuiz([]);
    setSuggestedPapers([]);

    try {
      const formData = new FormData();
      formData.append("pdf_file", file);

      const token = getToken ? await getToken() : cookies.get("token");
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
    setSummary("");
    setKeyTakeaways([]);
    setQuiz([]);
    setSuggestedPapers([]);
    setStage("");
    setStreamingText("");
    setStreamingCode("");
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
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
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
      streamingCode={streamingCode}
      videoUrl={videoUrl}
      summary={summary}
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
