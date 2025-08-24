#!/usr/bin/env python3
"""
Setup script for Reddit Ideas Scrapper

This script helps set up the development environment and install dependencies.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path


def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"stdout: {e.stdout}")
        if e.stderr:
            print(f"stderr: {e.stderr}")
        return False


def check_python_version():
    """Check if Python version meets requirements."""
    print("🐍 Checking Python version...")
    if sys.version_info < (3, 8):
        print(f"❌ Python 3.8+ required, found {sys.version}")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True


def check_node_version():
    """Check if Node.js version meets requirements."""
    print("🟢 Checking Node.js version...")
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True, check=True)
        version = result.stdout.strip()
        print(f"✅ Node.js {version} detected")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js not found. Please install Node.js 18+")
        return False


def setup_python_environment():
    """Set up Python virtual environment and install dependencies."""
    print("🐍 Setting up Python environment...")
    
    # Create virtual environment
    if not Path("venv").exists():
        print("📁 Creating virtual environment...")
        if not run_command("python -m venv venv", "Creating virtual environment"):
            return False
    
    # Activate virtual environment and install dependencies
    if platform.system() == "Windows":
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    # Install Python dependencies
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing Python dependencies"):
        return False
    
    return True


def setup_node_environment():
    """Set up Node.js environment and install dependencies."""
    print("🟢 Setting up Node.js environment...")
    
    # Install Node.js dependencies
    if not run_command("npm install", "Installing Node.js dependencies"):
        return False
    
    return True


def create_env_file():
    """Create .env.local file from example if it doesn't exist."""
    env_file = Path(".env.local")
    example_file = Path("env.example")
    
    if not env_file.exists() and example_file.exists():
        print("📝 Creating .env.local file from example...")
        try:
            with open(example_file, 'r') as f:
                content = f.read()
            
            with open(env_file, 'w') as f:
                f.write(content)
            
            print("✅ Created .env.local file")
            print("⚠️  Please update .env.local with your actual API keys and configuration")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env.local: {e}")
            return False
    
    return True


def create_directories():
    """Create necessary directories."""
    print("📁 Creating necessary directories...")
    
    directories = ["logs", "data", "exports"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    print("✅ Directories created")
    return True


def main():
    """Main setup function."""
    print("🚀 Setting up Reddit Ideas Scrapper...")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_node_version():
        sys.exit(1)
    
    # Set up environments
    if not setup_python_environment():
        print("❌ Python environment setup failed")
        sys.exit(1)
    
    if not setup_node_environment():
        print("❌ Node.js environment setup failed")
        sys.exit(1)
    
    # Create configuration files
    if not create_env_file():
        print("❌ Environment file setup failed")
        sys.exit(1)
    
    if not create_directories():
        print("❌ Directory creation failed")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update .env.local with your API keys")
    print("2. Run 'npm run dev' to start the development server")
    print("3. Run 'python reddit_scanner.py' to test Reddit scraping")
    print("4. Run 'python airtable_manager.py' to test Airtable integration")
    print("\n📚 For more information, see README.md and CONTRIBUTING.md")


if __name__ == "__main__":
    main()
