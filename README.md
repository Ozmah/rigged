# 🎲 Rigged

A simple, fast, and free raffle tool for Twitch streamers. Run real-time chat raffles with multiple winners, export results, and keep your audience engaged.

## ✨ Features

- **Real-time chat integration** - Automatically captures chat messages during raffle periods
- **Multiple winners** - Configure how many winners you need for each raffle
- **Export results** - Save complete raffle data and winner lists
- **Multiple rounds** - Run consecutive rounds without duplicate winners
- **Clean interface** - Simple, distraction-free design that won't overwhelm your stream
- **Free forever** - No subscriptions, no limits, no hidden costs

## 🎯 Who is this for?

Small streamers who need a reliable raffle tool without breaking the bank. If you're tired of limited free tools or expensive subscriptions, Rigged gives you everything you need to run engaging raffles for your community.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Twitch Application** - You'll need to create one (we'll guide you through this)

### Windows Setup

1. **Download and extract** the latest release or clone this repository
2. **Open Command Prompt** in the project folder
3. **Install dependencies:**
   ```cmd
   bun install
   ```
4. **Create your Twitch application:**
   - Go to [Twitch Developer Console](https://dev.twitch.tv/console)
   - Click "Register Your Application"
   - Name: `Your Stream Raffles` (or whatever you prefer)
   - OAuth Redirect URL: `https://localhost:3001/auth/callback`
   - Category: `Application Integration`
   - Copy your **Client ID**

5. **Configure the app:**
   - Copy `.env.example` to `.env`
   - Edit `.env` and add your Client ID:
     ```
     VITE_CLIENT_ID=your_client_id_here
     ```

6. **Start the application:**
   ```cmd
   bun dev
   ```

7. **Open your browser** and go to `https://localhost:3001`

### macOS Setup

1. **Download and extract** the latest release or clone this repository
2. **Open Terminal** in the project folder
3. **Install dependencies:**
   ```bash
   bun install
   ```
4. **Create your Twitch application** (same as Windows steps 4-5)
5. **Start the application:**
   ```bash
   bun dev
   ```
6. **Open your browser** and go to `https://localhost:3001`

### Linux Setup

1. **Clone or download** the repository
2. **Open terminal** in the project folder
3. **Install dependencies:**
   ```bash
   bun install
   ```
4. **Create your Twitch application** (same as Windows steps 4-5)
5. **Start the application:**
   ```bash
   bun dev
   ```
6. **Open your browser** and go to `https://localhost:3001`

## 🎮 How to Use

### First Time Setup
1. **Connect with Twitch** - Click the purple button to authorize the app
2. **Grant permissions** - The app needs to read your chat and basic profile info
3. **You're ready!** - Start running raffles immediately

### Running a Raffle
1. **Start capturing** - Click "Start Raffle" when you're ready to begin
2. **Let viewers participate** - Anyone who chats during this period is automatically entered
3. **Stop and draw** - Click "Stop & Draw Winners" to select random winners
4. **Announce results** - Winners are displayed clearly for easy announcement
5. **Export if needed** - Save the complete participant list and results

### Tips for Success
- **Announce clearly** when raffles start and end
- **Set clear rules** about participation (one message = one entry, etc.)
- **Use multiple rounds** for bigger giveaways to create more excitement
- **Export results** to verify fairness if questioned

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_CLIENT_ID=your_twitch_client_id
```

### Twitch Permissions
The app requests these permissions:
- `user:read:chat` - To read chat messages for raffles
- `user:bot` - To connect as a bot user
- `channel:bot` - To access channel bot features
- `user:read:email` - For basic profile information

## 🛠️ Development

This project uses:
- **React 19** with TypeScript
- **TanStack Router** for navigation
- **TanStack Store** for state management
- **Tailwind CSS** for styling
- **Vite** for development and building

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build

# Preview production build
bun preview
```

## 🔒 Privacy & Security

- **Local only** - All data stays on your computer
- **No tracking** - We don't collect any analytics or personal data
- **Minimal permissions** - Only requests what's needed for core functionality
- **Open source** - You can verify exactly what the code does

## 📋 System Requirements

- **Windows 10+**, **macOS 10.15+**, or **Linux** (any modern distribution)
- **Node.js 18 or higher**
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** for Twitch integration

## ❓ Troubleshooting

### "Can't connect to Twitch"
- Check your internet connection
- Verify your Client ID is correct in the `.env` file
- Make sure the redirect URL in your Twitch app matches exactly: `https://localhost:3001/auth/callback`

### "Permission denied" errors
- Make sure you granted all requested permissions during login
- Try logging out and logging back in

### App won't start
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and run `bun install` again
- Check that port 3001 isn't being used by another application

### Still having issues?
Check the browser console (F12) for error messages. Most issues are related to incorrect Twitch app configuration.

## 💻 Local Setup for Personal Use

> 🚧 **Under Construction** - Detailed personal setup instructions coming soon!

This section will include:
- Step-by-step Twitch Developer Console walkthrough with screenshots
- Detailed `.env` file configuration examples
- Common setup issues and their solutions
- How to keep your local instance updated
- Backup and restore procedures for your raffle data
- Tips for running Rigged alongside your streaming software

The basic setup above gets you started, but this section will make the process even smoother for non-technical users.

## 📄 License

MIT License - Feel free to use, modify, and distribute as needed.

---

**Made with ❤️ by Ozmah**