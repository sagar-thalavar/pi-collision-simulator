import React from 'react';

interface CollisionCounterProps {
    collisions: number;
}

export const CollisionCounter: React.FC<CollisionCounterProps> = ({ collisions }) => {
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-emerald-900/60 backdrop-blur-md px-8 py-4 rounded-3xl border border-emerald-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col items-center transition-all">
            <span className="text-emerald-500 text-sm font-bold tracking-widest uppercase mb-1">
                Collisions
            </span>
            <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-red-400 via-rose-500 to-red-600">
                {collisions.toLocaleString()}
            </span>
        </div>
    );
};
