# Repository Structure

```
ai-design-to-code/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
│
├── docs/
│   ├── ARCHITECTURE.md         # System architecture
│   ├── API.md                  # API reference
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── PENPOT_INTEGRATION.md   # Penpot integration
│   └── VAGRANT.md              # Vagrant setup
│
├── my-app/                     # Next.js AI Tool
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts    # AI generation API
│   │   ├── page.tsx            # Main UI
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── PenpotBridge.tsx    # Penpot integration
│   │
│   ├── lib/
│   │   ├── utils.ts            # Utilities
│   │   └── svg-converter.ts    # React ↔ SVG
│   │
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Container image
│   ├── package.json            # Dependencies
│   ├── next.config.js          # Next.js config
│   ├── tsconfig.json           # TypeScript config
│   └── tailwind.config.ts      # Tailwind config
│
├── penpot-docker/              # Penpot self-hosted
│   ├── docker-compose.yml      # Penpot services
│   ├── start.sh                # Setup script
│   └── README.md               # Penpot docs
│
├── docker-compose.full.yml     # Full stack compose
├── Vagrantfile                 # VM configuration
├── test.sh                     # Test script
├── start-vm.sh                 # Quick start (Unix)
├── start-windows.bat           # Quick start (Windows)
│
├── README.md                   # Main documentation
├── LICENSE                     # MIT License
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guide
├── SECURITY.md                 # Security policy
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── REPO_STRUCTURE.md           # This file
```

## Key Files

| File | Purpose |
|:---|:---|
| `README.md` | Project overview and quick start |
| `docs/DEPLOYMENT.md` | Detailed deployment instructions |
| `my-app/Dockerfile` | Container image definition |
| `docker-compose.full.yml` | Full stack orchestration |
| `Vagrantfile` | VM configuration |

## Documentation

All documentation is in `docs/` directory:

- **ARCHITECTURE.md** - System design and decisions
- **API.md** - API endpoints and usage
- **DEPLOYMENT.md** - Deployment options and guides
- **PENPOT_INTEGRATION.md** - Design tool integration
- **VAGRANT.md** - VM deployment guide
