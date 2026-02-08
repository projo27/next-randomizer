import CardDeckRandomizer from "@/components/card-deck-randomizer";
import CoinFlipper from "@/components/coin-flipper";
import ColorPaletteGenerator from "@/components/color-palette-generator";
import DateRandomizer from "@/components/date-randomizer";
import DiceRoller from "@/components/dice-roller";
import EmojiGenerator from "@/components/emoji-generator";
import ImageRandomizer from "@/components/image-randomizer";
import ListRandomizer from "@/components/list-randomizer";
import LotteryGenerator from "@/components/lottery-generator";
import NumberBaseRandomizer from "@/components/number-base-randomizer";
import NumberRandomizer from "@/components/number-randomizer";
import OotdGeneratorRunware from "@/components/ootd-generator-runware";
import PasswordGenerator from "@/components/password-generator";
import RockPaperScissors from "@/components/rock-paper-scissors";
import SequenceRandomizer from "@/components/sequence-randomizer";
import Spinner from "@/components/spinner";
import TeamShuffler from "@/components/team-shuffler";
import TravelRandomizer from "@/components/travel-randomizer";
import YouTubeRandomizer from "@/components/youtube-randomizer";
// import GoogleSheetRandomizer from "@/components/google-sheet-randomizer";
import ActivityRandomizer from "@/components/activity-randomizer";
import AnimalRandomizer from "@/components/animal-randomizer";
import AnimeMangaRandomizer from "@/components/anime-manga-randomizer";
import ArtRandomizer from "@/components/art-randomizer";
import BibleRandomizer from "@/components/bible-randomizer";
import BookRandomizer from "@/components/book-randomizer";
import ChemicalElementRandomizer from "@/components/chemical-element-randomizer";
import CountryRandomizer from "@/components/country-randomizer";
import DataObjectRandomizer from "@/components/data-object-randomizer";
import GiftRandomizer from "@/components/gift-randomizer";
import HistoricalEventRandomizer from "@/components/historical-event-randomizer";
import LocalMusicRandomizer from "@/components/local-music-randomizer";
import MapsRandomizer from "@/components/maps-randomizer";
import MemeRandomizer from "@/components/meme-randomizer";
import PairRandomizer from "@/components/pair-randomizer";
import PatternRandomizer from "@/components/pattern-randomizer";
import PlantRandomizer from "@/components/plant-randomizer";
import PoetryRandomizer from "@/components/poetry-randomizer";
import QuoteRandomizer from "@/components/quote-randomizer";
import QuranRandomizer from "@/components/quran-randomizer";
import RadioRandomizer from "@/components/radio-randomizer";
import RandomWalkGenerator from "@/components/random-walk-generator";
import RoyaltyFreeMusicRandomizer from "@/components/royalty-free-music-randomizer";
import ScienceFactRandomizer from "@/components/science-fact-randomizer";
import SeatingChartRandomizer from "@/components/seating-chart-randomizer";
import SongRandomizer from "@/components/song-randomizer";
import SportRandomizer from "@/components/sport-randomizer";
import TanakhRandomizer from "@/components/tanakh-randomizer";
import TarotRandomizer from "@/components/tarot-randomizer";
import TodayCookingRandomizer from "@/components/today-cooking-randomizer";
import TruthOrDareRandomizer from "@/components/truth-or-dare-randomizer";
import UnsplashImageRandomizer from "@/components/unsplash-image-randomizer";
import WordRandomizer from "@/components/word-randomizer";

import {
  Armchair,
  Beaker,
  Binary,
  BookIcon,
  BookMarked,
  BookOpen,
  BookPlus,
  CalendarDays, CircleDollarSign,
  ClipboardCheck,
  Combine,
  CookingPot,
  Database,
  Dices,
  Disc,
  Feather,
  FileText,
  Flag,
  FlameKindling,
  FlaskConical,
  Footprints,
  Gift,
  GitBranch,
  Hand,
  Headphones,
  Image as ImageIcon,
  Landmark,
  Laugh,
  Layers,
  Library,
  ListOrdered,
  ListTodo,
  Lock,
  Map,
  Music,
  Palette,
  PawPrint,
  Plane,
  Quote,
  Radio,
  Shirt,
  Shuffle,
  Smile,
  Spade,
  Sprout,
  Ticket,
  Tv,
  Users,
  Wallpaper,
  Youtube
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
    value: "seating",
    text: "Seating Chart",
    hidden: false,
    icon: <Armchair className="h-5 w-5" />,
    content: <SeatingChartRandomizer />,
    contentGuard: false,
  },
  {
    value: "pair",
    text: "Pair",
    hidden: false,
    icon: <Combine className="h-5 w-5" />,
    content: <PairRandomizer />,
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
    value: "emoji",
    text: "Emoji",
    hidden: false,
    icon: <Smile className="h-5 w-5" />,
    content: <EmojiGenerator />,
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
    value: "tarot",
    text: "Tarot",
    hidden: false,
    icon: <GitBranch className="h-5 w-5" />,
    content: <TarotRandomizer />,
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
    value: "rps",
    text: "Rock Paper Scissor",
    hidden: false,
    icon: <Hand className="h-5 w-5" />,
    content: <RockPaperScissors />,
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
    value: "palette",
    text: "Color Palette",
    hidden: false,
    icon: <Palette className="h-5 w-5" />,
    content: <ColorPaletteGenerator />,
    contentGuard: false,
  },
  {
    value: "pattern",
    text: "Pattern",
    hidden: true,
    icon: <Layers className="h-5 w-5" />,
    content: <PatternRandomizer />,
    contentGuard: false,
  },
  {
    value: "data-object",
    text: "Data Object",
    hidden: false,
    icon: <Database className="h-5 w-5" />,
    content: <DataObjectRandomizer />,
    contentGuard: true,
  },
  {
    value: 'art',
    text: 'Art',
    hidden: true,
    icon: <Palette className="h-5 w-5" />,
    content: <ArtRandomizer />,
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
    value: "word",
    text: "Word",
    hidden: false,
    icon: <FileText className="h-5 w-5" />,
    content: <WordRandomizer />,
    contentGuard: false,
  },
  {
    value: "poetry",
    text: "Poetry",
    hidden: false,
    icon: <Feather className="h-5 w-5" />,
    content: <PoetryRandomizer />,
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
    value: "meme",
    text: "Meme",
    hidden: false,
    icon: <Laugh className="h-5 w-5" />,
    content: <MemeRandomizer />,
    contentGuard: true,
  },
  {
    value: "anime",
    text: "Anime/Manga",
    hidden: false,
    icon: <Tv className="h-5 w-5" />,
    content: <AnimeMangaRandomizer />,
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
    value: "plant",
    text: "Plant",
    hidden: false,
    icon: <Sprout className="h-5 w-5" />,
    content: <PlantRandomizer />,
    contentGuard: false,
  },
  {
    value: 'animal',
    text: 'Animal',
    hidden: false,
    icon: <PawPrint className="h-5 w-5" />,
    content: <AnimalRandomizer />,
    contentGuard: false,
  },
  {
    value: "activity",
    text: "Today's Activity",
    hidden: false,
    icon: <ClipboardCheck className="h-5 w-5" />,
    content: <ActivityRandomizer />,
    contentGuard: false,
  },
  {
    value: 'book',
    text: 'Book',
    hidden: false,
    icon: <BookIcon className="h-5 w-5" />,
    content: <BookRandomizer />,
    contentGuard: false,
  },
  {
    value: 'quran',
    text: 'Quran',
    hidden: false,
    icon: <BookOpen className="h-5 w-5" />,
    content: <QuranRandomizer />,
    contentGuard: false,
  },
  {
    value: 'bible',
    text: 'Bible',
    hidden: false,
    icon: <BookPlus className="h-5 w-5" />,
    content: <BibleRandomizer />,
    contentGuard: false,
  },
  {
    value: 'tanakh',
    text: 'Tanakh',
    hidden: true,
    icon: <BookMarked className="h-5 w-5" />,
    content: <TanakhRandomizer />,
    contentGuard: false,
  },
  {
    value: 'historical-event',
    text: 'Historical Event',
    hidden: false,
    icon: <Landmark className="h-5 w-5" />,
    content: <HistoricalEventRandomizer />,
    contentGuard: false,
  },
  {
    value: "truth-or-dare",
    text: "Truth or Dare",
    hidden: false,
    icon: <FlameKindling className="h-5 w-5" />,
    content: <TruthOrDareRandomizer />,
    contentGuard: false,
  },
  {
    value: "music",
    text: "Song",
    hidden: false,
    icon: <Music className="h-5 w-5" />,
    content: <SongRandomizer />,
    contentGuard: false,
  },
  {
    value: "local-music",
    text: "Local Music",
    hidden: false,
    icon: <Library className="h-5 w-5" />,
    content: <LocalMusicRandomizer />,
    contentGuard: false,
  },
  {
    value: "royalty-free-music",
    text: "Royalty Free Music",
    hidden: false,
    icon: <Headphones className="h-5 w-5" />,
    content: <RoyaltyFreeMusicRandomizer />,
    contentGuard: true,
  },
  {
    value: "radio",
    text: "Radio",
    hidden: false,
    icon: <Radio className="h-5 w-5" />,
    content: <RadioRandomizer />,
    contentGuard: false,
  },
  {
    value: "sport",
    text: "Football Club",
    hidden: false,
    icon: <Users className="h-5 w-5" />,
    content: <SportRandomizer />,
    contentGuard: true,
  },
  {
    value: 'chemical-element',
    text: 'Chemical Element',
    hidden: false,
    icon: <Beaker className="h-5 w-5" />,
    content: <ChemicalElementRandomizer />,
    contentGuard: false,
  },
  {
    value: "science-fact",
    text: "Science Fact",
    hidden: false,
    icon: <FlaskConical className="h-5 w-5" />,
    content: <ScienceFactRandomizer />,
    contentGuard: true,
  },
  {
    value: "cooking",
    text: "Today's Cooking",
    hidden: false,
    icon: <CookingPot className="h-5 w-5" />,
    content: <TodayCookingRandomizer />,
    contentGuard: true,
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
    text: "Local Image",
    hidden: false,
    icon: <ImageIcon className="h-5 w-5" />,
    content: <ImageRandomizer />,
    contentGuard: false,
  },
  {
    value: "unsplash",
    text: "Unsplash Image",
    hidden: false,
    icon: <Wallpaper className="h-5 w-5" />,
    content: <UnsplashImageRandomizer />,
    contentGuard: true,
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
  {
    value: 'random_walk',
    text: 'Random Walk',
    hidden: false,
    icon: <Footprints className="h-5 w-5" />,
    content: <RandomWalkGenerator />,
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
