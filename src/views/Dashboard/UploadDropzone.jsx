import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { DocumentUploadIcon } from "../../components/common/Icons";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/** Dashed box that accepts a PDF by drag-and-drop or by clicking to browse. */
const UploadDropzone = ({ uploading, onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      } else {
        toast.error("Please upload a PDF file.");
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onClick={() => !uploading && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
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
        onChange={(event) => event.target.files[0] && onFileSelect(event.target.files[0])}
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
  );
};

export default UploadDropzone;
