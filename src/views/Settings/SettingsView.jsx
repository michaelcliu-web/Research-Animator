import { UserIcon } from "../../components/common/Icons";

const ABOUT_ROWS = [
  ["App", "Reel Research"],
  ["Animation engine", "Manim (3Blue1Brown)"],
  ["Summary model", "Claude Haiku"],
  ["Animation model", "Claude Opus"],
  ["Narration", "ElevenLabs TTS"],
  ["Video format", "9:16 vertical (Reels / Shorts)"],
];

const SettingsView = () => (
  <div className="bg-gray-50 min-h-screen px-6 py-8">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Settings</h2>
      <p className="text-sm text-gray-500 mb-6">Manage your account and preferences</p>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Account</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium">Signed in via Clerk</p>
              <p className="text-xs text-gray-400 mt-0.5">Manage your account from the sidebar</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">About</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {ABOUT_ROWS.map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsView;
