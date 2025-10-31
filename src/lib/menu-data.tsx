import ListRandomizer from "@/components/list-randomizer";
import NumberRandomizer from "@/components/number-randomizer";
import SequenceRandomizer from "@/components/sequence-randomizer";
import PasswordGenerator from "@/components/password-generator";
import DateRandomizer from "@/components/date-randomizer";
import TeamShuffler from "@/components/team-shuffler";
import CoinFlipper from "@/components/coin-flipper";
import DiceRoller from "@/components/dice-roller";
import RockPaperScissors from "@/components/rock-paper-scissors";
import CardDeckRandomizer from "@/components/card-deck-randomizer";
import LotteryGenerator from "@/components/lottery-generator";
import EmojiGenerator from "@/components/emoji-generator";
import ColorPaletteGenerator from "@/components/color-palette-generator";
import NumberBaseRandomizer from "@/components/number-base-randomizer";
import Spinner from "@/components/spinner";
import CompassRandomizer from "@/components/compass-randomizer";
import ImageRandomizer from "@/components/image-randomizer";
import YouTubeRandomizer from "@/components/youtube-randomizer";
import OotdGenerator from "@/components/ootd-generator";
import OotdGeneratorRunware from "@/components/ootd-generator-runware";
import TravelRandomizer from "@/components/travel-randomizer";
import RandomNews from "@/components/random-news";
// import GoogleSheetRandomizer from "@/components/google-sheet-randomizer";
import QuoteRandomizer from "@/components/quote-randomizer";
import CountryRandomizer from "@/components/country-randomizer";
import GiftRandomizer from "@/components/gift-randomizer";
import MapsRandomizer from "@/components/maps-randomizer";
import MemeRandomizer from "@/components/meme-randomizer";
import MusicRandomizer from "@/components/song-randomizer";

import {
  ListTodo,
  Shuffle,
  Lock,
  Newspaper,
  Dices,
  ListOrdered,
  Users,
  CalendarDays,
  CircleDollarSign,
  Disc,
  Spade,
  Ticket,
  Smile,
  Compass,
  Palette,
  Binary,
  Image as ImageIcon,
  Shirt,
  Plane,
  Youtube,
  Hand,
  Sheet,
  Quote,
  Flag,
  Gift,
  Map,
  Laugh,
  Music,
} from "lucide-react";

export type MenuItemData = typeof triggerList[0];

export const triggerList = [
    {
      value: "list",
      text: "List",
      hidden: false,
      icon: <ListTodo className="h-5 w-5" />,
      content: <ListRandomizer />,
      contentGuard: false,
    },
    {
      value: "number",
      text: "Number",
      hidden: false,
      icon: <Shuffle className="h-5 w-5" />,
      content: <NumberRandomizer />,
      contentGuard: false,
    },
    {
      value: "sequence",
      text: "Sequence",
      hidden: false,
      icon: <ListOrdered className="h-5 w-5" />,
      content: <SequenceRandomizer />,
      contentGuard: false,
    },
    {
      value: "password",
      text: "Password",
      hidden: false,
      icon: <Lock className="h-5 w-5" />,
      content: <PasswordGenerator />,
      contentGuard: false,
    },
    {
      value: "date",
      text: "Date",
      hidden: false,
      icon: <CalendarDays className="h-5 w-5" />,
      content: <DateRandomizer />,
      contentGuard: false,
    },
    {
      value: "team",
      text: "Team",
      hidden: false,
      icon: <Users className="h-5 w-5" />,
      content: <TeamShuffler />,
      contentGuard: false,
    },
    {
      value: "coin",
      text: "Coin",
      hidden: false,
      icon: <CircleDollarSign className="h-5 w-5" />,
      content: <CoinFlipper />,
      contentGuard: false,
    },
    {
      value: "dice",
      text: "Dice",
      hidden: false,
      icon: <Dices className="h-5 w-5" />,
      content: <DiceRoller />,
      contentGuard: false,
    },
    {
      value: "rps",
      text: "Rock Paper Scissor",
      hidden: false,
      icon: <Hand className="h-5 w-5" />,
      content: <RockPaperScissors />,
      contentGuard: false,
    },
    {
      value: "card",
      text: "Card",
      hidden: false,
      icon: <Spade className="h-5 w-5" />,
      content: <CardDeckRandomizer />,
      contentGuard: false,
    },
    {
      value: "lottery",
      text: "Lottery",
      hidden: false,
      icon: <Ticket className="h-5 w-5" />,
      content: <LotteryGenerator />,
      contentGuard: false,
    },
    {
      value: "emoji",
      text: "Emoji",
      hidden: false,
      icon: <Smile className="h-5 w-5" />,
      content: <EmojiGenerator />,
      contentGuard: false,
    },
    {
      value: "palette",
      text: "Color Palette",
      hidden: false,
      icon: <Palette className="h-5 w-5" />,
      content: <ColorPaletteGenerator />,
      contentGuard: false,
    },
    {
      value: "base",
      text: "Base",
      hidden: false,
      icon: <Binary className="h-5 w-5" />,
      content: <NumberBaseRandomizer />,
      contentGuard: false,
    },
    {
      value: "spinner",
      text: "Spinner",
      hidden: false,
      icon: <Disc className="h-5 w-5" />,
      content: <Spinner />,
      contentGuard: false,
    },
     {
      value: "quote",
      text: "Quote",
      hidden: false,
      icon: <Quote className="h-5 w-5" />,
      content: <QuoteRandomizer />,
      contentGuard: false,
    },
    {
      value: "country",
      text: "Country",
      hidden: false,
      icon: <Flag className="h-5 w-5" />,
      content: <CountryRandomizer />,
      contentGuard: false,
    },
    {
        value: "gift",
        text: "Gift",
        hidden: false,
        icon: <Gift className="h-5 w-5" />,
        content: <GiftRandomizer />,
        contentGuard: false,
    },
    {
      value: "meme",
      text: "Meme",
      hidden: false,
      icon: <Laugh className="h-5 w-5" />,
      content: <MemeRandomizer />,
      contentGuard: true,
    },
    {
      value: "music",
      text: "Music",
      hidden: false,
      icon: <Music className="h-5 w-5" />,
      content: <MusicRandomizer />,
      contentGuard: false,
    },
    // Not Showed, feature not ready
    // {
    //   value: "compass",
    //   text: "Compass",
    //   hidden: true,
    //   icon: <Compass className="h-5 w-5" />,
    //   content: <CompassRandomizer />,
    //   contentGuard: false,
    // },
    {
      value: "image",
      text: "Image",
      hidden: false,
      icon: <ImageIcon className="h-5 w-5" />,
      content: <ImageRandomizer />,
      contentGuard: false,
    },
    {
      value: "youtube",
      text: "YouTube",
      hidden: false,
      icon: <Youtube className="h-5 w-5" />,
      content: <YouTubeRandomizer />,
      contentGuard: true,
    },
    //Not Showed, feature not ready
    // {
    //   value: "ootd",
    //   text: "OOTD",
    //   hidden: true,
    //   icon: <Shirt className="h-5 w-5" />,
    //   content: <OotdGenerator />,
    //   contentGuard: true,
    // },
    {
      value: "ootd-runware",
      text: "OOTD",
      hidden: false,
      icon: <Shirt className="h-5 w-5" />,
      content: <OotdGeneratorRunware />,
      contentGuard: true,
    },
    {
      value: "travel",
      text: "Travel",
      hidden: false,
      icon: <Plane className="h-5 w-5" />,
      content: <TravelRandomizer />,
      contentGuard: true,
    },
    {
      value: "maps",
      text: "Maps",
      hidden: false,
      icon: <Map className="h-5 w-5" />,
      content: <MapsRandomizer />,
      contentGuard: true,
    },
    // {
    //   value: "google-sheet",
    //   text: "Google Sheet",
    //   hidden: false,
    //   icon: <Sheet className="h-5 w-5" />,
    //   content: <GoogleSheetRandomizer />,
    //   contentGuard: false,
    // },
    // Not Showed, fiture not ready
    // {
    //   value: "news",
    //   text: "News",
    //   hidden: true,
    //   icon: <Newspaper className="h-5 w-5" />,
    //   content: <RandomNews />,
    //   contentGuard: true,
    // },
  ];
