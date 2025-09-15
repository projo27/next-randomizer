import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ListTodo, Shuffle, Lock, Newspaper, Dices, ListOrdered, Users, CalendarDays, CircleDollarSign } from "lucide-react";
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

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-4xl mx-auto mt-12">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-5 sm:grid-cols-9 h-auto">
            <TabsTrigger
              value="list"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <ListTodo className="h-5 w-5" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger
              value="number"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <Shuffle className="h-5 w-5" />
              <span>Number</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <Lock className="h-5 w-5" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <Newspaper className="h-5 w-5" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger
              value="dice"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <Dices className="h-5 w-5" />
              <span>Dice</span>
            </TabsTrigger>
            <TabsTrigger
              value="sequence"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <ListOrdered className="h-5 w-5" />
              <span>Sequence</span>
            </TabsTrigger>
             <TabsTrigger
              value="team"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <Users className="h-5 w-5" />
              <span>Team</span>
            </TabsTrigger>
             <TabsTrigger
              value="date"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <CalendarDays className="h-5 w-5" />
              <span>Date</span>
            </TabsTrigger>
            <TabsTrigger
              value="coin"
              className="flex flex-col md:flex-row gap-2 h-14 md:h-10"
            >
              <CircleDollarSign className="h-5 w-5" />
              <span>Coin</span>
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
        </Tabs>
      </main>
    </div>
  );
}
