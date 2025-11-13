export const LANGUAGE_CODES = [
  { name: 'English', code: 'eng' },
  { name: 'Spanish', code: 'spa' },
  { name: 'French', code: 'fre' },
  { name: 'German', code: 'ger' },
  { name: 'Chinese', code: 'chi' },
  { name: 'Japanese', code: 'jpn' },
  { name: 'Russian', code: 'rus' },
  { name: 'Italian', code: 'ita' },
  { name: 'Portuguese', code: 'por' },
  { name: 'Dutch', code: 'dut' },
  { name: 'Arabic', code: 'ara' },
  { name: 'Hindi', code: 'hin' },
].sort((a, b) => a.name.localeCompare(b.name));
