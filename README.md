# 🎵 Aux Wars

A multiplayer music game where you and your friends compete to find the perfect song for each round's prompt. Think you have the best music taste? Prove it!

## 🎮 How to Play

1. **Join or Host**: Create a new game or join with a friend's code  
2. **Get the Prompt**: Each round starts with a fun prompt like "This song makes me feel like the main character"  
3. **Pick Your Song**: Search Spotify and select the perfect track  
4. **Rate & Compete**: Rate other players' songs on a scale of 1-5 records  
5. **Win**: Collect the most records to become the ultimate music master!  

## ✨ Features

- 🎯 Real-time multiplayer gameplay  
- 🎵 Spotify integration for seamless song selection  
- 🎨 Beautiful, responsive UI  
- 🎮 Guest mode for non-Spotify users  
- ⚡ Quick and easy setup  
- 🎲 Customizable game settings  

## 🚀 Current Status

Because of Spotify API limits (you must whitelist users, with a 25-user max), **Aux Wars is no longer hosted online**.  
However, you can still play it locally with your friends by following the guide below!  

## 🎧 How to Play with Your Own Spotify API Token

Since you need your own Spotify API token (Client ID) to play:

1. **Create a Spotify Developer Account**  
   Go to [developer.spotify.com](https://developer.spotify.com/) and log in with your Spotify account.

2. **Create a New Application**  
   - Go to your [Spotify Dashboard](https://developer.spotify.com/dashboard/applications)  
   - Click **Create an App**  
   - Add `http://localhost:5173/callback` as a Redirect URI (you can add more later if hosting elsewhere).  
   - Copy your **Client ID**  

3. **Clone & Set Up the Repo**  
```bash
git clone https://github.com/yourusername/aux-wars.git
cd aux-wars
npm run install-all
````

4. **Configure Your Environment**
   Create a `.env` file in the `/client` directory with this:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

5. **Run Locally**

```bash
npm run start
```

Then open `http://localhost:5173` in your browser and start playing with your friends!

**Tip:** You can share this repo with your friends and have them do the same with their own Spotify account, so they can also host games.

## 🛠️ Development

### Client

```bash
cd client
npm run dev     # Start development server
npm run test    # Run tests
npm run build   # Build for production
```

### Server

```bash
cd server
npm start       # Start server
npm test        # Run tests
```

## 🎯 Requirements

* Node.js v18+
* npm v9+
* Spotify Premium account (required for playback)
* Modern web browser

## 🤝 Contributing

We love contributions! Whether it's:

* 🐛 Bug fixes
* ✨ New features
* 📝 Documentation improvements
* 🎨 UI/UX enhancements

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🙏 Acknowledgments

* Spotify Web Playback SDK
* Socket.IO for real-time communication
* React & Vite for the frontend
* All our amazing contributors!

---

Made with ❤️ by music lovers, for music lovers
