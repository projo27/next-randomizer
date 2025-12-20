// src/lib/tanakh-data.ts

export type TanakhBook = {
  name: string;
  hebrewName: string;
  chapters: number;
  category: 'Torah' | "Nevi'im" | 'Ketuvim';
};

export const TANAKH_BOOKS: TanakhBook[] = [
  // Torah (The Law)
  { name: 'Genesis', hebrewName: 'בראשית', chapters: 50, category: 'Torah' },
  { name: 'Exodus', hebrewName: 'שמות', chapters: 40, category: 'Torah' },
  { name: 'Leviticus', hebrewName: 'ויקרא', chapters: 27, category: 'Torah' },
  { name: 'Numbers', hebrewName: 'במדבר', chapters: 36, category: 'Torah' },
  { name: 'Deuteronomy', hebrewName: 'דברים', chapters: 34, category: 'Torah' },

  // Nevi'im (The Prophets)
  { name: 'Joshua', hebrewName: 'יהושע', chapters: 24, category: "Nevi'im" },
  { name: 'Judges', hebrewName: 'שופטים', chapters: 21, category: "Nevi'im" },
  { name: '1 Samuel', hebrewName: 'שמואל א', chapters: 31, category: "Nevi'im" },
  { name: '2 Samuel', hebrewName: 'שמואל ב', chapters: 24, category: "Nevi'im" },
  { name: '1 Kings', hebrewName: 'מלכים א', chapters: 22, category: "Nevi'im" },
  { name: '2 Kings', hebrewName: 'מלכים ב', chapters: 25, category: "Nevi'im" },
  { name: 'Isaiah', hebrewName: 'ישעיהו', chapters: 66, category: "Nevi'im" },
  { name: 'Jeremiah', hebrewName: 'ירמיהו', chapters: 52, category: "Nevi'im" },
  { name: 'Ezekiel', hebrewName: 'יחזקאל', chapters: 48, category: "Nevi'im" },
  { name: 'Hosea', hebrewName: 'הושע', chapters: 14, category: "Nevi'im" },
  { name: 'Joel', hebrewName: 'יואל', chapters: 4, category: "Nevi'im" },
  { name: 'Amos', hebrewName: 'עמוס', chapters: 9, category: "Nevi'im" },
  { name: 'Obadiah', hebrewName: 'עובדיה', chapters: 1, category: "Nevi'im" },
  { name: 'Jonah', hebrewName: 'יונה', chapters: 4, category: "Nevi'im" },
  { name: 'Micah', hebrewName: 'מיכה', chapters: 7, category: "Nevi'im" },
  { name: 'Nahum', hebrewName: 'נחום', chapters: 3, category: "Nevi'im" },
  { name: 'Habakkuk', hebrewName: 'חבקוק', chapters: 3, category: "Nevi'im" },
  { name: 'Zephaniah', hebrewName: 'צפניה', chapters: 3, category: "Nevi'im" },
  { name: 'Haggai', hebrewName: 'חגי', chapters: 2, category: "Nevi'im" },
  { name: 'Zechariah', hebrewName: 'זכריה', chapters: 14, category: "Nevi'im" },
  { name: 'Malachi', hebrewName: 'מלאכי', chapters: 3, category: "Nevi'im" },

  // Ketuvim (The Writings)
  { name: 'Psalms', hebrewName: 'תהילים', chapters: 150, category: 'Ketuvim' },
  { name: 'Proverbs', hebrewName: 'משלי', chapters: 31, category: 'Ketuvim' },
  { name: 'Job', hebrewName: 'איוב', chapters: 42, category: 'Ketuvim' },
  { name: 'Song of Songs', hebrewName: 'שיר השירים', chapters: 8, category: 'Ketuvim' },
  { name: 'Ruth', hebrewName: 'רות', chapters: 4, category: 'Ketuvim' },
  { name: 'Lamentations', hebrewName: 'איכה', chapters: 5, category: 'Ketuvim' },
  { name: 'Ecclesiastes', hebrewName: 'קהלת', chapters: 12, category: 'Ketuvim' },
  { name: 'Esther', hebrewName: 'אסתר', chapters: 10, category: 'Ketuvim' },
  { name: 'Daniel', hebrewName: 'דניאל', chapters: 12, category: 'Ketuvim' },
  { name: 'Ezra', hebrewName: 'עזרא', chapters: 10, category: 'Ketuvim' },
  { name: 'Nehemiah', hebrewName: 'נחמיה', chapters: 13, category: 'Ketuvim' },
  { name: '1 Chronicles', hebrewName: 'דברי הימים א', chapters: 29, category: 'Ketuvim' },
  { name: '2 Chronicles', hebrewName: 'דברי הימים ב', chapters: 36, category: 'Ketuvim' },
];
