import React from "react";
import { ArrowLeft } from "lucide-react";
import GameRewardModal from "./GameRewardModal";

export default function CanvasGameShell({
  title,
  titleIcon: TitleIcon,
  titleIconClassName = "text-emerald-600",
  score,
  timeLeft,
  backgroundClassName = "bg-slate-50",
  headerBorderClassName = "border-slate-200",
  canvasCardBorderClassName = "border-slate-200",
  canvasBackgroundClassName = "bg-slate-50",
  canvasRef,
  onBack,
  onEndGame,
  endButtonLabel = "End Game",
  gameOver,
  modalProps,
  debugPanel,
}) {
  return (
    <div className={`min-h-screen p-4 ${backgroundClassName}`}>
      <div className="max-w-4xl mx-auto space-y-4">
        <div className={`bg-white rounded-2xl border p-4 flex items-center justify-between ${headerBorderClassName}`}>
          <h1 className="text-xl font-bold text-slate-800 inline-flex items-center gap-2">
            {TitleIcon ? <TitleIcon className={`w-5 h-5 ${titleIconClassName}`} /> : null}
            {title}
          </h1>
          <div className="text-sm font-semibold text-slate-600">Score: {score} | Time: {timeLeft}s</div>
        </div>
        <div className={`bg-white rounded-2xl border p-3 ${canvasCardBorderClassName}`}>
          <canvas ref={canvasRef} width={920} height={420} className={`w-full h-auto rounded-xl ${canvasBackgroundClassName}`} />
        </div>
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={onEndGame} className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold">
            {endButtonLabel}
          </button>
        </div>
        {debugPanel || null}
      </div>
      <GameRewardModal show={Boolean(gameOver)} gameName={title} {...(modalProps || {})} />
    </div>
  );
}
