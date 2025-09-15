import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ListTodo, Shuffle, Lock, Newspaper, Dices, ListOrdered, Users, CalendarDays, CircleDollarSign, Disc, Spade, Ticket, Smile, Compass, Palette, Binary, Image as ImageIcon } from "lucide-react";
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

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-6xl mx-auto mt-12">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="flex flex-wrap items-center justify-center w-full h-auto">
            <TabsTrigger
              value="list"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <ListTodo className="h-5 w-5" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger
              value="number"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Shuffle className="h-5 w-5" />
              <span>Number</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Lock className="h-5 w-5" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Newspaper className="h-5 w-5" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger
              value="dice"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Dices className="h-5 w-5" />
              <span>Dice</span>
            </TabsTrigger>
            <TabsTrigger
              value="sequence"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <ListOrdered className="h-5 w-5" />
              <span>Sequence</span>
            </TabsTrigger>
             <TabsTrigger
              value="team"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Users className="h-5 w-5" />
              <span>Team</span>
            </TabsTrigger>
             <TabsTrigger
              value="date"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <CalendarDays className="h-5 w-5" />
              <span>Date</span>
            </TabsTrigger>
            <TabsTrigger
              value="coin"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <CircleDollarSign className="h-5 w-5" />
              <span>Coin</span>
            </TabsTrigger>
            <TabsTrigger
              value="spinner"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Disc className="h-5 w-5" />
              <span>Spinner</span>
            </TabsTrigger>
            <TabsTrigger
              value="card"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Spade className="h-5 w-5" />
              <span>Card</span>
            </TabsTrigger>
            <TabsTrigger
              value="lottery"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Ticket className="h-5 w-5" />
              <span>Lottery</span>
            </TabsTrigger>
            <TabsTrigger
              value="emoji"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Smile className="h-5 w-5" />
              <span>Emoji</span>
            </TabsTrigger>
            <TabsTrigger
              value="compass"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Compass className="h-5 w-5" />
              <span>Compass</span>
            </TabsTrigger>
            <TabsTrigger
              value="palette"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Palette className="h-5 w-5" />
              <span>Palette</span>
            </TabsTrigger>
            <TabsTrigger
              value="base"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <Binary className="h-5 w-5" />
              <span>Base</span>
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="flex flex-col xl:flex-row gap-2 h-14 xl:h-10"
            >
              <ImageIcon className="h-5 w-5" />
              <span>Image</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" forceMount>
            <ListRandomizer />
          </TabsContent>
          <TabsContent value="number" forceMount>
            <NumberRandomizer />
          </TabsContent>
          <TabsContent value="password" forceMount>
            <PasswordGenerator />
          </TabsContent>
          <TabsContent value="news" forceMount>
            <RandomNews />
          </TabsContent>
          <TabsContent value="dice" forceMount>
            <DiceRoller />
          </TabsContent>
          <TabsContent value="sequence" forceMount>
            <SequenceRandomizer />
          </TabsContent>
          <TabsContent value="team" forceMount>
            <TeamShuffler />
          </TabsContent>
           <TabsContent value="date" forceMount>
            <DateRandomizer />
          </TabsContent>
          <TabsContent value="coin" forceMount>
            <CoinFlipper />
          </TabsContent>
          <TabsContent value="spinner" forceMount>
            <Spinner />
          </TabsContent>
          <TabsContent value="card" forceMount>
            <CardDeckRandomizer />
          </TabsContent>
          <TabsContent value="lottery" forceMount>
            <LotteryGenerator />
          </TabsContent>
          <TabsContent value="emoji" forceMount>
            <EmojiGenerator />
          </TabsContent>
          <TabsContent value="compass" forceMount>
            <CompassRandomizer />
          </TabsContent>
          <TabsContent value="palette" forceMount>
            <ColorPaletteGenerator />
          </TabsContent>
          <TabsContent value="base" forceMount>
            <NumberBaseRandomizer />
          </TabsContent>
          <TabsContent value="image" forceMount>
            <ImageRandomizer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
