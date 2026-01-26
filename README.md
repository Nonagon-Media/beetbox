# Beetbox

A modern web interface for browsing and streaming your [beets](https://beets.io/) music library.

## Features

- **Album Browser** - Grid and list views with album artwork
- **Artist Browser** - Browse by artist with album grouping
- **Track Browser** - View and search individual tracks
- **Audio Streaming** - HTML5 audio player with playback controls
- **Search** - Full-text search across your library
- **Metadata Editing** - Update track and album metadata (when not in readonly mode)
- **Statistics Dashboard** - Library overview and stats
- **Responsive Design** - Works on desktop and mobile

## Quick Start

### Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/beetbox.git
cd beetbox

# Configure your music library path
cp .env.example .env
# Edit .env to set MUSIC_PATH and BEETS_DB_PATH

# Start the application
docker-compose up -d

# Access at http://localhost:8337
```

### Kubernetes

```bash
# Edit k8s/pvc.yaml with your NFS server details
kubectl apply -f k8s/

# Access via your ingress or NodePort
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `MUSIC_PATH` | `/music` | Path to music files |
| `BEETS_DB_PATH` | `/data/library.db` | Path to beets database |
| `HOST` | `0.0.0.0` | API host binding |
| `PORT` | `8337` | API port |
| `READONLY` | `true` | Disable write operations |
| `INCLUDE_PATHS` | `false` | Include file paths in API responses |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Beetbox                        │
│  ┌─────────────────┐    ┌─────────────────────┐ │
│  │  React Frontend │───▶│   Flask API         │ │
│  │  (nginx :80)    │    │   (:8337)           │ │
│  └─────────────────┘    └──────────┬──────────┘ │
│                                    │            │
│  ┌─────────────────────────────────▼──────────┐ │
│  │  /music (NFS/local)  │  /data (beets DB)   │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## API Endpoints

### Items (Tracks)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/item/` | List all items |
| GET | `/item/<id>` | Get item by ID |
| GET | `/item/<id>/file` | Stream/download audio file |
| GET | `/item/query/<query>` | Search items |
| GET | `/item/values/<field>` | Get unique field values |
| PATCH | `/item/<id>` | Update item metadata |
| DELETE | `/item/<id>` | Delete item |

### Albums

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/album/` | List all albums |
| GET | `/album/<id>` | Get album by ID |
| GET | `/album/<id>?expand` | Get album with tracks |
| GET | `/album/<id>/art` | Get album artwork |
| GET | `/album/query/<query>` | Search albums |
| GET | `/album/values/<field>` | Get unique field values |
| DELETE | `/album/<id>` | Delete album |

### Artists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/artist/` | List all artists |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get library statistics |

## Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (optional)

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Building Docker Image

```bash
docker build -t beetbox:latest -f docker/Dockerfile .
```

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- [beets](https://beets.io/) - The music library manager this project builds upon
- Original beets web plugin by Adrian Sampson
