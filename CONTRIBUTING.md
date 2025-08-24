# Contributing to Reddit Ideas Scrapper

Thank you for your interest in contributing to Reddit Ideas Scrapper! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Check existing issues** - Search through existing issues to see if your problem has already been reported
2. **Create a new issue** - Use the appropriate issue template and provide:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Python version, etc.)

### Suggesting Features

1. **Check existing feature requests** - Search through existing issues for similar suggestions
2. **Create a feature request** - Describe the feature and its benefits clearly
3. **Provide use cases** - Explain how this feature would be useful

### Code Contributions

1. **Fork the repository** - Click the "Fork" button on GitHub
2. **Create a feature branch** - Create a new branch for your changes
3. **Make your changes** - Follow the coding standards below
4. **Test your changes** - Ensure all tests pass
5. **Submit a pull request** - Provide a clear description of your changes

## 🛠️ Development Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/reddit-ideas-scrapper.git
   cd reddit-ideas-scrapper
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up Node.js environment**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys and configuration

## 📝 Coding Standards

### Python

- **Style**: Follow PEP 8 guidelines
- **Formatting**: Use Black for code formatting
- **Linting**: Use flake8 for linting
- **Type hints**: Use type hints for function parameters and return values
- **Docstrings**: Use Google-style docstrings for all public functions

### JavaScript/TypeScript

- **Style**: Follow the existing code style
- **Linting**: Use ESLint with the provided configuration
- **Formatting**: Use Prettier for code formatting
- **TypeScript**: Use strict mode and proper typing

### General

- **Commit messages**: Use conventional commit format
- **Branch naming**: Use descriptive branch names (e.g., `feature/reddit-api-improvements`)
- **Testing**: Write tests for new functionality
- **Documentation**: Update documentation for new features

## 🧪 Testing

### Python Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_reddit_scanner.py
```

### Frontend Tests

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when implemented)
npm test
```

## 📚 Documentation

- **Code comments**: Add inline comments for complex logic
- **Docstrings**: Document all public functions and classes
- **README**: Update README.md for new features
- **API docs**: Document any new API endpoints

## 🔒 Security

- **Never commit secrets**: API keys, passwords, or other sensitive information
- **Environment variables**: Use `.env` files for local development
- **Input validation**: Validate all user inputs
- **Dependencies**: Keep dependencies updated and review security advisories

## 🚀 Release Process

1. **Version bump**: Update version in `package.json` and `__init__.py`
2. **Changelog**: Update CHANGELOG.md with new features and fixes
3. **Tag release**: Create a new git tag for the release
4. **Deploy**: Deploy to production (if applicable)

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and general discussion
- **Code review**: Ask questions in pull request comments

## 📄 License

By contributing to Reddit Ideas Scrapper, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Reddit Ideas Scrapper! 🎉
