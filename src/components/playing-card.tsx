import React from 'react';
import { cn } from '@/lib/utils';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import { JokerIcon } from './icons/joker-icon';

const suitIcons = {
  H: <Heart className="h-4 w-4 fill-current" />,
  D: <Diamond className="h-4 w-4 fill-current" />,
  C: <Club className="h-4 w-4 fill-current" />,
  S: <Spade className="h-4 w-4 fill-current" />,
  Joker: <JokerIcon className="h-6 w-6" />,
};

type Suit = keyof typeof suitIcons;
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "Joker";

export type Card = {
  suit: Suit;
  rank: Rank;
};

interface PlayingCardProps extends Card {
  className?: string;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ suit, rank, className }) => {
  const isRed = suit === 'H' || suit === 'D';
  const isJoker = suit === 'Joker';
  
  const textColor = isRed ? 'text-red-600' : 'text-black';

  if (isJoker) {
    return (
      <div
        className={cn(
          "w-24 h-36 bg-white rounded-lg p-2 shadow-md flex flex-col justify-between border border-gray-300 relative",
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
            <JokerIcon className="h-12 w-12" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-24 h-36 bg-white rounded-lg p-2 shadow-md flex flex-col justify-between border border-gray-300",
        textColor,
        className
      )}
    >
      <div className="flex flex-col items-start">
        <span className="text-xl font-bold leading-none">{rank}</span>
        <div>{suitIcons[suit]}</div>
      </div>
      <div className="flex flex-col items-start rotate-180">
        <span className="text-xl font-bold leading-none">{rank}</span>
        <div>{suitIcons[suit]}</div>
      </div>
    </div>
  );
};

export default PlayingCard;
