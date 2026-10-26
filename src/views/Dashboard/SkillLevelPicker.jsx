import { SKILL_LEVELS } from "../../config/constants";

/** Segmented control for how simply the video should explain the paper. */
const SkillLevelPicker = ({ skillLevel, onChange }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-sm font-medium text-gray-500">Explanation level</span>
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
      {SKILL_LEVELS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 transition-colors ${
            skillLevel === value ? "bg-indigo-600 text-white font-semibold" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default SkillLevelPicker;
