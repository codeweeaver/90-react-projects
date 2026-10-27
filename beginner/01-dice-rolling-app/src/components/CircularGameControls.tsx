import Dice from "./Dice";

type CircularGameControlsProps = {
  accumulate: () => void;
  rollDice: () => void;
  onToggleAttackList: () => void;
  toggleAttackList: boolean;
  disableRoll: boolean;
  randomNumber1: number;
  randomNumber2: number;
};

export default function CircularGameControls({
  accumulate,
  rollDice,
  onToggleAttackList,
  toggleAttackList,
  disableRoll,
  randomNumber1,
  randomNumber2,
}: CircularGameControlsProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-transparent text-white absolute top-1/2 left-1/2 transform -translate-1/2">
      <div className="relative w-40 h-40 sm:w-60 sm:h-60">
        {/* SVG Circular Ring divided into 3 equal segments */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <defs>
            {/* Hidden concentric paths used solely to guide the text layout along curves */}
            <path
              id="text-path-accumulate"
              d="M 35 137 A 75 75 0 0 1 100 25"
              fill="none"
            />
            <path
              id="text-path-attack"
              d="M 100 25 A 75 75 0 0 1 165 137"
              fill="none"
            />
            <path
              id="text-path-roll"
              d="M 165 137 A 75 75 0 0 1 35 137"
              fill="none"
            />
          </defs>

          {/* Segment 1: Roll Dice (Bottom Wedge) */}
          <g
            role="button"
            aria-disabled={disableRoll}
            onClick={!disableRoll ? rollDice : undefined}
            className={`group ${disableRoll ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
          >
            <path
              d="M 100 100 L 13.4 150 A 100 100 0 0 0 186.6 150 Z"
              className="fill-indigo-600 transition-colors duration-200 group-hover:fill-indigo-500"
            />
            <text className="fill-white font-bold text-[10px] tracking-wider select-none pointer-events-none uppercase">
              <textPath
                href="#text-path-roll"
                startOffset="50%"
                textAnchor="middle"
              >
                Roll Dice
              </textPath>
            </text>
          </g>

          {/* Segment 2: Accumulate (Top-Left Wedge) */}
          <g
            role="button"
            onClick={accumulate}
            aria-disabled={!disableRoll && !toggleAttackList}
            className={`group ${!disableRoll || toggleAttackList ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
          >
            <path
              d="M 100 100 L 100 0 A 100 100 0 0 0 13.4 150 Z"
              className="fill-emerald-600 transition-colors duration-200 group-hover:fill-emerald-500"
            />
            <text className="fill-white font-bold text-[10px] tracking-wider select-none pointer-events-none uppercase">
              <textPath
                href="#text-path-accumulate"
                startOffset="50%"
                textAnchor="middle"
              >
                Accumulate
              </textPath>
            </text>
          </g>

          {/* Segment 3: Attack (Top-Right Wedge) */}
          <g
            aria-disabled={!disableRoll && toggleAttackList}
            role="button"
            onClick={() => {
              if (disableRoll) {
                onToggleAttackList();
              }
            }}
            className={`group ${!disableRoll && !toggleAttackList ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
          >
            <path
              d="M 100 100 L 186.6 150 A 100 100 0 0 0 100 0 Z"
              className="fill-rose-600 transition-colors duration-200 group-hover:fill-rose-500"
            />
            <text className="fill-white font-bold text-[10px] tracking-wider select-none pointer-events-none uppercase">
              <textPath
                href="#text-path-attack"
                startOffset="50%"
                textAnchor="middle"
              >
                {toggleAttackList ? "Close Attack" : "Attack"}
              </textPath>
            </text>
          </g>

          {/* Dividing Border Lines */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="0"
            stroke="rgb(15, 23, 42)"
            strokeWidth="3"
          />
          <line
            x1="100"
            y1="100"
            x2="13.4"
            y2="150"
            stroke="rgb(15, 23, 42)"
            strokeWidth="3"
          />
          <line
            x1="100"
            y1="100"
            x2="186.6"
            y2="150"
            stroke="rgb(15, 23, 42)"
            strokeWidth="3"
          />
        </svg>

        {/* Center Circle Content Dice Images & Total */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-25 h-25 sm:w-38 sm:h-38 bg-white rounded-full border-4 border-slate-900 shadow-inner flex flex-col items-center justify-center p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg text-slate-900 flex items-center justify-center text-xl font-black shadow-md">
              <Dice randomNumber={randomNumber1} />
            </div>
            <div className="w-10 h-10 bg-white rounded-lg text-slate-900 flex items-center justify-center text-xl font-black shadow-md">
              <Dice randomNumber={randomNumber2} />
            </div>
          </div>

          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Total
            </span>
            <span className="text-2xl font-black text-amber-400">
              {randomNumber1 + randomNumber2}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
