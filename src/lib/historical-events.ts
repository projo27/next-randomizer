export type HistoricalEvent = {
    date: string; // YYYY-MM-DD
    description: string;
    category: 'Science' | 'Politics' | 'Art' | 'Technology' | 'Exploration' | 'War' | 'Culture' | 'Disaster';
};
  
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
    // January
    { date: "1863-01-01", description: "Abraham Lincoln signs the Emancipation Proclamation, declaring slaves in Confederate states to be free.", category: "Politics" },
    { date: "1999-01-01", description: "The Euro currency is introduced electronically.", category: "Politics" },
    { date: "1959-01-03", description: "Alaska is admitted as the 49th U.S. state.", category: "Politics" },
    { date: "2007-01-09", description: "Steve Jobs introduces the first Apple iPhone at a Macworld keynote in San Francisco.", category: "Technology" },
    { date: "1776-01-10", description: "Thomas Paine publishes his influential pamphlet 'Common Sense'.", category: "Politics" },
    { date: "1922-01-11", description: "The first successful insulin treatment for diabetes is administered to a 14-year-old boy in Toronto, Canada.", category: "Science" },
    { date: "1908-01-24", description: "The first Boy Scout troop is organized in England by Robert Baden-Powell.", category: "Culture" },
    { date: "1986-01-28", description: "The Space Shuttle Challenger breaks apart 73 seconds into its flight, killing all seven crew members.", category: "Disaster" },
  
    // February
    { date: "2004-02-04", description: "Mark Zuckerberg launches 'Thefacebook', a social networking site for Harvard students, which would later become Facebook.", category: "Technology" },
    { date: "1812-02-07", description: "A major earthquake, one of the New Madrid earthquakes, strikes the central United States.", category: "Disaster" },
    { date: "1990-02-11", description: "Nelson Mandela is released from prison after 27 years.", category: "Politics" },
    { date: "1455-02-23", description: "Johannes Gutenberg prints the first book, the Gutenberg Bible, using movable type.", category: "Technology" },
    { date: "1997-02-22", description: "Scientists in Scotland announce they have cloned an adult mammal, a sheep named Dolly.", category: "Science" },

    // March
    { date: "1876-03-07", description: "Alexander Graham Bell is granted a patent for an invention he calls the 'telephone'.", category: "Technology" },
    { date: "44 BC-03-15", description: "Julius Caesar is assassinated by a group of Roman senators.", category: "War" },
    { date: "1965-03-18", description: "Cosmonaut Alexei Leonov becomes the first person to walk in space.", category: "Exploration" },
    { date: "1989-03-24", description: "The Exxon Valdez oil tanker runs aground in Alaska's Prince William Sound, causing a massive oil spill.", category: "Disaster" },

    // April
    { date: "1912-04-15", description: "The RMS Titanic sinks in the North Atlantic after hitting an iceberg, resulting in over 1,500 deaths.", category: "Disaster" },
    { date: "1961-04-12", description: "Soviet cosmonaut Yuri Gagarin becomes the first human to travel into outer space.", category: "Exploration" },
    { date: "1986-04-26", description: "A catastrophic nuclear accident occurs at the Chernobyl Nuclear Power Plant in Ukraine.", category: "Disaster" },
    { date: "1789-04-30", description: "George Washington is inaugurated as the first President of the United States.", category: "Politics" },

    // May
    { date: "1937-05-06", description: "The German airship Hindenburg bursts into flames and crashes in Lakehurst, New Jersey.", category: "Disaster" },
    { date: "1953-05-29", description: "Edmund Hillary and Tenzing Norgay become the first people to reach the summit of Mount Everest.", category: "Exploration" },
    { date: "1503-05-10", description: "Christopher Columbus discovers the Cayman Islands.", category: "Exploration" },
    { date: "1431-05-30", description: "Joan of Arc is burned at the stake in Rouen, France.", category: "War" },

    // June
    { date: "1944-06-06", description: "D-Day: Allied forces launch the largest amphibious invasion in history, landing on the beaches of Normandy, France.", category: "War" },
    { date: "1215-06-15", description: "King John of England is forced to sign the Magna Carta, a foundational document for constitutional law.", category: "Politics" },
    { date: "1914-06-28", description: "Archduke Franz Ferdinand of Austria is assassinated in Sarajevo, sparking the beginning of World War I.", category: "War" },

    // July
    { date: "1776-07-04", description: "The United States Declaration of Independence is adopted by the Second Continental Congress.", category: "Politics" },
    { date: "1969-07-20", description: "Apollo 11 astronauts Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon.", category: "Exploration" },
    { date: "1888-07-10", description: "Vincent van Gogh completes his painting 'The Starry Night'.", category: "Art" },

    // August
    { date: "1963-08-28", description: "Martin Luther King Jr. delivers his 'I Have a Dream' speech during the March on Washington.", category: "Culture" },
    { date: "79-08-24", description: "Mount Vesuvius erupts, destroying the Roman cities of Pompeii and Herculaneum.", category: "Disaster" },
    { date: "1945-08-06", description: "The United States drops an atomic bomb on Hiroshima, Japan.", category: "War" },
    { date: "1945-08-09", description: "The United States drops a second atomic bomb on Nagasaki, Japan.", category: "War" },

    // September
    { date: "2001-09-11", description: "Terrorists hijack four commercial airplanes, crashing them into the World Trade Center, the Pentagon, and a field in Pennsylvania.", category: "Disaster" },
    { date: "1928-09-15", description: "Alexander Fleming discovers penicillin.", category: "Science" },
    { date: "1939-09-01", description: "Germany invades Poland, initiating World War II in Europe.", category: "War" },
    
    // October
    { date: "1492-10-12", description: "Christopher Columbus makes his first landfall in the Americas, arriving on an island in the Bahamas.", category: "Exploration" },
    { date: "1957-10-04", description: "The Soviet Union launches Sputnik 1, the first artificial satellite to orbit the Earth.", category: "Technology" },
    { date: "1929-10-29", description: "The Wall Street Crash of 1929, known as 'Black Tuesday', occurs, triggering the Great Depression.", category: "Politics" },
    { date: "1517-10-31", description: "Martin Luther posts his Ninety-five Theses on the door of All Saints' Church in Wittenberg, sparking the Protestant Reformation.", category: "Culture" },

    // November
    { date: "1989-11-09", description: "The Berlin Wall is opened, leading to the reunification of Germany.", category: "Politics" },
    { date: "1963-11-22", description: "U.S. President John F. Kennedy is assassinated in Dallas, Texas.", category: "Politics" },
    { date: "1922-11-04", description: "British archaeologist Howard Carter discovers the entrance to Tutankhamun's tomb in Egypt.", category: "Exploration" },

    // December
    { date: "1903-12-17", description: "The Wright brothers, Orville and Wilbur, make the first successful sustained flight of a powered, heavier-than-air aircraft.", category: "Technology" },
    { date: "1941-12-07", description: "The Imperial Japanese Navy launches a surprise attack on the US naval base at Pearl Harbor, Hawaii.", category: "War" },
    { date: "1865-12-18", description: "The Thirteenth Amendment to the U.S. Constitution, abolishing slavery, is officially adopted.", category: "Politics" }
];