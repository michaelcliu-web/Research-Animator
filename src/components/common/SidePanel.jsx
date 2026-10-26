import { CloseIcon } from "./Icons";

/**
 * Fixed-size panel shown beside a video in the feed. Wheel events are stopped
 * so scrolling inside the panel doesn't scroll the feed to the next video.
 */
const SidePanel = ({ title, headerExtra = null, onClose, children }) => (
  <div
    className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex-shrink-0"
    style={{ width: "300px", height: "min(580px, 70vh)" }}
    onWheel={(e) => e.stopPropagation()}
  >
    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <div className="flex items-center gap-2">
        {headerExtra}
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>
  </div>
);

export default SidePanel;
