# AI Design to Code

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Penpot-Integration-orange?style=for-the-badge" />
</p>

<p align="center">
  <b>AI-powered design to code generator with Penpot integration</b>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#documentation">Documentation</a>
</p>

---

## Features

### 🤖 AI Code Generation
- Generate React/Next.js components from natural language descriptions
- Powered by Kimi AI (Moonshot)
- TypeScript support with proper typing

### 👁️ Live Preview
- Real-time code preview with Sandpack
- Interactive editing environment
- Error highlighting and debugging

### 📦 Export Options
- Export as complete Next.js project (ZIP)
- Copy code to clipboard
- Export to Penpot for design editing

### 🎨 Penpot Integration
- Self-hosted Penpot instance
- SVG export/import workflow
- Bidirectional design-code bridge

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (for native development)
- [Docker](https://docs.docker.com/get-docker/) (for containerized deployment)
- [Vagrant](https://www.vagrantup.com/) + [VirtualBox](https://www.virtualbox.org/) (for VM deployment)
- [Kimi API Key](https://platform.moonshot.cn/)

### Option 1: Native Development

```bash
# Clone repository
git clone https://github.com/yourusername/ai-design-to-code.git
cd ai-design-to-code/my-app

# Install dependencies
npm install

# Configure environment
echo "KIMI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

### Option 2: Docker Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/ai-design-to-code.git
cd ai-design-to-code

# Configure environment
echo "KIMI_API_KEY=your_api_key_here" > .env

# Start all services
docker-compose -f docker-compose.full.yml up -d

# Access:
# AI Tool: http://localhost:3000
# Penpot: http://localhost:9001
```

### Option 3: Vagrant VM

```bash
# Clone repository
git clone https://github.com/yourusername/ai-design-to-code.git
cd ai-design-to-code

# Start VM
vagrant up

# SSH into VM
vagrant ssh

# Configure API key
sudo nano /opt/ai-design-to-code/.env

# Start services
start-ai-design

# Access from host:
# AI Tool: http://localhost:3000
# Penpot: http://localhost:9001
```

---

## Deployment

### Docker Compose (Recommended)

```yaml
version: "3.5"

services:
  ai-design-to-code:
    build: ./my-app
    ports:
      - "3000:3000"
    environment:
      - KIMI_API_KEY=${KIMI_API_KEY}

  penpot-frontend:
    image: penpotapp/frontend:latest
    ports:
      - "9001:80"
    # ... see docker-compose.full.yml
```

### Environment Variables

| Variable | Required | Description |
|:---|:---:|:---|
| `KIMI_API_KEY` | ✅ | Kimi API key from https://platform.moonshot.cn/ |
| `PORT` | ❌ | Port for AI Tool (default: 3000) |
| `PENPOT_PORT` | ❌ | Port for Penpot (default: 9001) |

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and component structure
- [API Reference](docs/API.md) - API endpoints and usage
- [Penpot Integration](docs/PENPOT_INTEGRATION.md) - Design tool integration guide
- [Deployment Guide](docs/DEPLOYMENT.md) - Detailed deployment instructions
- [Vagrant Setup](docs/VAGRANT.md) - VM deployment guide
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

---

## Project Structure

```
ai-design-to-code/
├── my-app/                    # Next.js AI Tool
│   ├── app/                   # App Router
│   │   ├── page.tsx          # Main UI
│   │   ├── layout.tsx        # Root layout
│   │   └── api/              # API routes
│   │       └── generate/     # AI generation endpoint
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── PenpotBridge.tsx  # Penpot integration
│   ├── lib/                  # Utilities
│   │   ├── utils.ts          # Helper functions
│   │   └── svg-converter.ts  # React ↔ SVG conversion
│   ├── public/               # Static assets
│   ├── Dockerfile            # Container image
│   ├── package.json          # Dependencies
│   └── next.config.js        # Next.js configuration
│
├── penpot-docker/            # Penpot self-hosted
│   ├── docker-compose.yml    # Penpot services
│   └── start.sh              # Setup script
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── PENPOT_INTEGRATION.md
│   ├── DEPLOYMENT.md
│   └── VAGRANT.md
│
├── docker-compose.full.yml   # Full stack compose
├── Vagrantfile               # VM configuration
├── README.md                 # This file
├── LICENSE                   # MIT License
└── CONTRIBUTING.md           # Contribution guide
```

---

## Tech Stack

| Category | Technology |
|:---|:---|
| Framework | Next.js 16, React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS, shadcn/ui |
| AI | Kimi API (Moonshot) |
| Preview | Sandpack (CodeSandbox) |
| Export | JSZip, file-saver |
| Design | Penpot (self-hosted) |
| VM | Vagrant, VirtualBox |

---

## Screenshots

<p align="center">
  <i>Screenshots will be added after initial deployment</i>
</p>

---

## Roadmap

- [x] AI code generation
- [x] Live preview with Sandpack
- [x] Export as ZIP
- [x] Penpot SVG bridge
- [x] Penpot self-hosting
- [x] Vagrant VM setup
- [ ] SVG to React conversion
- [ ] Direct Penpot API integration
- [ ] Component library/templates
- [ ] Collaboration features
- [ ] Figma plugin

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

[MIT](LICENSE) © 2026 AI Design to Code Contributors

---

<p align="center">
  Built with ❤️ using Next.js, Kimi AI, and Penpot
</p>
