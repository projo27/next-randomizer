import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ListTodo, Shuffle, Lock, Newspaper } from "lucide-react";
import ListRandomizer from "@/components/list-randomizer";
import NumberRandomizer from "@/components/number-randomizer";
import PasswordGenerator from "@/components/password-generator";
import RandomNews from "@/components/random-news";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
      <Header />
      <main className="w-full max-w-2xl mx-auto mt-12">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
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
        </Tabs>
      </main>
    </div>
  );
}
