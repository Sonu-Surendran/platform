import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface PacManGameProps {
    onClose: () => void;
}

export const PacManGame: React.FC<PacManGameProps> = ({ onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);

    // Game Constants
    const TILE_SIZE = 20;
    const ROWS = 15;
    const COLS = 15;
    const MOVE_SPEED = 2; // Pixels per frame (at 60fps)

    // Game State Refs
    // Positions are now in PIXELS
    const pacmanRef = useRef({ x: TILE_SIZE, y: TILE_SIZE, dx: 0, dy: 0, nextDx: 0, nextDy: 0 });
    const ghostRef = useRef({ x: 13 * TILE_SIZE, y: 13 * TILE_SIZE, dx: 0, dy: 0, color: 'red' });
    const dotsRef = useRef<{ c: number; r: number }[]>([]); // Grid coordinates
    const wallsRef = useRef<{ c: number; r: number }[]>([]); // Grid coordinates
    const rafRef = useRef<number>();

    const LEVEL = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 0, 1, 9, 1, 0, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    const isWall = (c: number, r: number) => {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
        return LEVEL[r][c] === 1;
    };

    // Initialize Game
    useEffect(() => {
        // Reset positions/state on mount/restart
        pacmanRef.current = { x: TILE_SIZE, y: TILE_SIZE, dx: 0, dy: 0, nextDx: 0, nextDy: 0 };
        ghostRef.current = { x: 13 * TILE_SIZE, y: 13 * TILE_SIZE, dx: 0, dy: 0, color: 'red' };

        const dots = [];
        const walls = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (LEVEL[r][c] === 1) walls.push({ c, r });
                if (LEVEL[r][c] === 0) dots.push({ c, r });
            }
        }
        dotsRef.current = dots;
        wallsRef.current = walls;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': pacmanRef.current.nextDx = 0; pacmanRef.current.nextDy = -1; break;
                case 'ArrowDown': pacmanRef.current.nextDx = 0; pacmanRef.current.nextDy = 1; break;
                case 'ArrowLeft': pacmanRef.current.nextDx = -1; pacmanRef.current.nextDy = 0; break;
                case 'ArrowRight': pacmanRef.current.nextDx = 1; pacmanRef.current.nextDy = 0; break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const gameLoop = () => {
            if (gameOver || win) return;
            update();
            draw();
            rafRef.current = requestAnimationFrame(gameLoop);
        };

        rafRef.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [gameOver, win]);

    const update = () => {
        moveEntity(pacmanRef.current, true);
        moveGhost(ghostRef.current);

        const pac = pacmanRef.current;

        // Check collisions
        // Dot Eating (Distance check)
        const pacCx = pac.x + TILE_SIZE / 2;
        const pacCy = pac.y + TILE_SIZE / 2;

        const dotIndex = dotsRef.current.findIndex(d => {
            const dotCx = d.c * TILE_SIZE + TILE_SIZE / 2;
            const dotCy = d.r * TILE_SIZE + TILE_SIZE / 2;
            return Math.abs(pacCx - dotCx) < 5 && Math.abs(pacCy - dotCy) < 5;
        });

        if (dotIndex !== -1) {
            dotsRef.current.splice(dotIndex, 1);
            setScore(s => s + 10);
            if (dotsRef.current.length === 0) setWin(true);
        }

        // Ghost Collision
        const ghost = ghostRef.current;
        if (Math.hypot(pac.x - ghost.x, pac.y - ghost.y) < TILE_SIZE - 5) {
            setGameOver(true);
        }
    };

    const moveEntity = (entity: any, isPlayer: boolean) => {
        // Current Grid Pos
        const col = Math.round(entity.x / TILE_SIZE);
        const row = Math.round(entity.y / TILE_SIZE);

        // Exact match check (are we perfectly centered on a tile?)
        const centeredX = Math.abs(entity.x - col * TILE_SIZE) < MOVE_SPEED;
        const centeredY = Math.abs(entity.y - row * TILE_SIZE) < MOVE_SPEED;
        const isCentered = centeredX && centeredY;

        if (isCentered) {
            // Correct drifting for perfect centering
            entity.x = col * TILE_SIZE;
            entity.y = row * TILE_SIZE;

            if (isPlayer) {
                // Try to turn
                if (entity.nextDx !== 0 || entity.nextDy !== 0) {
                    if (!isWall(col + entity.nextDx, row + entity.nextDy)) {
                        entity.dx = entity.nextDx;
                        entity.dy = entity.nextDy;
                        entity.nextDx = 0;
                        entity.nextDy = 0;
                    }
                }
            }

            // Stop if hitting wall ahead
            if (isWall(col + entity.dx, row + entity.dy)) {
                entity.dx = 0;
                entity.dy = 0;
            }
        }

        entity.x += entity.dx * MOVE_SPEED;
        entity.y += entity.dy * MOVE_SPEED;
    };

    const moveGhost = (ghost: any) => {
        // Current Grid Pos
        const col = Math.round(ghost.x / TILE_SIZE);
        const row = Math.round(ghost.y / TILE_SIZE);

        const centeredX = Math.abs(ghost.x - col * TILE_SIZE) < MOVE_SPEED;
        const centeredY = Math.abs(ghost.y - row * TILE_SIZE) < MOVE_SPEED;

        if (centeredX && centeredY) {
            ghost.x = col * TILE_SIZE;
            ghost.y = row * TILE_SIZE;

            // Simple Random AI or Chasing
            // Only change direction at intersections
            const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
            const validMoves = dirs.filter(d => !isWall(col + d.dx, row + d.dy));

            // Don't reverse immediately if possible
            const forwardMoves = validMoves.filter(d => d.dx !== -ghost.dx || d.dy !== -ghost.dy);
            const options = forwardMoves.length > 0 ? forwardMoves : validMoves;

            if (options.length > 0) {
                // Pick random valid move
                const move = options[Math.floor(Math.random() * options.length)];
                ghost.dx = move.dx;
                ghost.dy = move.dy;
            } else {
                // Dead end
                ghost.dx = 0;
                ghost.dy = 0;
            }
        }

        ghost.x += ghost.dx * MOVE_SPEED;
        ghost.y += ghost.dy * MOVE_SPEED;
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Walls
        ctx.fillStyle = '#00ADB5';
        wallsRef.current.forEach(w => {
            ctx.fillRect(w.c * TILE_SIZE, w.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });

        // Dots
        ctx.fillStyle = '#FFD700';
        dotsRef.current.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.c * TILE_SIZE + TILE_SIZE / 2, d.r * TILE_SIZE + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Pacman
        ctx.fillStyle = '#FFFF00';
        const pac = pacmanRef.current;
        ctx.beginPath();
        // Simple mouth animation based on time? 
        // For now just open mouth in direction
        const mouthAngle = 0.2 * Math.PI;
        let startAngle = mouthAngle;
        let endAngle = 2 * Math.PI - mouthAngle;

        if (pac.dx === -1) { startAngle = Math.PI + mouthAngle; endAngle = Math.PI - mouthAngle; }
        if (pac.dy === -1) { startAngle = -Math.PI / 2 + mouthAngle; endAngle = -Math.PI / 2 - mouthAngle; }
        if (pac.dy === 1) { startAngle = Math.PI / 2 + mouthAngle; endAngle = Math.PI / 2 - mouthAngle; }

        ctx.arc(pac.x + TILE_SIZE / 2, pac.y + TILE_SIZE / 2, TILE_SIZE / 2 - 2, startAngle, endAngle);
        ctx.lineTo(pac.x + TILE_SIZE / 2, pac.y + TILE_SIZE / 2);
        ctx.fill();

        // Ghost
        ctx.fillStyle = ghostRef.current.color;
        const ghost = ghostRef.current;
        ctx.beginPath();
        ctx.arc(ghost.x + TILE_SIZE / 2, ghost.y + TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-slate-900 border-2 border-charcoal-brand rounded-2xl p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X />
                </button>

                <h2 className="text-2xl font-bold text-center text-charcoal-brand mb-4 pixel-font">PAC-MAN</h2>

                <canvas
                    ref={canvasRef}
                    width={COLS * TILE_SIZE}
                    height={ROWS * TILE_SIZE}
                    className="bg-black border border-slate-700 rounded mx-auto"
                />

                <div className="mt-4 flex justify-between items-center text-white">
                    <p className="font-mono text-xl">Score: {score}</p>
                    <div className="text-right">
                        {gameOver && <p className="text-red-500 font-bold animate-pulse">GAME OVER</p>}
                        {win && <p className="text-green-500 font-bold animate-pulse">YOU WIN!</p>}
                        {(!gameOver && !win) && <p className="text-slate-400 text-xs">Arrow Keys to Move</p>}
                    </div>
                </div>

                {(gameOver || win) && (
                    <button
                        onClick={() => {
                            setGameOver(false);
                            setWin(false);
                            setScore(0);
                            // Force re-render/useEffect
                        }}
                        className="mt-4 w-full py-2 bg-charcoal-brand text-slate-900 font-bold rounded hover:bg-cyan-400 transition-colors"
                    >
                        Play Again
                    </button>
                )}
            </div>
        </div>
    );
};
