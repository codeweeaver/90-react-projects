import { Pause } from "lucide-react";
import React, { useState } from "react";
import CircularGameControls from "./components/CircularGameControls";
import GameMenu from "./components/GameMenu";
import useAudioPlayer from "./hooks/useAudioPlayer";
import chargeUpSound from "/assets/charge-up.mp3";
import diceSound from "/assets/dice-sound-effect.mp3";
import winnerImage from "/assets/images/winner.gif";
import zapSound from "/assets/zap.mp3";

type Stages = "start" | "playing" | "end";

interface GameSettingsProp {
  numberOfPlayers: number;
  goal: number;
  numberOfGames: number;
}

type Player = {
  id: string;
  name: string;
  score: number;
  totalScore: number;
  streak: number;
  reaction: "happy" | "angry" | "neutral";
};

const defaultGameSettings: GameSettingsProp = {
  numberOfPlayers: 2,
  goal: 30,
  numberOfGames: 3,
};

const PLAYER_COLORS = ["#4ADE80", "#F87171", "#60A5FA", "#FACC15"];

const App = () => {
  const diceSoundControls = useAudioPlayer(diceSound);
  const zapSoundControls = useAudioPlayer(zapSound);
  const chargeUpSoundControls = useAudioPlayer(chargeUpSound);

  const [stages, setStages] = useState<Stages>("start");

  const [gameSettings, setGameSettings] = useState<GameSettingsProp>(() => {
    const saved = localStorage.getItem("game-settings");

    if (!saved) {
      return defaultGameSettings;
    }

    try {
      const settings = JSON.parse(saved);

      if (
        typeof settings.numberOfPlayers === "number" &&
        typeof settings.goal === "number" &&
        typeof settings.numberOfGames === "number"
      ) {
        return settings;
      }

      return defaultGameSettings;
    } catch {
      return defaultGameSettings;
    }
  });

  const [showGameSettings, setShowGameSettings] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);

  // Number of rounds already completed.
  const [round, setRound] = useState(0);

  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [gameWinner, setGameWinner] = useState<Player | null>(null);

  const [starterIndex, setStarterIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // false = player has not rolled yet
  // true = player has rolled and must choose accumulate/attack
  const [disableRoll, setDisableRoll] = useState(false);

  const [toggleAttackList, setToggleAttackList] = useState(false);
  const [toggleMenu, setToggleMenu] = useState(false);

  const [randomNumber1, setRandomNumber1] = useState(1);
  const [randomNumber2, setRandomNumber2] = useState(1);

  const diceTotal = randomNumber1 + randomNumber2;

  const winsNeeded = Math.floor(gameSettings.numberOfGames / 2) + 1;

  //? functions
  const generateRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getNextStarterIndex = (
    previousStarterIndex: number,
    totalPlayer: number,
  ) => {
    const nextInOrder = (previousStarterIndex + 1) % totalPlayer;

    const allPlayersTied = players.every(
      (player) => player.streak === players[0].streak,
    );

    if (allPlayersTied) {
      return generateRandomNumber(0, totalPlayer - 1);
    }

    return nextInOrder;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;

    setGameSettings((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const createPlayers = (): Player[] => {
    return Array.from({ length: gameSettings.numberOfPlayers }, (_, index) => ({
      id: crypto.randomUUID(),
      name: `player-${index + 1}`,
      totalScore: 0,
      score: 0,
      streak: 0,
      reaction: "neutral",
    }));
  };

  const startGame = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    localStorage.setItem("game-settings", JSON.stringify(gameSettings));
    const firstStarter = generateRandomNumber(
      0,
      gameSettings.numberOfPlayers - 1,
    );

    setPlayers(createPlayers());

    setRound(0);
    setRoundWinner(null);
    setGameWinner(null);
    setStarterIndex(firstStarter);
    setCurrentPlayerIndex(firstStarter);

    setRandomNumber1(1);
    setRandomNumber2(1);

    setDisableRoll(false);
    setToggleAttackList(false);

    setStages("playing");
  };

  const resetSettings = () => {
    setGameSettings(defaultGameSettings);

    localStorage.removeItem("game-settings");

    setPlayers([]);
    setRound(0);
    setRoundWinner(null);
    setGameWinner(null);
    setStarterIndex(0);
    setCurrentPlayerIndex(0);

    setDisableRoll(false);
    setToggleAttackList(false);
    setToggleMenu(false);

    setStages("start");
  };

  const rollDice = (): void => {
    if (disableRoll || roundWinner || gameWinner) {
      return;
    }

    diceSoundControls.reset();
    diceSoundControls.play();

    const num1: number = generateRandomNumber(1, 6);
    const num2: number = generateRandomNumber(1, 6);
    const diceTotal = num1 + num2;

    setRandomNumber1(num1);
    setRandomNumber2(num2);

    if (diceTotal >= 8) {
      const updatedPlayers: Player[] = players.map((player, index) => {
        if (index !== currentPlayerIndex) {
          return player;
        }

        return {
          ...player,
          reaction: "happy",
        };
      });

      setPlayers(updatedPlayers);
    }

    setDisableRoll(true);
    setToggleAttackList(false);
  };

  const moveToNextPlayer = () => {
    setCurrentPlayerIndex((prev) => {
      if (players.length === 0) {
        return 0;
      }

      return (prev + 1) % players.length;
    });
  };

  const accumulate = () => {
    if (!disableRoll || toggleAttackList || players.length === 0) {
      return;
    }

    chargeUpSoundControls.reset();
    chargeUpSoundControls.play();

    const updatedPlayers: Player[] = players.map((player, index) => {
      if (index !== currentPlayerIndex) { 
        // Non-turn players remain neutral (or maintain their state)
        return player;
      }

      const newScore = Math.min(player.score + diceTotal, gameSettings.goal);
      const wonRound = newScore >= gameSettings.goal;

      const isCloseToWinning = newScore >= gameSettings.goal * 0.75;
      const isHighGain = diceTotal >= 8;

      const playerReaction: "happy" | "neutral" | "angry" =
        wonRound || isCloseToWinning || isHighGain ? "happy" : "neutral";

      return {
        ...player,
        score: newScore,
        totalScore: player.totalScore + diceTotal,
        streak: wonRound ? player.streak + 1 : player.streak,
        reaction: playerReaction,
      };
    });

    const winner = updatedPlayers[currentPlayerIndex];

    setPlayers(updatedPlayers);

    if (winner.score >= gameSettings.goal) {
      const newRound = round + 1;
      setRound(newRound);

      if (winner.streak >= winsNeeded) {
        setGameWinner(winner);
        setRoundWinner(null);
        setStages("end");
        setDisableRoll(true);
        setToggleAttackList(false);
        return;
      }

      setRoundWinner(winner);
      setDisableRoll(true);
      setToggleAttackList(false);
      return;
    }

    moveToNextPlayer();

    setDisableRoll(false);
    setToggleAttackList(false);
  };

  const attack = (id: string) => {
    if (!disableRoll || players.length === 0) {
      return;
    }

    zapSoundControls.reset();
    zapSoundControls.play();

    const attacker = players[currentPlayerIndex];

    const updatedPlayers: Player[] = players.map((player) => {
      if (player.id !== id) {
        return player;
      }

      if (player.id === attacker.id) {
        return {
          ...player,
          reaction: "happy",
        };
      }

      return {
        ...player,
        score: Math.max(player.score - diceTotal, 0),
        reaction: "angry",
      };
    });

    setPlayers(updatedPlayers);

    moveToNextPlayer();

    setDisableRoll(false);
    setToggleAttackList(false);
  };

  const nextRound = () => {
    const nextStarter = getNextStarterIndex(
      starterIndex,
      gameSettings.numberOfPlayers,
    );
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        score: 0,
        reaction: "neutral",
      })),
    );

    setRoundWinner(null);
    setStarterIndex(nextStarter);
    setCurrentPlayerIndex(nextStarter);
    setRandomNumber1(1);
    setRandomNumber2(1);

    setDisableRoll(false);
    setToggleAttackList(false);
  };

  const playAgain = () => {
    const firstStarter = generateRandomNumber(
      0,
      gameSettings.numberOfPlayers - 1,
    );
    setPlayers(createPlayers());

    setRound(0);
    setRoundWinner(null);
    setGameWinner(null);

    setStarterIndex(firstStarter);
    setCurrentPlayerIndex(firstStarter);

    setRandomNumber1(1);
    setRandomNumber2(1);

    setDisableRoll(false);
    setToggleAttackList(false);
    setToggleMenu(false);

    setStages("playing");
  };

  if (stages === "start") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center gap-8 bg-sky-600 text-white font-mono">
        <h2 className="text-6xl font-bold font-henny transition-all animate-bounce duration-100">
          Dice Rolling Game
        </h2>

        <section className="flex flex-col items-center">
          <div className="flex gap-3 text-lg flex-wrap justify-center md:flex-nowrap font-medium mb-5 px-4">
            <h4 className="text-lg capitalize">
              start game with default settings or
            </h4>

            <button
              type="button"
              onClick={() => setShowGameSettings((prev) => !prev)}
              className="text-amber-500 underline cursor-pointer hover:scale-105 transition-all duration-75"
            >
              change settings
            </button>
          </div>

          <form
            onSubmit={startGame}
            className="w-full px-10 py-5 rounded-lg flex flex-col items-center"
          >
            {showGameSettings && (
              <section className="mb-10 w-full">
                <div className="text-right mb-5">
                  <button
                    type="button"
                    onClick={resetSettings}
                    className="inline-flex text-amber-400 underline text-sm"
                  >
                    reset settings
                  </button>
                </div>

                <div className="flex gap-x-20 mb-5">
                  <label
                    className="whitespace-nowrap font-henny font-semibold tracking-widest w-1/3"
                    htmlFor="numberOfPlayers"
                  >
                    number of players:
                  </label>

                  <input
                    id="numberOfPlayers"
                    type="number"
                    name="numberOfPlayers"
                    max={4}
                    min={2}
                    value={gameSettings.numberOfPlayers}
                    onChange={handleChange}
                    className="outline-3 outline-sky-700 focus:outline-3 focus:outline-amber-600 flex-1 rounded-md bg-white text-gray-700 font-bold text-center text-2xl font-mono"
                  />
                </div>

                <div className="flex gap-x-20 mb-5 items-center">
                  <label
                    className="whitespace-nowrap font-henny font-semibold tracking-widest w-1/3"
                    htmlFor="numberOfGames"
                  >
                    best of:
                  </label>

                  <input
                    id="numberOfGames"
                    type="number"
                    name="numberOfGames"
                    max={10}
                    min={1}
                    value={gameSettings.numberOfGames}
                    onChange={handleChange}
                    className="outline-3 outline-sky-700 focus:outline-3 focus:outline-amber-600 flex-1 rounded-md bg-white text-gray-700 font-bold text-center text-2xl font-mono"
                  />
                </div>

                <div className="flex gap-x-20 mb-5 items-center">
                  <label
                    className="whitespace-nowrap font-henny font-semibold tracking-widest w-1/3"
                    htmlFor="goal"
                  >
                    Goal:
                  </label>

                  <input
                    id="goal"
                    type="number"
                    name="goal"
                    value={gameSettings.goal}
                    onChange={handleChange}
                    className="outline-3 outline-sky-700 focus:outline-3 focus:outline-amber-600 flex-1 rounded-md bg-white text-gray-700 font-bold text-center text-2xl font-mono"
                  />
                </div>
              </section>
            )}

            <div className="inline-flex items-center justify-center w-40 h-15 relative">
              <button
                type="submit"
                className="text-lg font-semibold uppercase rounded-md bg-amber-600 w-full h-full z-10"
              >
                Start Game
              </button>

              <span className="absolute bg-white w-40 h-15 inline-block -right-0.5 -bottom-0.5 rounded-md" />
            </div>
          </form>
        </section>
      </div>
    );
  }

  if (stages === "playing") {
    return (
      <div className="w-full h-screen grid grid-cols-2 relative">
        {toggleMenu && (
          <GameMenu
            resume={() => setToggleMenu(false)}
            restart={playAgain}
            quit={resetSettings}
          />
        )}
        {players.map((player, index) => (
          <section
            key={player.id}
            style={{
              backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length],
            }}
            className="flex flex-col items-center justify-center relative"
          >
            {roundWinner && player.id === roundWinner.id && (
              <div className="absolute inset-0 z-80 flex justify-center items-center bg-black/30">
                <div className="rounded-md bg-white py-5 px-8 text-gray-800 text-center">
                  <h1 className="text-2xl font-bold mb-3">
                    {roundWinner.name} won this round!
                  </h1>

                  <p className="mb-4">
                    Round wins: {roundWinner.streak} / {winsNeeded}
                  </p>

                  <button
                    type="button"
                    onClick={nextRound}
                    className="bg-sky-600 text-white py-2 px-5 rounded-lg capitalize text-lg"
                  >
                    Next Round
                  </button>
                </div>
              </div>
            )}

            {currentPlayerIndex === index && !roundWinner && (
              <p className="-translate-x-1/2 bg-white/80 absolute top-5 left-1/2  text-gray-800 px-4 py-1 rounded-full font-bold">
                Your Turn
              </p>
            )}
            <h1 className="text-2xl bg-transparent">
              {player.reaction === "happy"
                ? "😁"
                : player.reaction === "neutral"
                  ? "😊"
                  : "😡"}
            </h1>
            <h2 className="mb-2 font-medium">{player.name}</h2>

            <p className="font-bold text-7xl text-white">{player.score}</p>
            <div>
              <p className="font-medium text-gray-600 text-sm mt-3 text-center">
                Total score: {player.totalScore} in <br />
                Round wins: {player.streak}
              </p>
            </div>

            {currentPlayerIndex === index &&
              toggleAttackList &&
              disableRoll &&
              !roundWinner && (
                <div
                  className={`${
                    index === 2 || index === 1
                      ? "bottom-3 right-5"
                      : "bottom-3 left-5"
                  } absolute border-none flex flex-col gap-1`}
                >
                  <h2
                    className={`${
                      index === 2 || index === 1 ? "text-right" : "text-left"
                    } mb-2 font-medium tracking-wide text-gray-50`}
                  >
                    Attack Controls
                  </h2>

                  <div className="flex gap-3 flex-wrap">
                    {players
                      .filter(
                        (_, playerIndex) => playerIndex !== currentPlayerIndex,
                      )
                      .map((targetPlayer) => (
                        <button
                          type="button"
                          key={targetPlayer.id}
                          onClick={() => attack(targetPlayer.id)}
                          className="capitalize border-none bg-white text-gray-800 rounded-full py-1.5 px-3 hover:scale-105 transition"
                        >
                          {targetPlayer.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

            <div
              className={`${
                index === 0
                  ? "top-5 left-5"
                  : index === 2
                    ? "bottom-5 left-5"
                    : index === 3
                      ? "bottom-5 right-5"
                      : "top-5 right-5"
              } absolute border-none flex gap-5`}
            >
              <span className="bg-red-500 py-1 px-6 rounded-full text-white font-henny text-sm tracking-widest font-semibold">
                {player.streak}
              </span>
            </div>
          </section>
        ))}

        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center justify-center flex-col gap-3">
          <button
            onClick={() => setToggleMenu((prev) => !prev)}
            className="rounded-full bg-white/80 w-10 h-10 inline-flex justify-center items-center"
          >
            <Pause size={20} className="text-yellow-400" />
          </button>
          <p className="bg-white/80 text-gray-800 px-4 py-2 rounded-full font-bold">
            Round {round + 1}
          </p>
        </div>

        <CircularGameControls
          accumulate={accumulate}
          rollDice={rollDice}
          disableRoll={disableRoll}
          randomNumber1={randomNumber1}
          randomNumber2={randomNumber2}
          toggleAttackList={toggleAttackList}
          onToggleAttackList={() => setToggleAttackList((prev) => !prev)}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent text-white flex flex-col items-center justify-center gap-6 font-mono relative">
      <h1 className="text-6xl font-bold font-henny">Game Over!</h1>

      {gameWinner && (
        <>
          <div className="flex justify-between absolute w-full -z-10 bg-sky-500 h-full">
            <img
              src={winnerImage}
              alt="winner image"
              className="transform w-100 h-100 transition-all duration-100"
            />
            <img
              src={winnerImage}
              alt="winner image"
              className="transform -scale-x-100 w-100 h-100 transition-all duration-100"
            />
          </div>
          <p className="text-3xl font-bold">{gameWinner.name} wins the game!</p>

          <p className="text-xl">Round wins: {gameWinner.streak}</p>
        </>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={playAgain}
          className="bg-amber-500 text-white px-6 py-3 rounded-lg font-bold"
        >
          Play Again
        </button>

        <button
          type="button"
          onClick={resetSettings}
          className="bg-white text-gray-800 px-6 py-3 rounded-lg font-bold"
        >
          New Settings
        </button>
      </div>
    </div>
  );
};

export default App;
