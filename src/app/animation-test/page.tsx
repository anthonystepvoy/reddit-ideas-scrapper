'use client';

export default function StarOrbitVisualizer() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#111]">
      <div className="flex justify-center items-center w-full mb-4" style={{ height: 120 }}>
        <div className="relative" style={{ width: 120, height: 120 }}>
          <img
            src="/assets/ai-star.png"
            alt="AI Star (1)"
            className="ai-star ai-star-1"
            style={{
              position: 'absolute',
              left: 40,
              top: 40,
              width: 40,
              height: 40,
              zIndex: 1,
            }}
          />
          <img
            src="/assets/ai-star.png"
            alt="AI Star (2)"
            className="ai-star ai-star-2"
            style={{
              position: 'absolute',
              left: 40,
              top: 40,
              width: 40,
              height: 40,
              zIndex: 2,
            }}
          />
          <img
            src="/assets/ai-star.png"
            alt="AI Star (3)"
            className="ai-star ai-star-3"
            style={{
              position: 'absolute',
              left: 40,
              top: 40,
              width: 40,
              height: 40,
              zIndex: 3,
            }}
          />
          <style jsx>{`
            .ai-star-1 {
              animation: orbit-star-1 3.5s linear infinite;
            }
            .ai-star-2 {
              animation: orbit-star-2 3.5s linear infinite;
            }
            .ai-star-3 {
              animation: orbit-star-3 3.5s linear infinite;
            }
            @keyframes orbit-star-1 {
              0%   { transform: rotate(0deg)   translate(25px) scale(0.7) rotate(0deg); }
              25%  { transform: rotate(90deg)  translate(40px) scale(1.2) rotate(-90deg); }
              50%  { transform: rotate(180deg) translate(25px) scale(0.7) rotate(-180deg); }
              75%  { transform: rotate(270deg) translate(25px) scale(0.5) rotate(-270deg); }
              100% { transform: rotate(360deg) translate(25px) scale(0.7) rotate(-360deg); }
            }
            @keyframes orbit-star-2 {
              0%   { transform: rotate(120deg)  translate(25px) scale(0.7) rotate(-120deg); }
              25%  { transform: rotate(210deg)  translate(40px) scale(1.2) rotate(-210deg); }
              50%  { transform: rotate(300deg)  translate(25px) scale(0.7) rotate(-300deg); }
              75%  { transform: rotate(390deg)  translate(25px) scale(0.5) rotate(-390deg); }
              100% { transform: rotate(480deg)  translate(25px) scale(0.7) rotate(-480deg); }
            }
            @keyframes orbit-star-3 {
              0%   { transform: rotate(240deg)  translate(25px) scale(0.7) rotate(-240deg); }
              25%  { transform: rotate(330deg)  translate(40px) scale(1.2) rotate(-330deg); }
              50%  { transform: rotate(420deg)  translate(25px) scale(0.7) rotate(-420deg); }
              75%  { transform: rotate(510deg)  translate(25px) scale(0.5) rotate(-510deg); }
              100% { transform: rotate(600deg)  translate(25px) scale(0.7) rotate(-600deg); }
            }
          `}</style>
        </div>
      </div>
      <div className="text-white mt-4">Star Orbit Animation Visualizer</div>
    </div>
  );
} 