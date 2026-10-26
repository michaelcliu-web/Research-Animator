import { useState } from "react";
import toast from "react-hot-toast";
import { EXAMPLE_PAPERS, examplePaperUrl } from "../../config/constants";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/** Grid of bundled classic papers; clicking one submits it like an upload. */
const ExamplePapers = ({ uploading, onFileSelect }) => {
  const [loadingFile, setLoadingFile] = useState(null);

  const selectExample = async (paper) => {
    if (uploading || loadingFile) return;
    setLoadingFile(paper.file);
    try {
      const response = await fetch(examplePaperUrl(paper.file));
      const blob = await response.blob();
      onFileSelect(new File([blob], paper.file, { type: "application/pdf" }));
    } catch {
      toast.error("Failed to load example paper.");
    } finally {
      setLoadingFile(null);
    }
  };

  return (
    <div className="mt-8">
      <p className="text-sm font-medium text-gray-500 mb-3">Or try a classic paper</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {EXAMPLE_PAPERS.map((paper) => (
          <button
            key={paper.file}
            onClick={() => selectExample(paper)}
            disabled={uploading || !!loadingFile}
            className={`group bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:border-indigo-300 hover:shadow-md transition-all ${
              loadingFile === paper.file ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <div className="relative bg-gray-100 overflow-hidden" style={{ height: "180px" }}>
              {/* First page preview: rendered at 2x size and scaled down to fit the card. */}
              <iframe
                src={`${examplePaperUrl(paper.file)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                title={paper.title}
                className="w-[200%] h-[200%] origin-top-left pointer-events-none"
                style={{ transform: "scale(0.5)" }}
                tabIndex={-1}
              />
              <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-600/5 transition-colors" />
              {loadingFile === paper.file && (
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
  );
};

export default ExamplePapers;
