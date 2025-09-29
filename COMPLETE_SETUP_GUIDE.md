# Node Manager Desktop - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the Node Manager desktop application locally and build Windows/Linux installers.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm 8+** (comes with Node.js)
- **Git** (for cloning repositories)
- **Windows**: Visual Studio Build Tools or Visual Studio Community
- **Linux**: build-essential package

## 🛠️ Installation Steps

### 1. Project Setup

```bash
# Clone or extract the project
cd node-manager-desktop

# Install all dependencies
npm install

# If you encounter dependency conflicts, use:
npm install --legacy-peer-deps
```

### 2. Development Mode

```bash
# Start development server (React + Electron)
npm run electron-dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Launch Electron window automatically
- Enable hot reload for React components

### 3. Build Production Version

```bash
# Build for current platform
npm run dist

# Build Windows installer (.exe)
npm run dist-win

# Build Linux packages (.AppImage, .deb)
npm run dist-linux

# Build for all platforms
npm run dist-all
```

## 📦 Build Outputs

After successful build, you'll find installers in the `release/` directory:

### Windows
- `Node Manager-Setup-1.0.0.exe` - NSIS installer
- `Node Manager-1.0.0.exe` - Portable version

### Linux
- `Node Manager-1.0.0.AppImage` - Universal Linux package
- `node-manager-desktop_1.0.0_amd64.deb` - Debian package

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Node-pty Build Errors

**Windows:**
```bash
npm install --global windows-build-tools
npm rebuild node-pty
```

**Linux:**
```bash
sudo apt-get install build-essential python3
npm rebuild node-pty
```

#### 2. Electron Build Fails

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run rebuild
```

#### 3. Permission Errors (Linux)

```bash
# Fix permissions
chmod +x node_modules/.bin/*
```

#### 4. Missing Dependencies

```bash
# Force reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### 5. Vite Build Issues

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 🎯 Terminal Features

Once built, the application provides:

### Real Terminal Access
- Full system shell access (PowerShell on Windows, Bash on Linux)
- Real-time command execution
- SSH connections to remote servers
- Docker container management

### Supported Commands
```bash
# SSH connections
ssh user@your-server.com

# Docker operations
docker ps
docker logs container_name
docker exec -it container_name bash

# Screen sessions
screen -ls
screen -r session_name

# File operations
ls, cd, pwd, cat, nano, vim

# System monitoring
htop, ps aux, df -h, free -m
```

## 🔒 Security Features

- Secure IPC communication between frontend and backend
- No direct Node.js access from renderer process
- Sandboxed terminal execution
- Protected file system operations

## 📁 Project Structure

```
node-manager-desktop/
├── src/                    # React application source
│   ├── components/         # React components
│   ├── pages/             # Application pages
│   └── hooks/             # Custom React hooks
├── main.js                # Electron main process
├── preload.js             # Electron preload script
├── package.json           # Dependencies and scripts
├── electron-builder.yml   # Build configuration
└── release/               # Built installers (after build)
```

## 🚀 Advanced Configuration

### Custom Build Settings

Edit `electron-builder.yml` to customize:

```yaml
win:
  target:
    - target: nsis
      arch: [x64, ia32]  # Add 32-bit support
  icon: assets/custom-icon.ico

linux:
  target:
    - target: rpm        # Add RPM package
      arch: [x64]
```

### Environment Variables

Create `.env` file for custom settings:

```env
ELECTRON_IS_DEV=true
VITE_API_URL=http://localhost:3000
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Try clearing caches and rebuilding
4. Check Node.js and npm versions

## 🎉 Success!

After following this guide, you should have:

✅ Working development environment  
✅ Functional desktop application  
✅ Windows .exe installer  
✅ Linux packages (.AppImage, .deb)  
✅ Real terminal with system access  
✅ SSH and Docker capabilities  

Your Node Manager desktop application is now ready for VPS and node management!