import { useState } from "react";
import toast from "react-hot-toast";
import { uploadPaper } from "../config/api";
import { DEFAULT_SKILL_LEVEL } from "../config/constants";
import { isSocketOpen, sendSocketMessage } from "../utils/socket";
import useSocketMessage from "./useSocketMessage";

const EMPTY_RESULT = { videoUrl: "", keyTakeaways: [], quiz: [], suggestedPapers: [] };

/**
 * Drives one paper-to-video run: uploads the PDF over HTTP, asks the backend
 * to start the pipeline over the WebSocket, then follows its progress updates.
 *
 * `stage` is "" while idle, otherwise the backend's latest status
 * (see GENERATION_STAGES), and "done" once the video is ready.
 */
const useVideoGeneration = (socket, getToken) => {
  const [skillLevel, setSkillLevel] = useState(DEFAULT_SKILL_LEVEL);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [result, setResult] = useState(EMPTY_RESULT);

  useSocketMessage(socket, (message) => {
    if (message.websocket_type !== "generate_video") return;

    switch (message.status) {
      case "DONE":
        setResult({
          videoUrl: message.video_url,
          keyTakeaways: message.key_takeaways || [],
          quiz: message.quiz || [],
          suggestedPapers: message.suggested_papers || [],
        });
        setStage("done");
        break;
      case "error":
        setStage("");
        toast.error("Video generation failed: " + (message.message || "Unknown error"));
        break;
      case "parsing_pdf":
        setStage("parsing_pdf");
        if (message.pdf_url) setPdfUrl(message.pdf_url);
        break;
      case "summarizing":
        setStage("summarizing");
        if (message.chunk) setStreamingText((prev) => prev + message.chunk);
        break;
      case "storyboard_done":
        // Still "Planning scenes" in the progress bar until scenes start rendering.
        setStage("generating_storyboard");
        break;
      default:
        setStage(message.status);
    }
  });

  const reset = () => {
    setStage("");
    setStreamingText("");
    setPdfUrl("");
    setResult(EMPTY_RESULT);
  };

  const startGeneration = async (pdfFile) => {
    reset();
    setUploading(true);
    try {
      const paperId = await uploadPaper(pdfFile, await getToken());

      if (isSocketOpen(socket)) {
        sendSocketMessage(socket, { websocket_type: "generate_video", paper_id: paperId, skill_level: skillLevel });
        setStage("parsing_pdf");
      } else {
        toast.error("WebSocket not connected. Please refresh and try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload paper. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return { skillLevel, setSkillLevel, uploading, stage, pdfUrl, streamingText, result, startGeneration, reset };
};

export default useVideoGeneration;
