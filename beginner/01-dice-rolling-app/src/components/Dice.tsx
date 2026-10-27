import diceOne from "/assets/images/dice-1.png";
import diceTwo from "/assets/images/dice-2.png";
import diceThree from "/assets/images/dice-3.png";
import diceFour from "/assets/images/dice-4.png";
import diceFive from "/assets/images/dice-5.png";
import diceSix from "/assets/images/dice-6.png";

const diceImages: string[] = [
  diceOne,
  diceTwo,
  diceThree,
  diceFour,
  diceFive,
  diceSix,
];

const Dice = ({ randomNumber }: { randomNumber: number }) => {
  const safeNumber =
    Number.isInteger(randomNumber) && randomNumber >= 1 && randomNumber <= 6
      ? randomNumber
      : 1;

  const diceIndex = safeNumber - 1;

  return (
    <div className="w-16 h-16 overflow-hidden">
      <img
        src={diceImages[diceIndex]}
        alt="Dice"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Dice;
