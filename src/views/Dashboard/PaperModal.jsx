import { useEffect, useState } from "react";
import { mediaUrl } from "../../config/api";
import { CloseIcon } from "../../components/common/Icons";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/** Full-screen overlay showing the original PDF. */
const PaperModal = ({ pdfUrl, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);

  // Load the PDF as a blob so the browser's viewer opens it inline instead of downloading it.
  useEffect(() => {
    let createdUrl = null;
    fetch(mediaUrl(pdfUrl))
      .then((response) => response.blob())
      .then((blob) => {
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      })
      .catch(() => {});
    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
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
          <iframe
            src={blobUrl + "#toolbar=0&navpanes=0&scrollbar=1"}
            title="Research Paper"
            className="w-full"
            style={{ height: "calc(85vh - 48px)" }}
          />
        ) : (
          <div className="flex items-center justify-center" style={{ height: "calc(85vh - 48px)" }}>
            <LoadingSpinner className="h-8 w-8 text-indigo-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperModal;
