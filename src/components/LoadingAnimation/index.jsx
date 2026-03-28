import React from 'react';

const LoadingAnimation = () => {
  // Adjust this scale factor to make the animation bigger or smaller
  const scale = 0.25;

  return (
    <div>
      <div className="relative" style={{ width: `${280 * scale}px`, height: `${400 * scale}px` }}>
        {/* Bar 1 */}
        <div
          className="w-12 bg-[#0f4d92] shadow-lg absolute transform skew-y-12"
          style={{
            width: `${48 * scale}px`,
            height: `${80 * scale}px`,
            bottom: `${140 * scale}px`,
            left: `${0 * scale}px`,
            animation: 'bounce 1.5s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />

        {/* Bar 2 */}
        <div
          className="w-12 bg-black shadow-lg absolute transform skew-y-12"
          style={{
            width: `${48 * scale}px`,
            height: `${80 * scale}px`,
            bottom: `${200 * scale}px`,
            left: `${70 * scale}px`,
            animation: 'bounce2 1.5s ease-in-out infinite',
            animationDelay: '0.2s'
          }}
        />

        {/* Bar 3 */}
        <div
          className="w-12 bg-[#0f4d92] shadow-lg absolute transform skew-y-12"
          style={{
            width: `${48 * scale}px`,
            height: `${130 * scale}px`,
            bottom: `${100 * scale}px`,
            left: `${140 * scale}px`,
            animation: 'bounce3 1.5s ease-in-out infinite',
            animationDelay: '0.4s'
          }}
        />

        {/* Bar 4 */}
        <div
          className="w-12 bg-[#0f4d92] shadow-lg absolute transform skew-y-12"
          style={{
            width: `${48 * scale}px`,
            height: `${200 * scale}px`,
            bottom: `${0 * scale}px`,
            left: `${210 * scale}px`,
            animation: 'bounce4 1.5s ease-in-out infinite',
            animationDelay: '0.6s'
          }}
        />

        {/* Bar 5 */}
        <div
          className="w-12 bg-black shadow-lg absolute transform skew-y-12"
          style={{
            width: `${48 * scale}px`,
            height: `${280 * scale}px`,
            bottom: `${70 * scale}px`,
            left: `${280 * scale}px`,
            animation: 'bounce5 1.5s ease-in-out infinite',
            animationDelay: '0.8s'
          }}
        />
      </div>

      <style>{`
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0) skewY(12deg);
    }
    50% {
      transform: translateY(-${100 * scale}px) skewY(12deg);
    }
  }

  @keyframes bounce2 {
    0%, 100% {
      transform: translateY(0) skewY(12deg);
    }
    50% {
      transform: translateY(-${90 * scale}px) skewY(12deg);
    }
  }

  @keyframes bounce3 {
    0%, 100% {
      transform: translateY(0) skewY(12deg);
    }
    50% {
      transform: translateY(-${80 * scale}px) skewY(12deg);
    }
  }

  @keyframes bounce4 {
    0%, 100% {
      transform: translateY(0) skewY(12deg);
    }
    50% {
      transform: translateY(-${60 * scale}px) skewY(12deg);
    }
  }

  @keyframes bounce5 {
    0%, 100% {
      transform: translateY(0) skewY(12deg);
    }
    50% {
      transform: translateY(-${40 * scale}px) skewY(12deg);
    }
  }
`}</style>

    </div>
  );
};

export default LoadingAnimation;