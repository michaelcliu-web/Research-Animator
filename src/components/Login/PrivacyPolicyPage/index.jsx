import { useState } from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      title: "Information We Collect",
      content: `PERSONAL INFORMATION:
• Account details (email, password)
• Educational data (when provided)

TECHNICAL DATA:
• Cookies and session data
• Platform analytics`,
    },
    {
      title: "How We Use Your Information",
      content: `We use your information to:
• Provide and improve our services
• Personalize your experience
• Process transactions
• Send important updates
• Analyze usage patterns to improve the platform`,
    },
    {
      title: "Contact Us",
      content: `Questions about this Privacy Policy:

Email: support@example.com`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-lg sm:text-xl font-bold text-gray-800">‹</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">My App</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-black">Login</span>
              </div>
            </Link>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <Link
                to="/privacypolicy"
                className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white text-blue-900 shadow-sm rounded-md text-xs sm:text-sm font-medium"
              >
                Privacy
              </Link>
              <Link 
                to="/termsofservice"
                className="px-2 py-1.5 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-900 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4 sm:px-0">
            How we collect, use, and protect your personal information.
          </p>

          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500">
            Last Updated: June 9, 2025
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-3 sm:space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              id={`section-${index}`}
              className="overflow-hidden border border-gray-200 rounded-lg sm:rounded-xl"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full text-left px-4 sm:px-6 py-3 sm:py-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 pr-2">
                    {section.title}
                  </h3>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform flex-shrink-0 ${
                      expandedSection === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {expandedSection === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 mt-2">
                  <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 sm:mt-16 rounded-lg sm:rounded-xl p-6 sm:p-8 bg-gray-50 text-black text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Questions?</h2>
          <p className="text-sm sm:text-base text-black break-all sm:break-normal">
            Contact support@example.com
          </p>
        </div>
      </div>
    </div>
  );
}