# 🎲 Rigged

A simple, fast, and free raffle tool for Twitch streamers. Run real-time chat raffles with multiple winners, export results, and keep your audience engaged.

## ✨ Features

- **Real-time chat integration** - Automatically captures chat messages during raffle periods
- **Multiple winners** - Draw one or more winners from participants
- **Advanced filtering** - Exclude moderators, subscribers, or VIPs from raffles
- **Extra tickets** - Give subscribers and VIPs additional entries for better odds
- **Channel switching** - Moderators can run raffles in channels they moderate
- **Raffle state persistence** - Your settings and preferences are saved between sessions
- **Chat message display** - See incoming messages in real-time during raffles
- **Open Source** - Self-hosted solution with full transparency

## 🎯 Who is this for?

Small streamers who need a reliable raffle tool without breaking the bank. If you're tired of the crappy tools out there, we're trying to build a simple tool that can change that and you can use from your computer.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Twitch Application** - You'll need to create one (we'll guide you through the process) (🏗️ we're working on this)

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
   - OAuth Redirect URL: `https://localhost:3001/callback`
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
1. **Set keyword** - Enter the word or phrase participants need to type
2. **Configure options** - Use advanced settings to exclude certain user types or give extra tickets
3. **Start raffle** - Click "Start Raffle" to begin capturing chat messages
4. **Monitor participation** - Watch real-time messages and participant count
5. **Prepare winners** - Click "Rig Raffle" to stop capturing and prepare for winner selection
6. **Select winners** - Click "Execute Raffle" to randomly select and announce winners
7. **Reset for next round** - Clear participants or adjust settings for another raffle

### Tips for Success
- **Announce clearly** when raffles start and end
- **Set clear rules** about participation and eligibility
- **Use advanced options** to customize raffles for your community
- **Test settings** with the built-in message generator before going live
- **Switch channels** if you moderate multiple streams and want to run raffles there

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_CLIENT_ID=your_twitch_client_id
VITE_ANON_DEBUG=1
```

- `VITE_CLIENT_ID` - Your Twitch application client ID
- `VITE_ANON_DEBUG` - Set to `1` to anonymize sensitive data in debug tools (recommended)

### Twitch Permissions
The app requests these permissions:
- `user:read:chat` - Read chat messages during raffle periods
- `user:bot` - Connect to chat as a bot user
- `channel:bot` - Access channel-specific bot features
- `channel:moderate` - Access moderation features for channels you moderate
- `user:read:email` - Basic profile information for authentication

## 🛠️ Development

This project uses:
- **React 19** with TypeScript
- **TanStack Router** for navigation and routing
- **TanStack Store** for state management
- **TanStack DevTools** for debugging and development
- **Tailwind CSS** for styling
- **Phosphor Icons** for iconography
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
- **Open source** - You can verify exactly what the code does so you can see that we're not pulling any shenanigans

## 📋 System Requirements

- **Windows 10+**, **macOS 10.15+**, or **Linux** (any modern distribution)
- **Node.js 18 or higher**
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Internet connection** for Twitch integration

## ❓ Troubleshooting

### "Can't connect to Twitch"
- Check your internet connection
- Verify your Client ID is correct in the `.env` file
- Make sure the redirect URL in your Twitch app matches exactly: `https://localhost:3001/callback`

### "Permission denied" errors
- Make sure you granted all requested permissions during login
- Try logging out and logging back in
- Verify you have moderation privileges if trying to switch channels

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