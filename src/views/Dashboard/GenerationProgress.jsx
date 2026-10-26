import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { mediaUrl } from "../../config/api";
import { CheckIcon } from "../../components/common/Icons";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

/** The uploaded PDF, shown while the backend extracts its text. */
export const PdfPreview = ({ pdfUrl }) => (
  <motion.div
    {...fadeIn}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    style={{ height: "70vh" }}
  >
    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
      <span className="text-sm font-medium text-gray-600">Reading paper...</span>
    </div>
    <iframe src={mediaUrl(pdfUrl)} title="Research Paper" className="w-full h-full" style={{ height: "calc(70vh - 40px)" }} />
  </motion.div>
);

/** The paper summary as it streams in, auto-scrolling to the newest text. */
export const SummaryPanel = ({ text, isStreaming }) => {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [text]);

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <motion.div
        {...fadeIn}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        style={{ maxHeight: "50vh" }}
      >
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
          {isStreaming ? (
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
          ) : (
            <CheckIcon className="w-4 h-4 text-green-600" />
          )}
          <span className="text-sm font-medium text-gray-600">Paper Summary</span>
          <span className="text-xs text-gray-400 ml-auto">Gemini Flash</span>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {text || <span className="text-gray-400 animate-pulse">Analyzing paper...</span>}
          <div ref={endRef} />
        </div>
      </motion.div>
    </div>
  );
};

/** Shown while scenes are rendered and stitched together. */
export const RenderingNotice = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-4 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
  >
    <LoadingSpinner className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
    <p className="text-gray-600 font-medium">Rendering Manim animation...</p>
    <p className="text-gray-400 text-sm mt-1">This may take a minute</p>
  </motion.div>
);
