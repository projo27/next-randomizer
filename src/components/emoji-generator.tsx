"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type Emoji = {
  char: string;
  name: string;
};

const EMOJI_CATEGORIES: Record<string, Emoji[]> = {
    "Smileys & Emotion": [
      { char: "😀", name: "Grinning Face" }, { char: "😃", name: "Grinning Face with Big Eyes" }, { char: "😄", name: "Grinning Face with Smiling Eyes" }, { char: "😁", name: "Beaming Face with Smiling Eyes" }, { char: "😆", name: "Grinning Squinting Face" }, { char: "😅", name: "Grinning Face with Sweat" }, { char: "😂", name: "Face with Tears of Joy" }, { char: "🤣", name: "Rolling on the Floor Laughing" }, { char: "😊", name: "Smiling Face with Smiling Eyes" }, { char: "😇", name: "Smiling Face with Halo" }, { char: "🙂", name: "Slightly Smiling Face" }, { char: "🙃", name: "Upside-Down Face" }, { char: "😉", name: "Winking Face" }, { char: "😌", name: "Relieved Face" }, { char: "😍", name: "Smiling Face with Heart-Eyes" }, { char: "🥰", name: "Smiling Face with Hearts" }, { char: "😘", name: "Face Blowing a Kiss" }, { char: "😗", name: "Kissing Face" }, { char: "😙", name: "Kissing Face with Smiling Eyes" }, { char: "😚", name: "Kissing Face with Closed Eyes" }, { char: "😋", name: "Face Savoring Food" }, { char: "😛", name: "Face with Tongue" }, { char: "😜", name: "Winking Face with Tongue" }, { char: "🤪", name: "Zany Face" }, { char: "🤨", name: "Face with Raised Eyebrow" }, { char: "🧐", name: "Face with Monocle" }, { char: "🤓", name: "Nerd Face" }, { char: "😎", name: "Smiling Face with Sunglasses" }, { char: "🥸", name: "Disguised Face" }, { char: "🤩", name: "Star-Struck" }, { char: "🥳", name: "Partying Face" }, { char: "😏", name: "Smirking Face" }, { char: "😒", name: "Unamused Face" }, { char: "😞", name: "Disappointed Face" }, { char: "😔", name: "Pensive Face" }, { char: "😟", name: "Worried Face" }, { char: "😕", name: "Confused Face" }, { char: "🙁", name: "Slightly Frowning Face" }, { char: "☹️", name: "Frowning Face" }, { char: "😣", name: "Persevering Face" }, { char: "😖", name: "Confounded Face" }, { char: "😫", name: "Tired Face" }, { char: "😩", name: "Weary Face" }, { char: "🥺", name: "Pleading Face" }, { char: "😢", name: "Crying Face" }, { char: "😭", name: "Loudly Crying Face" }, { char: "😤", name: "Face with Steam From Nose" }, { char: "😠", name: "Angry Face" }, { char: "😡", name: "Pouting Face" }, { char: "🤬", name: "Face with Symbols on Mouth" }, { char: "🤯", name: "Exploding Head" }, { char: "😳", name: "Flushed Face" }, { char: "🥵", name: "Hot Face" }, { char: "🥶", name: "Cold Face" }, { char: "😱", name: "Face Screaming in Fear" }, { char: "😨", name: "Fearful Face" }, { char: "😰", name: "Anxious Face with Sweat" }, { char: "😥", name: "Sad but Relieved Face" }, { char: "😓", name: "Downcast Face with Sweat" }, { char: "🤗", name: "Hugging Face" }, { char: "🤔", name: "Thinking Face" }, { char: "🤭", name: "Face with Hand Over Mouth" }, { char: "🤫", name: "Shushing Face" }, { char: "🤥", name: "Lying Face" }, { char: "😶", name: "Face Without Mouth" }, { char: "😐", name: "Neutral Face" }, { char: "😑", name: "Expressionless Face" }, { char: "😬", name: "Grimacing Face" }, { char: "🙄", name: "Face with Rolling Eyes" }, { char: "😯", name: "Hushed Face" }, { char: "😦", name: "Frowning Face with Open Mouth" }, { char: "😧", name: "Anguished Face" }, { char: "😮", name: "Face with Open Mouth" }, { char: "😲", name: "Astonished Face" }, { char: "🥱", name: "Yawning Face" }, { char: "😴", name: "Sleeping Face" }, { char: "🤤", name: "Drooling Face" }, { char: "😪", name: "Sleepy Face" }, { char: "😵", name: "Dizzy Face" }, { char: "🤐", name: "Zipper-Mouth Face" }, { char: "🥴", name: "Woozy Face" }, { char: "🤢", name: "Nauseated Face" }, { char: "🤮", name: "Face Vomiting" }, { char: "🤧", name: "Sneezing Face" }, { char: "😷", name: "Face with Medical Mask" }, { char: "🤒", name: "Face with Thermometer" }, { char: "🤕", name: "Face with Head-Bandage" }, { char: "🤑", name: "Money-Mouth Face" }, { char: "🤠", name: "Cowboy Hat Face" }
    ],
    "People & Body": [
        { char: '👋', name: 'Waving Hand' }, { char: '🤚', name: 'Raised Back of Hand' }, { char: '🖐️', name: 'Hand with Fingers Splayed' }, { char: '✋', name: 'Raised Hand' }, { char: '🖖', name: 'Vulcan Salute' }, { char: '👌', name: 'OK Hand' }, { char: '🤏', name: 'Pinching Hand' }, { char: '✌️', name: 'Victory Hand' }, { char: '🤞', name: 'Crossed Fingers' }, { char: '🤟', name: 'Love-You Gesture' }, { char: '🤘', name: 'Sign of the Horns' }, { char: '🤙', name: 'Call Me Hand' }, { char: '👈', name: 'Backhand Index Pointing Left' }, { char: '👉', name: 'Backhand Index Pointing Right' }, { char: '👆', name: 'Backhand Index Pointing Up' }, { char: '🖕', name: 'Middle Finger' }, { char: '👇', name: 'Backhand Index Pointing Down' }, { char: '☝️', name: 'Index Pointing Up' }, { char: '👍', name: 'Thumbs Up' }, { char: '👎', name: 'Thumbs Down' }, { char: '✊', name: 'Raised Fist' }, { char: '👊', name: 'Oncoming Fist' }, { char: '🤛', name: 'Left-Facing Fist' }, { char: '🤜', name: 'Right-Facing Fist' }, { char: '👏', name: 'Clapping Hands' }, { char: '🙌', name: 'Raising Hands' }, { char: '👐', name: 'Open Hands' }, { char: '🤲', name: 'Palms Up Together' }, { char: '🤝', name: 'Handshake' }, { char: '🙏', name: 'Folded Hands' }, { char: '✍️', name: 'Writing Hand' }, { char: '💅', name: 'Nail Polish' }, { char: '🤳', name: 'Selfie' }, { char: '💪', name: 'Flexed Biceps' }, { char: '🦾', name: 'Mechanical Arm' }, { char: '🦵', name: 'Leg' }, { char: '🦿', name: 'Mechanical Leg' }, { char: '🦶', name: 'Foot' }, { char: '👂', name: 'Ear' }, { char: '🦻', name: 'Ear with Hearing Aid' }, { char: '👃', name: 'Nose' }, { char: '🧠', name: 'Brain' }, { char: '🦷', name: 'Tooth' }, { char: '🦴', name: 'Bone' }, { char: '👀', name: 'Eyes' }, { char: '👁️', name: 'Eye' }, { char: '👅', name: 'Tongue' }, { char: '👄', name: 'Mouth' }, { char: '👶', name: 'Baby' }, { char: '🧒', name: 'Child' }, { char: '👦', name: 'Boy' }, { char: '👧', name: 'Girl' }
    ],
    "Animals & Nature": [
        { char: '🐶', name: 'Dog Face' }, { char: '🐱', name: 'Cat Face' }, { char: '🐭', name: 'Mouse Face' }, { char: '🐹', name: 'Hamster' }, { char: '🐰', name: 'Rabbit Face' }, { char: '🦊', name: 'Fox' }, { char: '🐻', name: 'Bear' }, { char: '🐼', name: 'Panda' }, { char: '🐨', name: 'Koala' }, { char: '🐯', name: 'Tiger Face' }, { char: '🦁', name: 'Lion' }, { char: '🐮', name: 'Cow Face' }, { char: '🐷', name: 'Pig Face' }, { char: '🐽', name: 'Pig Nose' }, { char: '🐸', name: 'Frog' }, { char: '🐵', name: 'Monkey Face' }, { char: '🙈', name: 'See-No-Evil Monkey' }, { char: '🙉', name: 'Hear-No-Evil Monkey' }, { char: '🙊', name: 'Speak-No-Evil Monkey' }, { char: '🐒', name: 'Monkey' }, { char: '🐔', name: 'Chicken' }, { char: '🐧', name: 'Penguin' }, { char: '🐦', name: 'Bird' }, { char: '🐤', name: 'Baby Chick' }, { char: '🐣', name: 'Hatching Chick' }, { char: '🐥', name: 'Front-Facing Baby Chick' }, { char: '🦆', name: 'Duck' }, { char: '🦅', name: 'Eagle' }, { char: '🦉', name: 'Owl' }, { char: '🦇', name: 'Bat' }, { char: '🐺', name: 'Wolf' }, { char: '🐗', name: 'Boar' }, { char: '🐴', name: 'Horse Face' }, { char: '🦄', name: 'Unicorn' }, { char: '🐝', name: 'Honeybee' }, { char: '🐛', name: 'Bug' }, { char: '🦋', name: 'Butterfly' }, { char: '🐌', name: 'Snail' }, { char: '🐞', name: 'Lady Beetle' }, { char: '🐜', name: 'Ant' }, { char: '🦟', name: 'Mosquito' }, { char: '🦗', name: 'Cricket' }, { char: '🕷️', name: 'Spider' }, { char: '🦂', name: 'Scorpion' }, { char: '🐢', name: 'Turtle' }, { char: '🐍', name: 'Snake' }, { char: '🦎', name: 'Lizard' }, { char: '🦖', name: 'T-Rex' }, { char: '🦕', name: 'Sauropod' }, { char: '🐙', name: 'Octopus' }, { char: '🦑', name: 'Squid' }, { char: '🦐', name: 'Shrimp' }, { char: '🦞', name: 'Lobster' }, { char: '🦀', name: 'Crab' }, { char: '🐡', name: 'Blowfish' }, { char: '🐠', name: 'Tropical Fish' }, { char: '🐟', name: 'Fish' }, { char: '🐬', name: 'Dolphin' }, { char: '🐳', name: 'Spouting Whale' }, { char: '🐋', name: 'Whale' }, { char: '🦈', name: 'Shark' }, { char: '🐊', name: 'Crocodile' }
    ],
    "Food & Drink": [
        { char: '🍇', name: 'Grapes' }, { char: '🍈', name: 'Melon' }, { char: '🍉', name: 'Watermelon' }, { char: '🍊', name: 'Tangerine' }, { char: '🍋', name: 'Lemon' }, { char: '🍌', name: 'Banana' }, { char: '🍍', name: 'Pineapple' }, { char: '🥭', name: 'Mango' }, { char: '🍎', name: 'Red Apple' }, { char: '🍏', name: 'Green Apple' }, { char: '🍐', name: 'Pear' }, { char: '🍑', name: 'Peach' }, { char: '🍒', name: 'Cherries' }, { char: '🍓', name: 'Strawberry' }, { char: '🥝', name: 'Kiwifruit' }, { char: '🍅', name: 'Tomato' }, { char: '🥥', name: 'Coconut' }, { char: '🥑', name: 'Avocado' }, { char: '🍆', name: 'Eggplant' }, { char: '🥔', name: 'Potato' }, { char: '🥕', name: 'Carrot' }, { char: '🌽', name: 'Ear of Corn' }, { char: '🌶️', name: 'Hot Pepper' }, { char: '🥒', name: 'Cucumber' }, { char: '🥬', name: 'Leafy Green' }, { char: '🥦', name: 'Broccoli' }, { char: '🧄', name: 'Garlic' }, { char: '🧅', name: 'Onion' }, { char: '🍄', name: 'Mushroom' }, { char: '🥜', name: 'Peanuts' }, { char: '🌰', name: 'Chestnut' }, { char: '🍞', name: 'Bread' }, { char: '🥐', name: 'Croissant' }, { char: '🥖', name: 'Baguette Bread' }, { char: '🥨', name: 'Pretzel' }, { char: '🥯', name: 'Bagel' }, { char: '🥞', name: 'Pancakes' }, { char: '🧇', name: 'Waffle' }, { char: '🧀', name: 'Cheese Wedge' }, { char: '🍖', name: 'Meat on Bone' }, { char: '🍗', name: 'Poultry Leg' }, { char: '🥩', name: 'Cut of Meat' }, { char: '🥓', name: 'Bacon' }, { char: '🍔', name: 'Hamburger' }, { char: '🍟', name: 'French Fries' }, { char: '🍕', name: 'Pizza' }, { char: '🌭', name: 'Hot Dog' }, { char: '🥪', name: 'Sandwich' }, { char: '🌮', name: 'Taco' }, { char: '🌯', name: 'Burrito' }, { char: '🥙', name: 'Stuffed Flatbread' }
    ],
    "Symbols": [
        { char: '❤️', name: 'Red Heart' }, { char: '🧡', name: 'Orange Heart' }, { char: '💛', name: 'Yellow Heart' }, { char: '💚', name: 'Green Heart' }, { char: '💙', name: 'Blue Heart' }, { char: '💜', name: 'Purple Heart' }, { char: '🖤', name: 'Black Heart' }, { char: '🤍', name: 'White Heart' }, { char: '🤎', name: 'Brown Heart' }, { char: '💔', name: 'Broken Heart' }, { char: '❣️', name: 'Heart Exclamation' }, { char: '💕', name: 'Two Hearts' }, { char: '💞', name: 'Revolving Hearts' }, { char: '💓', name: 'Beating Heart' }, { char: '💗', name: 'Growing Heart' }, { char: '💖', name: 'Sparkling Heart' }, { char: '💘', name: 'Heart with Arrow' }, { char: '💝', name: 'Heart with Ribbon' }, { char: '💟', name: 'Heart Decoration' }, { char: '☮️', name: 'Peace Symbol' }, { char: '✝️', name: 'Latin Cross' }, { char: '☪️', name: 'Star and Crescent' }, { char: '🕉️', name: 'Om' }, { char: '☸️', name: 'Wheel of Dharma' }, { char: '✡️', name: 'Star of David' }, { char: '🔯', name: 'Dotted Six-Pointed Star' }, { char: '🕎', name: 'Menorah' }, { char: '☯️', name: 'Yin Yang' }, { char: '☦️', name: 'Orthodox Cross' }, { char: '🛐', name: 'Place of Worship' }, { char: '⛎', name: 'Ophiuchus' }, { char: '♈', name: 'Aries' }, { char: '♉', name: 'Taurus' }, { char: '♊', name: 'Gemini' }, { char: '♋', name: 'Cancer' }, { char: '♌', name: 'Leo' }, { char: '♍', name: 'Virgo' }, { char: '♎', name: 'Libra' }, { char: '♏', name: 'Scorpio' }, { char: '♐', name: 'Sagittarius' }, { char: '♑', name: 'Capricorn' }, { char: '♒', name: 'Aquarius' }, { char: '♓', name: 'Pisces' }, { char: '🆔', name: 'ID Button' }, { char: '⚛️', name: 'Atom Symbol' }
    ]
};

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

export default function EmojiGenerator() {
  const [count, setCount] = useState("5");
  const [category, setCategory] = useState("all");
  const [result, setResult] = useState<Emoji[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    setError(null);
    setIsGenerating(true);
    setIsCopied(false);
    setResult(null);

    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount <= 0 || numCount > 50) {
      setError("Please enter a number between 1 and 50.");
      setIsGenerating(false);
      return;
    }
    
    const emojiList: Emoji[] = category === "all" 
      ? ALL_EMOJIS 
      : EMOJI_CATEGORIES[category] || ALL_EMOJIS;

    const generated: Emoji[] = [];
    for (let i = 0; i < numCount; i++) {
      generated.push(emojiList[Math.floor(Math.random() * emojiList.length)]);
    }
    
    // Animation effect
    const interval = setInterval(() => {
        const tempResult: Emoji[] = [];
        for (let i = 0; i < numCount; i++) {
            tempResult.push(emojiList[Math.floor(Math.random() * emojiList.length)]);
        }
        setResult(tempResult);
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        setResult(generated);
        setIsGenerating(false);
    }, 1000);
  };

  const handleCopy = () => {
    if (!result) return;
    const resultString = result.map(e => e.char).join('');
    navigator.clipboard.writeText(resultString);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Emojis copied to clipboard.",
      duration: 2000
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Emoji Generator</CardTitle>
        <CardDescription>
          Generate a random sequence of fun emojis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
                <Label htmlFor="emoji-count">Number of Emojis</Label>
                <Input
                id="emoji-count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-20"
                disabled={isGenerating}
                />
            </div>
            <div className="flex items-center gap-2">
                <Label htmlFor="emoji-category">Category</Label>
                <Select
                    value={category}
                    onValueChange={setCategory}
                    disabled={isGenerating}
                >
                    <SelectTrigger id="emoji-category" className="w-full">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {Object.keys(EMOJI_CATEGORIES).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        {(result || isGenerating) && (
            <div className="relative min-h-[160px] flex items-center justify-center bg-muted/50 rounded-lg p-4">
                <div className="flex flex-wrap justify-center gap-4 text-6xl tracking-widest text-accent select-all">
                    {result?.map((emoji, index) => (
                        <span key={index} title={emoji.name} className="cursor-help">
                            {emoji.char}
                        </span>
                    ))}
                </div>
                 {result && !isGenerating && (
                    <div className="absolute top-2 right-2">
                         <Button variant="ghost" size="icon" onClick={handleCopy}>
                            {isCopied ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <Copy className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                )}
            </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Emojis"}
        </Button>
      </CardFooter>
    </Card>
  );
}
