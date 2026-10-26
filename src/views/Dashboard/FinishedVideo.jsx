import { motion } from "framer-motion";
import { mediaUrl } from "../../config/api";
import { DownloadIcon } from "../../components/common/Icons";

/** The generated video with Download and "Generate another" buttons. */
const FinishedVideo = ({ videoUrl, onReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 flex flex-col items-center"
  >
    <div className="bg-black rounded-2xl overflow-hidden shadow-lg" style={{ width: "min(100%, 360px)", aspectRatio: "9/16" }}>
      <video src={mediaUrl(videoUrl)} controls autoPlay className="w-full h-full object-contain" />
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
);

export default FinishedVideo;
