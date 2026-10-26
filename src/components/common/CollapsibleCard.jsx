import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "./Icons";

/** White card with a clickable header that expands/collapses its body. */
const CollapsibleCard = ({ title, headerExtra = null, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
    >
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <div className="flex items-center gap-2">
          {headerExtra}
          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </motion.div>
  );
};

export default CollapsibleCard;
