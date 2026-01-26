# Contributing to Beetbox

Thank you for your interest in contributing to Beetbox! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (for containerized development)
- A beets music library (for testing)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/beetbox.git
   cd beetbox
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your music library path and beets database path
   ```

5. **Run development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   BEETS_DB_PATH=/path/to/library.db python app.py

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Code Style

### Frontend (TypeScript/React)

- Use TypeScript for all new files
- Follow the existing code style (enforced by ESLint)
- Use functional components with hooks
- Use MUI components for consistency
- Run `npm run lint` before committing

### Backend (Python/Flask)

- Follow PEP 8 style guidelines
- Use type hints where possible
- Keep functions focused and well-documented

## Pull Request Process

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description of the changes

### PR Title Format

Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: formatting changes`
- `refactor: code restructuring`
- `test: add tests`
- `chore: maintenance tasks`

## Reporting Issues

When reporting issues, please include:

1. **Description** - Clear description of the issue
2. **Steps to reproduce** - How to trigger the issue
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - OS, browser, Node/Python versions
6. **Screenshots** - If applicable

## Feature Requests

Feature requests are welcome! Please:

1. Check existing issues to avoid duplicates
2. Provide a clear use case
3. Explain why this feature would be useful

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
