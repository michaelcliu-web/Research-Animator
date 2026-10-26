import { useState } from "react";
import { DocumentIcon } from "../../components/common/Icons";
import ExamplePapers from "./ExamplePapers";
import FinishedVideo from "./FinishedVideo";
import { PdfPreview, RenderingNotice, SummaryPanel } from "./GenerationProgress";
import PaperModal from "./PaperModal";
import SkillLevelPicker from "./SkillLevelPicker";
import StageIndicator from "./StageIndicator";
import StudyMaterialCards from "./StudyMaterialCards";
import UploadDropzone from "./UploadDropzone";

// Stages after the summary starts streaming, during which it stays on screen.
const SUMMARY_VISIBLE_STAGES = [
  "summarizing",
  "summarizing_done",
  "generating_storyboard",
  "processing_scene",
  "concatenating",
  "done",
];

/**
 * Upload page. While idle it shows the upload options; during a run it shows
 * progress; when done it shows the video and its study materials.
 * All generation state comes from useVideoGeneration via props.
 */
const DashboardView = ({
  stage,
  pdfUrl,
  streamingText,
  result,
  uploading,
  skillLevel,
  onSkillLevelChange,
  onFileSelect,
  onReset,
}) => {
  const [showPaperModal, setShowPaperModal] = useState(false);

  const isIdle = !stage;
  const isReadingPdf = stage === "parsing_pdf";
  const isRendering = stage === "processing_scene" || stage === "concatenating";
  const isDone = stage === "done";

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-8 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isDone ? "Your video is ready" : isIdle ? "Reel Research" : "Generating your video"}
            </h2>
            {isIdle && <p className="text-sm text-gray-500 mt-1">Turn any research paper into an animated explainer video</p>}
          </div>
          {pdfUrl && !isReadingPdf && (
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

        {isIdle && (
          <>
            <SkillLevelPicker skillLevel={skillLevel} onChange={onSkillLevelChange} />
            <UploadDropzone uploading={uploading} onFileSelect={onFileSelect} />
            <ExamplePapers uploading={uploading} onFileSelect={onFileSelect} />
          </>
        )}

        {isReadingPdf && pdfUrl && <PdfPreview pdfUrl={pdfUrl} />}

        {isDone && result.videoUrl && <FinishedVideo videoUrl={result.videoUrl} onReset={onReset} />}

        <StudyMaterialCards
          keyTakeaways={result.keyTakeaways}
          quiz={result.quiz}
          suggestedPapers={result.suggestedPapers}
        />

        {SUMMARY_VISIBLE_STAGES.includes(stage) && (
          <SummaryPanel text={streamingText} isStreaming={stage === "summarizing"} />
        )}

        {isRendering && <RenderingNotice />}
      </div>

      {showPaperModal && pdfUrl && <PaperModal pdfUrl={pdfUrl} onClose={() => setShowPaperModal(false)} />}
    </div>
  );
};

export default DashboardView;
