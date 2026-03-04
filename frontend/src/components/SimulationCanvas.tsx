import React, { useEffect, useRef } from 'react';
import { CollisionEngine } from '../physics/collisionEngine';

interface SimulationCanvasProps {
    engineRef: React.MutableRefObject<CollisionEngine | null>;
    onCollisionUpdate: (collisions: number) => void;
    isPlaying: boolean;
    playbackSpeed: number;
    onFinish?: () => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
    engineRef,
    onCollisionUpdate,
    isPlaying,
    playbackSpeed,
    onFinish
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = (time: number) => {
            // Calculate delta time in seconds
            if (lastTimeRef.current === 0) lastTimeRef.current = time;
            let dt = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            // Update physics if playing OR if the math is completely finished (so they can glide)
            const engine = engineRef.current;
            if (engine && isPlaying) {
                // limit dt to avoid huge jumps on tab switch
                if (dt > 0.1) dt = 0.1;

                let prevCollisions = engine.collisions;
                // Use much fewer substeps if finished (gliding) or a reasonable amount for active simulation
                const timeSteps = engine.isFinished ? 1 : Math.min(2000, 500 * Math.max(1, playbackSpeed));
                engine.update(dt * playbackSpeed, timeSteps);

                // Only update react state if collisions changed to avoid too many re-renders
                if (engine.collisions !== prevCollisions) {
                    onCollisionUpdate(engine.collisions);
                }

                // Simulation is truly "done" for the UI when both blocks move far off screen to the right
                const isOffScreen = engine.x1 > canvas.width && engine.x2 > canvas.width;
                if (isOffScreen) {
                    onFinish?.();
                }
            }

            // Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Space Background / Floor
            const floorY = canvas.height - 40;
            ctx.fillStyle = '#022c22'; // emerald-950
            ctx.fillRect(0, 0, canvas.width, canvas.height); // background

            ctx.fillStyle = '#064e3b'; // emerald-900
            ctx.fillRect(0, floorY, canvas.width, 40);

            // Draw Left Wall
            const wallX = 50;
            ctx.fillStyle = '#065f46'; // emerald-800
            ctx.fillRect(0, 0, wallX, canvas.height);

            // Removed the Right Wall constraint as requested

            if (engine) {
                // Draw Block 1 (Small Block)
                ctx.fillStyle = '#f87171'; // red-400
                const b1Size = engine.w1;
                ctx.fillRect(engine.x1, floorY - b1Size, b1Size, b1Size);

                // Draw Block 2 (Large Block)
                ctx.fillStyle = '#ef4444'; // red-500
                const b2Size = engine.w2;
                ctx.fillRect(engine.x2, floorY - b2Size, b2Size, b2Size);

                // Draw Text / mass sizes
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                if (b1Size > 20) {
                    ctx.fillText(`${engine.m1}kg`, engine.x1 + b1Size / 2, floorY - b1Size / 2);
                }
                if (b2Size > 20 && engine.x2 <= canvas.width) {
                    ctx.fillText(`${engine.m2}kg`, engine.x2 + b2Size / 2, floorY - b2Size / 2);
                }

                // If block 2 completely exits the screen, draw an indicator 
                // so we still know it's sliding away
                if (engine.x2 > canvas.width) {
                    const indW = 150;
                    const indH = 32;
                    const indX = canvas.width - indW;
                    const indY = floorY - 40;

                    ctx.fillStyle = '#ef4444'; // red-500
                    // Semi-transparent to make it look like a HUD element
                    ctx.globalAlpha = 0.8;

                    // Draw a little tab shape
                    ctx.beginPath();
                    ctx.moveTo(indX, indY);
                    ctx.lineTo(indX + indW, indY);
                    ctx.lineTo(indX + indW, indY + indH);
                    ctx.lineTo(indX + 15, indY + indH);
                    ctx.lineTo(indX, indY + indH / 2);
                    ctx.fill();

                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 13px sans-serif';
                    ctx.textAlign = 'center';
                    // Show velocity pointing right with an arrow
                    ctx.fillText(`M2 \u2192 ${engine.v2.toFixed(1)} m/s`, indX + indW / 2 + 5, indY + indH / 2);
                }
            }

            requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [engineRef, isPlaying, playbackSpeed, onCollisionUpdate, onFinish]);

    // Handle resizing
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas && canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = Math.max(400, canvas.parentElement.clientHeight);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-full h-full relative border border-emerald-800/50 rounded-3xl overflow-hidden bg-emerald-950 shadow-xl shadow-emerald-900/20">
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};
