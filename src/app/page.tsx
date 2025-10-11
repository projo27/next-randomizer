"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import ListRandomizer from "@/components/list-randomizer";
import NumberRandomizer from "@/components/number-randomizer";
import PasswordGenerator from "@/components/password-generator";
import RandomNews from "@/components/random-news";
import DiceRoller from "@/components/dice-roller";
import SequenceRandomizer from "@/components/sequence-randomizer";
import { Header } from "@/components/header";
import TeamShuffler from "@/components/team-shuffler";
import DateRandomizer from "@/components/date-randomizer";
import CoinFlipper from "@/components/coin-flipper";
import Spinner from "@/components/spinner";
import CardDeckRandomizer from "@/components/card-deck-randomizer";
import LotteryGenerator from "@/components/lottery-generator";
import EmojiGenerator from "@/components/emoji-generator";
import CompassRandomizer from "@/components/compass-randomizer";
import ColorPaletteGenerator from "@/components/color-palette-generator";
import NumberBaseRandomizer from "@/components/number-base-randomizer";
import ImageRandomizer from "@/components/image-randomizer";
import OotdGenerator from "@/components/ootd-generator";
import TravelRandomizer from "@/components/travel-randomizer";
import YouTubeRandomizer from "@/components/youtube-randomizer";
import RockPaperScissors from "@/components/rock-paper-scissors";
import { RockPaperScissorsIcon } from "@/components/icons/rock-paper-scissors-icon";
import { Skeleton } from "@/components/ui/skeleton";
import OotdGeneratorRunware from "@/components/ootd-generator-runware";
import TabContentGuard from "@/components/ui/tab-content-guard";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "list";
  const { user } = useAuth();

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(pathname + "?" + params.toString());
    },
    [pathname, router, searchParams],
  );

  const triggerList = [
    {
      value: "list",
      text: "List",
      hidden: false,
      badge: "",
      icon: <ListTodo className="h-5 w-5" />,
      content: <ListRandomizer />,
      contentGuard: false,
    },
    {
      value: "number",
      text: "Number",
      hidden: false,
      badge: "",
      icon: <Shuffle className="h-5 w-5" />,
      content: <NumberRandomizer />,
      contentGuard: false,
    },
    {
      value: "sequence",
      text: "Sequence",
      hidden: false,
      badge: "",
      icon: <ListOrdered className="h-5 w-5" />,
      content: <SequenceRandomizer />,
      contentGuard: false,
    },
    {
      value: "password",
      text: "Password",
      hidden: false,
      badge: "",
      icon: <Lock className="h-5 w-5" />,
      content: <PasswordGenerator />,
      contentGuard: false,
    },
    {
      value: "date",
      text: "Date",
      hidden: false,
      badge: "",
      icon: <CalendarDays className="h-5 w-5" />,
      content: <DateRandomizer />,
      contentGuard: false,
    },
    {
      value: "team",
      text: "Team",
      hidden: false,
      badge: "",
      icon: <Users className="h-5 w-5" />,
      content: <TeamShuffler />,
      contentGuard: false,
    },
    {
      value: "coin",
      text: "Coin",
      hidden: false,
      badge: "",
      icon: <CircleDollarSign className="h-5 w-5" />,
      content: <CoinFlipper />,
      contentGuard: false,
    },
    {
      value: "dice",
      text: "Dice",
      hidden: false,
      badge: "",
      icon: <Dices className="h-5 w-5" />,
      content: <DiceRoller />,
      contentGuard: false,
    },
    {
      value: "rps",
      text: "Rock Paper Scissor",
      hidden: false,
      badge: "",
      icon: <Hand className="h-5 w-5" />,
      content: <RockPaperScissors />,
      contentGuard: false,
    },
    {
      value: "card",
      text: "Card",
      hidden: false,
      badge: "",
      icon: <Spade className="h-5 w-5" />,
      content: <CardDeckRandomizer />,
      contentGuard: false,
    },
    {
      value: "lottery",
      text: "Lottery",
      hidden: false,
      badge: "",
      icon: <Ticket className="h-5 w-5" />,
      content: <LotteryGenerator />,
      contentGuard: false,
    },
    {
      value: "emoji",
      text: "Emoji",
      hidden: false,
      badge: "",
      icon: <Smile className="h-5 w-5" />,
      content: <EmojiGenerator />,
      contentGuard: false,
    },
    {
      value: "palette",
      text: "Palette",
      hidden: false,
      badge: "",
      icon: <Palette className="h-5 w-5" />,
      content: <ColorPaletteGenerator />,
      contentGuard: false,
    },
    {
      value: "base",
      text: "Base",
      hidden: false,
      badge: "",
      icon: <Binary className="h-5 w-5" />,
      content: <NumberBaseRandomizer />,
      contentGuard: false,
    },
    {
      value: "spinner",
      text: "Spinner",
      hidden: true,
      badge: "",
      icon: <Disc className="h-5 w-5" />,
      content: <Spinner />,
      contentGuard: false,
    },
    {
      value: "compass",
      text: "Compass",
      hidden: true,
      badge: "",
      icon: <Compass className="h-5 w-5" />,
      content: <CompassRandomizer />,
      contentGuard: false,
    },
    {
      value: "image",
      text: "Image",
      hidden: false,
      badge: "",
      icon: <ImageIcon className="h-5 w-5" />,
      content: <ImageRandomizer />,
      contentGuard: false,
    },
    {
      value: "youtube",
      text: "YouTube",
      hidden: false,
      badge: "",
      icon: <Youtube className="h-5 w-5" />,
      content: <YouTubeRandomizer user={user} />,
      contentGuard: true,
    },
    {
      value: "ootd",
      text: "OOTD",
      hidden: true,
      badge: "",
      icon: <Shirt className="h-5 w-5" />,
      content: <OotdGenerator />,
      contentGuard: true,
    },
    {
      value: "ootd-runware",
      text: "OOTD",
      hidden: false,
      badge: "",
      icon: <Shirt className="h-5 w-5" />,
      content: <OotdGeneratorRunware />,
      contentGuard: true,
    },
    {
      value: "travel",
      text: "Travel",
      hidden: false,
      badge: "",
      icon: <Plane className="h-5 w-5" />,
      content: <TravelRandomizer />,
      contentGuard: true,
    },
    {
      value: "news",
      text: "News",
      hidden: true,
      badge: "",
      icon: <Newspaper className="h-5 w-5" />,
      content: <RandomNews />,
      contentGuard: true,
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="flex flex-wrap items-center justify-center w-full h-auto gap-2 py-2">
        {/* Tabs Trigger */}
        {triggerList.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              `flex flex-col xl:flex-row gap-2 h-14 xl:h-10 hover:ring-2 hover:ring-primary-foreground hover:dark:ring-primary`,
              item.hidden ? "[&&&]:hidden" : "",
            )}
          >
            {item.icon}
            <span>{item.text}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Tabs Content */}
      {triggerList.map((item) => (
        <TabsContent key={item.value} value={item.value} forceMount>
          {item.contentGuard ? (
            <TabContentGuard>{item.content}</TabContentGuard>
          ) : (
            item.content
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function HomePageFallback() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-6xl mx-auto mt-6">
        <Suspense fallback={<HomePageFallback />}>
          <HomePageContent />
        </Suspense>
      </main>
    </div>
  );
}
