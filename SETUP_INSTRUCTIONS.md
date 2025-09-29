# Node Manager Desktop - Setup Instructions

## 🚀 Quick Start Guide

Follow these steps to set up your Node Manager desktop application with full terminal functionality.

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** (optional) - [Download here](https://git-scm.com/)
- **Windows/Linux/macOS** - Cross-platform support

### Step 1: Project Setup

1. **Extract your exported project** to a folder (e.g., `node-manager-desktop`)
2. **Open terminal/command prompt** in the project folder
3. **Install dependencies**:
   ```bash
   npm install
   ```

### Step 2: Development Mode

Test the application in development mode:

```bash
npm run electron-dev
```

This will:
- Start the Vite development server
- Launch Electron with hot reload
- Open the app with DevTools enabled

### Step 3: Build Production Version

Create the installer for distribution:

**Windows:**
```bash
npm run dist-win
```

**Linux:**
```bash
npm run dist-linux
```

**All platforms:**
```bash
npm run dist-all
```

### Step 4: Find Your Installer

After building, find your installer in:
- **Windows**: `release/Node Manager Setup 1.0.0.exe`
- **Linux**: `release/Node Manager-1.0.0.AppImage` or `release/node-manager-desktop_1.0.0_amd64.deb`

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server only |
| `npm run build` | Build React app for production |
| `npm run electron-dev` | Development mode (React + Electron) |
| `npm run dist` | Build installer for current platform |
| `npm run dist-win` | Build Windows installer (.exe) |
| `npm run dist-linux` | Build Linux packages (.AppImage, .deb) |
| `npm run dist-all` | Build for all platforms |

## 🖥️ Terminal Features

Once running in Electron mode, you'll have access to:

### Real System Commands
- **SSH connections**: `ssh user@your-server.com`
- **Docker management**: `docker ps`, `docker logs container_name`
- **Screen sessions**: `screen -ls`, `screen -r session_name`
- **File operations**: `ls`, `cd`, `cat`, `nano`, etc.
- **System monitoring**: `htop`, `ps aux`, `df -h`

### VPS Management Examples
```bash
# Connect to your VPS
ssh root@your-vps-ip

# Check running containers
docker ps

# View container logs
docker logs -f container_name

# Attach to screen session
screen -r node_session

# Monitor system resources
htop
```

## 🛠️ Troubleshooting

### Common Issues

**1. "electron command not found"**
```bash
npm install electron --save-dev
```

**2. "node-pty build failed"**
- Ensure you have build tools installed
- Windows: Install Visual Studio Build Tools
- Linux: Install `build-essential`
- macOS: Install Xcode Command Line Tools

**3. "Permission denied" on Linux**
```bash
chmod +x release/Node\ Manager-1.0.0.AppImage
```

**4. Terminal not connecting**
- Check if node-pty installed correctly: `npm ls node-pty`
- Restart the application
- Check console for error messages

### Build Requirements

**Windows:**
- Visual Studio Build Tools or Visual Studio Community
- Python 3.x

**Linux:**
- build-essential package
- Python 3.x
- libxtst6, libxrandr2, libasound2, libpangocairo-1.0-0, libatk1.0-0, libcairo-gobject2, libgtk-3-0, libgdk-pixbuf2.0-0

**macOS:**
- Xcode Command Line Tools
- Python 3.x

## 📁 Project Structure

```
node-manager-desktop/
├── src/                    # React source code
│   ├── components/         # React components
│   ├── pages/             # Application pages
│   └── ...
├── main.js                # Electron main process
├── preload.js             # Electron preload script
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── electron-builder.yml   # Build configuration
└── release/               # Built installers (after build)
```

## 🔒 Security Notes

- The application uses secure IPC communication
- Terminal access is sandboxed through Electron
- No direct Node.js access from renderer process
- All system operations go through secure preload script

## 🎯 Next Steps

1. **Test the terminal** with basic commands
2. **Configure your VPS connections** 
3. **Set up SSH keys** for passwordless access
4. **Create shortcuts** for frequently used commands
5. **Customize the interface** as needed

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure you have the required build tools
4. Try rebuilding: `npm run build && npm run dist`

Your Node Manager desktop application is now ready for professional VPS management! 🚀