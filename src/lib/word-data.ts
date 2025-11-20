// src/lib/word-data.ts

export const WORDS_BY_TYPE = {
  noun: [
    "Apple", "Banana", "Cat", "Dog", "Elephant", "Flower", "Guitar", "House", "Island", "Jungle",
    "Kite", "Lemon", "Mountain", "Notebook", "Ocean", "Piano", "Queen", "River", "Star", "Tree",
    "Universe", "Volcano", "Window", "Xylophone", "Yacht", "Zebra", "Actor", "Bridge", "City",
    "Desert", "Energy", "Forest", "Galaxy", "Helmet", "Igloo", "Jacket", "Kangaroo", "Lake",
    "Moon", "Nest", "Orange", "Planet", "Quilt", "Robot", "Ship", "Table", "Umbrella", "Village",
    "Water", "Xenon", "Yogurt", "Zone"
  ],
  pronoun: [
    "I", "You", "He", "She", "It", "We", "They", "Me", "Him", "Her", "Us", "Them", "Myself", 
    "Yourself", "Himself", "Herself", "Itself", "Ourselves", "Themselves", "Who", "Whom", 
    "Whose", "Which", "What", "This", "That", "These", "Those", "Somebody", "Anyone", "Everything"
  ],
  verb: [
    "Run", "Jump", "Sing", "Dance", "Think", "Create", "Explore", "Imagine", "Learn", "Write",
    "Read", "Speak", "Listen", "Watch", "Build", "Destroy", "Grow", "Shrink", "Fly", "Swim",
    "Walk", "Talk", "Eat", "Sleep", "Dream", "Hope", "Wish", "Believe", "Achieve", "Succeed",
    "Fail", "Try", "Cook", "Clean", "Drive", "Travel", "Discover", "Invent", "Solve", "Question",
    "Answer", "Laugh", "Cry", "Smile", "Frown", "Love", "Hate", "Give", "Take"
  ],
  adjective: [
    "Happy", "Sad", "Bright", "Dark", "Big", "Small", "Fast", "Slow", "Loud", "Quiet", "Beautiful",
    "Ugly", "Smart", "Simple", "Complex", "Easy", "Hard", "Brave", "Scared", "Kind", "Cruel",
    "Generous", "Stingy", "Honest", "Deceitful", "Ancient", "Modern", "Young", "Old", "New",
    "Colorful", "Dull", "Exciting", "Boring", "Peaceful", "Chaotic", "Mysterious", "Obvious",
    "Powerful", "Weak", "Vibrant", "Faded", "Radiant", "Gloomy", "Crisp", "Mellow"
  ],
  adverb: [
    "Quickly", "Slowly", "Happily", "Sadly", "Loudly", "Quietly", "Carefully", "Carelessly",
    "Always", "Never", "Sometimes", "Often", "Rarely", "Usually", "Today", "Yesterday",
    "Tomorrow", "Here", "There", "Everywhere", "Nowhere", "Very", "Extremely", "Quite",
    "Rather", "Almost", "Enough", "Too", "Well", "Badly", "Easily", "Barely", "Gently", "Roughly"
  ],
  preposition: [
    "About", "Above", "Across", "After", "Against", "Among", "Around", "At", "Before", "Behind",
    "Below", "Beneath", "Beside", "Between", "Beyond", "By", "Down", "During", "For", "From",
    "In", "Inside", "Into", "Like", "Near", "Of", "Off", "On", "Onto", "Out", "Outside", "Over",
    "Past", "Since", "Through", "To", "Toward", "Under", "Underneath", "Until", "Unto", "Up",
    "Upon", "With", "Within", "Without"
  ],
  conjunction: [
    "And", "But", "Or", "So", "For", "Nor", "Yet", "After", "Although", "As", "Because",
    "Before", "If", "Since", "Than", "Though", "Unless", "Until", "When", "Whenever", "Where",
    "Whereas", "Wherever", "Whether", "While", "Both", "Either", "Neither"
  ],
  interjection: [
    "Wow", "Ouch", "Hey", "Oh", "Oops", "Yay", "Hooray", "Alas", "Phew", "Ew", "Yikes", "Bravo",
    "Eureka", "Aha", "Well", "Oh no", "Gosh", "Jeez", "Indeed", "Psst"
  ],
  determiner: [
    "The", "A", "An", "This", "That", "These", "Those", "My", "Your", "His", "Her", "Its", "Our",
    "Their", "Some", "Any", "No", "Every", "Each", "All", "Both", "Either", "Neither", "Much",
    "Many", "Little", "Few", "Several", "What", "Which", "Whose"
  ],
  article: [
    "A", "An", "The"
  ]
};

export const ALL_WORDS = Object.values(WORDS_BY_TYPE).flat();
export const PARTS_OF_SPEECH = Object.keys(WORDS_BY_TYPE);
