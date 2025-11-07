# Randomizer.fun

"A fun app to randomize anything! and Your fun-filled tool for making choices!"

## Changelog :

- v1.1.7 : Plant Randomizer release
- v1.1.6 : Radio Channel Randomizer release
- v1.1.5 : Truth or Dare Randomizer release
- v1.1.4 : Meme Randomizer and Song Randomizer release
- v1.1.3 : Google Maps Place Randomizer release
- v1.1.2 : Country Randomizer and Gift Randomizer release
- v1.1.1 : Quote randomizer release
- v1.1.0 : Add tool ordering feature
- v1.0.2 : Add duration animation and randomizer audio
- v1.0.1 : Add PWA feature
- v1.0.0 : MVP of randomizer.fun with simple randomizer feature, firebase authentication and change the theme

## Randomizer Feature Tool :

- List Randomizer ✅
- Number Randomizer ✅
- Sequence Shuffler ✅
- Password Generator ✅
- Date Randomizer ✅
- Team Shuffler ✅
- Coin Flipper ✅
- Dice Roller ✅
- Rock Paper Scissor ✅
- Card Deck Randomizer ✅
- Lottery Generator ✅
- Emoji Randomizer ✅
- Color Palette Generator ✅
- Number Base Randomizer ✅
- Spinner Wheel ✅
- Image Randomizer Play ✅
- Youtube Randomizer (powered by youtube API) ✅
- OOTD - Fashion Out of The Day Randomizer (powered by runway.ai) ✅
- Travel City Randomizer (powered by gemini.ai and pixabay) ✅
- Truth or Dare Question Randomizer ✅
- Google sheet Randomizer
- Scripture randomizer (bible, quran, veda, tripitaka, Mormon),
- Random Poetry
- Random Quote ✅
- Random name generator
- Plant ✅
- Animalia
- Object / Things Randomizer
- Random word by language
- Random Country with flag ✅
- Random Places on Google Maps ✅
- Movie Randomizer
- Song Randomizer ✅
- Radio Channel Randomizer ✅
- Identity Generator (Name, Address, Phone)
- Android APK Randomizer
- IOS APK Randomizer
- Meme Randomizer ✅
- Anime Randomizer
- Webtoon Randomizer
- Football Club Randomizer ✅
- Riddle Randomizer
- Random Gift ✅

## Development Roadmap :

- Simple MVP randomizer menu (list, number, date time, dice, card, rock paper scisor) ✅
- More advance feature like user image randomizer, youtube, travel city, fashion ✅
- Add support for user to authenticate, and make some boundary of menu/feature that need budget for subscribe ✅
- PWA support, for user to install on their desktop / device ✅
- Make randomize duration into global state ✅
- Play music when click randomize (play randomization animation) ✅
- User can rearrange the menu / tools to satisfy their needs ✅
- Add survey whats new feature to catch user needs 
- Add API to support another developer to generate randomize (PRO) 
- Add Running news after title and subtitle, to aware user for new feature or news
- User can save and share the result (PRO)
- Mobile support
- Confetti after suffling / randomization done
- Sitemap to Crawling Index from Search Engine ✅

### Thanks to :

- Firebase Studio → [studio.firebase.google.com](https://studio.firebase.google.com)
- Vercel → [vercel.com](https://vercel.com)
- Github → [github.com](https://github.com)
- Runware AI → [runware.ai](https://runware.ai)
- Az Quotes → [azquotes.com](https://azquotes.com)
- Google Maps → [maps.google.com](https://maps.google.com)
- Giphy → [giphy.com](https://giphy.com)
- Music Brainz → [musicbrainz.com](https://musicbrainz.com)
- Sound Effect by [freesound_community](https://pixabay.com/id/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=63590 "freesound_community") from [Pixabay](https://pixabay.com/sound-effects/037766-8039s-synth-67009/)


---
## Want to play

Step by step to running on your own host :

1.  copy dev.env to .env and change the value with your key / variable
2.  Enable the required APIs in your Google Cloud Console.
3.  docker run Dockerfile

### Required APIs

To ensure all features of the application work correctly, you must enable the following APIs in the Google Cloud Console for your Firebase project:

-   **Identity Toolkit API**: For Firebase Authentication (Google Sign-In).
-   **Cloud Firestore API**: For saving user preferences.
-   **Vertex AI API**: For all AI-powered features using Gemini models (e.g., Travel, OOTD).
-   **YouTube Data API v3**: For the YouTube Randomizer.
-   **Maps Embed API**: For the Google Maps Place Randomizer.
-   **Giphy API**: For the Meme Randomizer.
