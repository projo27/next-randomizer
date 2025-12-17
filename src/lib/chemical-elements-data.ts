// src/lib/chemical-elements-data.ts
export type ChemicalElement = {
  name: string;
  symbol: string;
  atomicNumber: number;
  atomicMass: number;
  category: string;
  group: number;
  period: number;
  block: string;
  electronConfiguration: string;
  summary: string;
  discovered_by: string;
  named_by: string | null;
  appearance: string | null;
  phase: 'Gas' | 'Liquid' | 'Solid';
  source: string; // URL to wikipedia
  color: string; // Hex color for category
};

export const CHEMICAL_ELEMENTS: ChemicalElement[] = [
  {
    "atomicNumber": 1,
    "symbol": "H",
    "name": "Hydrogen",
    "atomicMass": 1.008,
    "category": "diatomic-nonmetal",
    "group": 1,
    "period": 1,
    "block": "s",
    "electronConfiguration": "1s1",
    "summary": "Hydrogen is the most abundant chemical element in the universe, constituting roughly 75% of all baryonic mass. It is a colorless, odorless, tasteless, non-toxic, and highly combustible diatomic gas with the molecular formula H₂.",
    "discovered_by": "Henry Cavendish",
    "named_by": "Antoine Lavoisier",
    "appearance": "colorless gas",
    "phase": "Gas",
    "source": "https://en.wikipedia.org/wiki/Hydrogen",
    "color": "#a8ffc1"
  },
  {
    "atomicNumber": 2,
    "symbol": "He",
    "name": "Helium",
    "atomicMass": 4.0026,
    "category": "noble-gas",
    "group": 18,
    "period": 1,
    "block": "s",
    "electronConfiguration": "1s2",
    "summary": "Helium is a chemical element with symbol He and atomic number 2. It is a colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas group in the periodic table. Its boiling point is the lowest among all the elements.",
    "discovered_by": "Pierre Janssen & Norman Lockyer",
    "named_by": null,
    "appearance": "colorless gas",
    "phase": "Gas",
    "source": "https://en.wikipedia.org/wiki/Helium",
    "color": "#d0bfff"
  },
  {
    "atomicNumber": 3,
    "symbol": "Li",
    "name": "Lithium",
    "atomicMass": 6.94,
    "category": "alkali-metal",
    "group": 1,
    "period": 2,
    "block": "s",
    "electronConfiguration": "[He] 2s1",
    "summary": "Lithium is a chemical element with symbol Li and atomic number 3. It is a soft, silvery-white alkali metal. Under standard conditions, it is the lightest metal and the least dense solid element. Like all alkali metals, lithium is highly reactive and flammable, and is stored in mineral oil.",
    "discovered_by": "Johan August Arfwedson",
    "named_by": null,
    "appearance": "silvery-white",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Lithium",
    "color": "#ff6961"
  },
  {
    "atomicNumber": 6,
    "symbol": "C",
    "name": "Carbon",
    "atomicMass": 12.011,
    "category": "polyatomic-nonmetal",
    "group": 14,
    "period": 2,
    "block": "p",
    "electronConfiguration": "[He] 2s2 2p2",
    "summary": "Carbon is a chemical element with symbol C and atomic number 6. It is nonmetallic and tetravalent—making four electrons available to form covalent chemical bonds. It belongs to group 14 of the periodic table. Carbon is the basis of all known life on Earth.",
    "discovered_by": "Ancient civilizations",
    "named_by": null,
    "appearance": "black (graphite), transparent (diamond)",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Carbon",
    "color": "#b3b3b3"
  },
  {
    "atomicNumber": 8,
    "symbol": "O",
    "name": "Oxygen",
    "atomicMass": 15.999,
    "category": "diatomic-nonmetal",
    "group": 16,
    "period": 2,
    "block": "p",
    "electronConfiguration": "[He] 2s2 2p4",
    "summary": "Oxygen is a chemical element with symbol O and atomic number 8. It is a member of the chalcogen group on the periodic table, a highly reactive nonmetal, and an oxidizing agent that readily forms oxides with most elements as well as with other compounds. By mass, oxygen is the third-most abundant element in the universe, after hydrogen and helium.",
    "discovered_by": "Carl Wilhelm Scheele & Joseph Priestley",
    "named_by": "Antoine Lavoisier",
    "appearance": "colorless gas, pale blue liquid",
    "phase": "Gas",
    "source": "https://en.wikipedia.org/wiki/Oxygen",
    "color": "#a8ffc1"
  },
  {
    "atomicNumber": 26,
    "symbol": "Fe",
    "name": "Iron",
    "atomicMass": 55.845,
    "category": "transition-metal",
    "group": 8,
    "period": 4,
    "block": "d",
    "electronConfiguration": "[Ar] 3d6 4s2",
    "summary": "Iron is a chemical element with symbol Fe and atomic number 26. It is a metal that belongs to the first transition series and group 8 of the periodic table. It is by mass the most common element on Earth, forming much of Earth's outer and inner core. It is the fourth most common element in the Earth's crust.",
    "discovered_by": "Ancient civilizations",
    "named_by": null,
    "appearance": "lustrous metallic with a grayish tinge",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Iron",
    "color": "#ffc1c1"
  },
  {
    "atomicNumber": 29,
    "symbol": "Cu",
    "name": "Copper",
    "atomicMass": 63.546,
    "category": "transition-metal",
    "group": 11,
    "period": 4,
    "block": "d",
    "electronConfiguration": "[Ar] 3d10 4s1",
    "summary": "Copper is a chemical element with symbol Cu and atomic number 29. It is a soft, malleable, and ductile metal with very high thermal and electrical conductivity. A freshly exposed surface of pure copper has a reddish-orange color.",
    "discovered_by": "Ancient civilizations",
    "named_by": null,
    "appearance": "red-orange metallic luster",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Copper",
    "color": "#ffc1c1"
  },
  {
    "atomicNumber": 47,
    "symbol": "Ag",
    "name": "Silver",
    "atomicMass": 107.8682,
    "category": "transition-metal",
    "group": 11,
    "period": 5,
    "block": "d",
    "electronConfiguration": "[Kr] 4d10 5s1",
    "summary": "Silver is a chemical element with symbol Ag and atomic number 47. A soft, white, lustrous transition metal, it exhibits the highest electrical conductivity, thermal conductivity, and reflectivity of any metal.",
    "discovered_by": "Ancient civilizations",
    "named_by": null,
    "appearance": "lustrous white metal",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Silver",
    "color": "#ffc1c1"
  },
  {
    "atomicNumber": 79,
    "symbol": "Au",
    "name": "Gold",
    "atomicMass": 196.96657,
    "category": "transition-metal",
    "group": 11,
    "period": 6,
    "block": "d",
    "electronConfiguration": "[Xe] 4f14 5d10 6s1",
    "summary": "Gold is a chemical element with symbol Au and atomic number 79, making it one of the higher atomic number elements that occur naturally. In its purest form, it is a bright, slightly reddish yellow, dense, soft, malleable, and ductile metal.",
    "discovered_by": "Ancient civilizations",
    "named_by": null,
    "appearance": "metallic yellow",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Gold",
    "color": "#ffc1c1"
  },
  {
    "atomicNumber": 82,
    "symbol": "Pb",
    "name": "Lead",
    "atomicMass": 207.2,
    "category": "post-transition-metal",
    "group": 14,
    "period": 6,
    "block": "p",
    "electronConfiguration": "[Xe] 4f14 5d10 6s2 6p2",
    "summary": "Lead is a chemical element with symbol Pb and atomic number 82. It is a heavy metal that is denser than most common materials. Lead is soft and malleable, and also has a relatively low melting point. When freshly cut, lead is silvery with a hint of blue; it tarnishes to a dull gray color when exposed to air.",
    "discovered_by": "Ancient civilizations",
    "named_by": null,
    "appearance": "metallic gray",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Lead",
    "color": "#d1d1e0"
  },
  {
    "atomicNumber": 92,
    "symbol": "U",
    "name": "Uranium",
    "atomicMass": 238.02891,
    "category": "actinide",
    "group": 3,
    "period": 7,
    "block": "f",
    "electronConfiguration": "[Rn] 5f3 6d1 7s2",
    "summary": "Uranium is a chemical element with symbol U and atomic number 92. It is a silvery-grey metal in the actinide series of the periodic table. A uranium atom has 92 protons and 92 electrons, of which 6 are valence electrons. Uranium is weakly radioactive because all isotopes of uranium are unstable.",
    "discovered_by": "Martin Heinrich Klaproth",
    "named_by": null,
    "appearance": "silvery-grey metallic",
    "phase": "Solid",
    "source": "https://en.wikipedia.org/wiki/Uranium",
    "color": "#f8bfff"
  }
];
