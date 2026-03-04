import { useState, useRef, useCallback } from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { SettingsPanel } from './components/SettingsPanel';
import { CollisionCounter } from './components/CollisionCounter';
import { CollisionEngine } from './physics/collisionEngine';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [collisions, setCollisions] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(3);
  const engineRef = useRef<CollisionEngine | null>(null);

  const startSimulation = useCallback((mass1: number, mass2: number) => {
    // 100^d masses mean ratio is 1:m2/m1. Wait, for pi, digits are given by d, 
    // collisions = pi * 10^(d-1) for masses m1=1, m2=100^(d-1)

    // Set dynamic widths based on mass so they look good but don't blow out proportion
    const logM2 = Math.log10(mass2);
    const w1 = 30;
    const w2 = Math.min(30 + logM2 * 20, 150);

    // Set initial positions. Block sizes:
    const startX1 = 200;
    const startX2 = startX1 + w1 + 100;

    // We pass velocity = -50 or similar initially
    // Since mass ratio is huge, velocity change is huge, so let's pick v2=-50
    // Actually, v2 = -1 is classic, and speeds up 100x every digit. But it's visual, so base speed logic:
    let initialV2 = -50;

    // Initializing the engine
    engineRef.current = new CollisionEngine(mass1, mass2, initialV2, startX1, startX2, w1, w2, 50);
    setCollisions(0);
    setIsPlaying(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setIsPlaying(false);
    if (engineRef.current) {
      // stop where it is, or we can reset
    }
  }, []);

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };
  // -------------------------------------------------------------------
  // Backend verification helper – now mobile‑friendly and error‑safe
  // -------------------------------------------------------------------
  const handleBackendVerify = async (mass1: number, mass2: number): Promise<string> => {
    try {
      // Use a relative URL so Vercel proxies to the Render backend
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ massA: mass1, massB: mass2 }),
      });

      if (!response.ok) {
        // Propagate HTTP errors (e.g., 500, 404) as a readable message
        throw new Error(`Server error: ${response.status}`);
      }

      // Parse the JSON payload returned by the backend
      const data = await response.json();

      // The backend returns { collisions: <number> }
      return data.collisions !== undefined
        ? data.collisions.toString()
        : 'Unexpected response';
    } catch (e) {
      console.error('Backend verification failed:', e);
      return 'Failed to connect';
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 flex flex-col md:flex-row p-6 gap-6 font-sans">
      <div className="flex-1 max-w-[1400px] mx-auto w-full flex flex-col md:flex-row gap-6">

        {/* Left column: main stage */}
        <div className="flex-1 flex flex-col gap-4 relative order-2 md:order-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-500">
              Pi Collision Simulator
            </h1>
          </div>
          <p className="text-emerald-300 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            A beautiful demonstration of how perfectly elastic collisions between two blocks
            and a wall can compute the digits of pi. Adjust the target digits, and watch math in motion.
          </p>

          <div className="flex-1 relative min-h-[400px]">
            <CollisionCounter collisions={collisions} />
            <SimulationCanvas
              engineRef={engineRef}
              onCollisionUpdate={setCollisions}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onFinish={stopSimulation}
            />
          </div>
        </div>

        {/* Right column: settings */}
        <div className="order-1 md:order-2 shrink-0 flex items-start">
          <SettingsPanel
            onStartSimulation={startSimulation}
            onStop={stopSimulation}
            isPlaying={isPlaying}
            speedMultiplier={playbackSpeed}
            onSpeedChange={handleSpeedChange}
            backendVerification={handleBackendVerify}
          />
        </div>

      </div>
    </div>
  );
}

export default App;
