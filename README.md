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

## 🚀 Getting Started

### 🎮 Play Now
Aux Wars is hosted online!

Play at: https://aux-wars.com/

### 🛠️ Development Setup
If you want to run the game locally or contribute to development, follow these steps:

1. **Clone & Install**
```bash
git clone https://github.com/yourusername/aux-wars.git
cd aux-wars
npm run install-all
```

2. **Set Up Spotify**
- Create a Spotify Developer account
- Create a new application
- Add `http://localhost:5173/callback` as a redirect URI
- Copy your Client ID

3. **Configure Environment**
Create `.env` in the client directory:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

4. **Start Playing**
```bash
npm run start
```
Visit `http://localhost:5173` and start playing!

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

- Node.js v18+
- npm v9+
- Spotify Premium account (for playback)
- Modern web browser

## 🤝 Contributing

We love contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🙏 Acknowledgments

- Spotify Web Playback SDK
- Socket.IO for real-time communication
- React & Vite for the frontend
- All our amazing contributors!

---

Made with ❤️ by music lovers, for music lovers 
