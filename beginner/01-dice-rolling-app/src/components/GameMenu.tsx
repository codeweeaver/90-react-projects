import { Play, Rotate3dIcon, X } from "lucide-react";

type MenuProps = {
  resume: () => void;
  restart: () => void;
  quit: () => void;
};

const GameMenu = ({ resume, restart, quit }: MenuProps) => {
  return (
    <div className="absolute inset-0 w-screen h-screen  z-100 bg-black/30 bg-blend-color flex items-center justify-center">
      <section className="bg-white/80 rounded-md w-100 p-10 flex flex-col items-center justify-center gap-5 bg-blend-color">
        <button
          onClick={resume}
          className="inline-flex cursor-pointer items-center justify-center py-2 rounded-full gap-2 px-4 text-white bg-gray-700"
        >
          <Play size={20} className="text-green-300" nonScalingStroke={true} />
          <span>Resume</span>
        </button>
        <button
          onClick={restart}
          className="inline-flex cursor-pointer items-center justify-center py-2 rounded-full gap-2 px-4 text-white bg-gray-700"
        >
          <Rotate3dIcon
            size={20}
            className="text-blue-400"
            nonScalingStroke={true}
          />
          <span>Restart</span>
        </button>
        <button
          onClick={quit}
          className="inline-flex cursor-pointer items-center justify-center py-2 rounded-full gap-2 px-4 text-white bg-gray-700 "
        >
          <X size={20} className="text-red-400" nonScalingStroke={true} />
          <span>Quit</span>
        </button>
      </section>
    </div>
  );
};

export default GameMenu;
