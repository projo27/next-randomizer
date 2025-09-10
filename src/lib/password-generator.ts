const consonants = "bcdfghjklmnpqrstvwxyz";
const vowels = "aeiou";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function getRandomChar(str: string) {
  return str.charAt(Math.floor(Math.random() * str.length));
}

export function generateReadablePassword(
  length: number,
  useNumbers: boolean,
  useSymbols: boolean
): string {
  let password = "";
  let charSet = "";

  for (let i = 0; i < length; i++) {
    // Alternate vowel/consonant for readability
    if (i % 2 === 0) {
      charSet = consonants;
    } else {
      charSet = vowels;
    }

    // Occasionally swap with a number or symbol if enabled
    if (useNumbers && Math.random() < 0.2) {
      // 20% chance
      password += getRandomChar(numbers);
      continue;
    }
    if (useSymbols && Math.random() < 0.15) {
      // 15% chance
      password += getRandomChar(symbols);
      continue;
    }

    password += getRandomChar(charSet);
  }

  // Ensure at least one number and one symbol if requested, if they didn't get added by chance.
  if (useNumbers && !/\d/.test(password)) {
    const randomIndex = Math.floor(Math.random() * password.length);
    password =
      password.substring(0, randomIndex) +
      getRandomChar(numbers) +
      password.substring(randomIndex + 1);
  }

  if (
    useSymbols &&
    !/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)
  ) {
    const randomIndex = Math.floor(Math.random() * password.length);
    password =
      password.substring(0, randomIndex) +
      getRandomChar(symbols) +
      password.substring(randomIndex + 1);
  }

  return password.slice(0, length);
}
