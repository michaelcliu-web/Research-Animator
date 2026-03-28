import { useState } from "react";

const TermsOfService = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using this application ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

These Terms of Service ("Terms") govern your use of the website and services operated by us ("we," "us," or "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.`,
    },
    {
      title: "2. Description of Service",
      content: `The Service provides a platform with various features and tools. The specific features available may vary based on your subscription plan.

The Service is provided for informational and productivity purposes. We do not guarantee specific outcomes from using the Service.`,
    },
    {
      title: "3. User Accounts and Registration",
      content: `To access certain features of the Service, you must register for an account. When you create an account, you must provide information that is accurate, complete, and current at all times.

You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.

You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.`,
    },
    {
      title: "4. Privacy and Data Protection",
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree that we can collect and use such information in accordance with our Privacy Policy.

We implement appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information and data stored on our Service.`,
    },
    {
      title: "5. Content and Data Usage",
      content: `The content on the Service is provided for informational purposes only. This content is:

• Aggregated and anonymized to protect individual privacy
• Intended for personal, non-commercial use
• Subject to intellectual property protections
• Not to be redistributed or resold without explicit permission

You may not use automated systems (bots, scrapers, etc.) to access or extract data from our Service without our written consent.`,
    },
    {
      title: "6. User-Generated Content",
      content: `When you submit content to the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and display such content for the purposes of operating and improving our Service.

You represent and warrant that:
• You own or have the necessary rights to submit the content
• The content does not violate any third-party rights
• The content is accurate and not misleading
• The content complies with applicable laws and these Terms

We reserve the right to remove any content that violates these Terms or our community guidelines.`,
    },
    {
      title: "7. Prohibited Uses",
      content: `You may not use our Service:

• For any unlawful purpose or to solicit others to perform unlawful acts
• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
• To infringe upon or violate our intellectual property rights or the intellectual property rights of others
• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
• To submit false or misleading information
• To upload or transmit viruses or any other type of malicious code
• To spam, phish, pharm, pretext, spider, crawl, or scrape
• For any obscene or immoral purpose
• To interfere with or circumvent the security features of the Service

We reserve the right to terminate your use of the Service for violating any of the prohibited uses.`,
    },
    {
      title: "8. Subscription and Payment Terms",
      content: `Some features of our Service may require payment of fees. When you purchase a subscription or paid feature:

• Fees are charged in advance on a recurring basis for subscription services
• All fees are non-refundable unless otherwise specified
• You authorize us to charge your payment method for applicable fees
• Subscription fees may change with 30 days' notice
• You may cancel your subscription at any time, but no partial refunds will be provided

Failure to pay applicable fees may result in suspension or termination of your access to paid features.`,
    },
    {
      title: "9. Disclaimers and Limitations",
      content: `The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company:

• Excludes all representations and warranties relating to this website and its contents
• Excludes all liability for damages arising out of or in connection with your use of this website

We do not guarantee the accuracy, completeness, or usefulness of any information on the Service. We are not responsible for any errors or omissions, or for any outcomes resulting from the use of this information.`,
    },
    {
      title: "10. Indemnification",
      content: `You agree to defend, indemnify, and hold harmless the Company, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with:

• Your access to or use of the Service
• Your violation of these Terms
• Your violation of any third-party rights
• Any content you submit to the Service

This indemnification obligation will survive the termination of your account or these Terms.`,
    },
    {
      title: "11. Termination",
      content: `We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.

If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.

Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive termination.`,
    },
    {
      title: "12. Changes to Terms",
      content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.

What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.`,
    },
    {
      title: "13. Governing Law",
      content: `These Terms shall be interpreted and governed by the laws of the State of New Jersey, United States, without regard to its conflict of law provisions.

Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.`,
    },
    {
      title: "14. Contact Information",
      content: `If you have any questions about these Terms of Service, please contact us at:

Email: support@example.com`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-lg sm:text-xl font-bold text-gray-800">‹</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">My App</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-black">Login</span>
              </div>
            </a>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <a
                href="/privacypolicy"
                className="px-2 py-1.5 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-900 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                Privacy
              </a>
              <a className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white text-blue-900 shadow-sm rounded-md text-xs sm:text-sm font-medium">
                Terms
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4 sm:px-0">
            By using our service, you agree to be bound by these terms.
          </p>
          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500">
            Last updated: December 2024
          </div>
        </div>

        {/* Terms Sections */}
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
};



export default TermsOfService;
