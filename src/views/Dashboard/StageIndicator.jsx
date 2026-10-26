import React from "react";
import { GENERATION_STAGES } from "../../config/constants";

/** Row of dots showing which pipeline stage the current video is in. */
const StageIndicator = ({ currentStage }) => {
  const currentIndex = GENERATION_STAGES.findIndex((stage) => stage.key === currentStage);

  return (
    <div className="flex items-center gap-2">
      {GENERATION_STAGES.map((stage, index) => {
        const isDone = currentIndex >= 0 && index < currentIndex;
        // "summarizing_done" still highlights the "summarizing" dot.
        const isCurrent = stage.key === currentStage || stage.key + "_done" === currentStage;
        return (
          <React.Fragment key={stage.key}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  isDone ? "bg-green-500" : isCurrent ? "bg-indigo-600 animate-pulse" : "bg-gray-300"
                }`}
              />
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isDone ? "text-green-600" : isCurrent ? "text-indigo-700" : "text-gray-400"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {index < GENERATION_STAGES.length - 1 && (
              <div className={`w-6 h-px flex-shrink-0 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StageIndicator;
