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
  useSymbols: boolean,
  useUppercase: boolean
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

    let char = getRandomChar(charSet);
    if (useUppercase && Math.random() < 0.4) { // 40% chance of uppercase
      char = char.toUpperCase();
    }
    password += char;
  }

  // Ensure at least one uppercase letter if requested
  if (useUppercase && !/[A-Z]/.test(password)) {
    const randomIndex = Math.floor(Math.random() * password.length);
    const charToReplace = password[randomIndex];
    password =
      password.substring(0, randomIndex) +
      charToReplace.toUpperCase() +
      password.substring(randomIndex + 1);
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
