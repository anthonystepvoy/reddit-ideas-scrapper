#!/usr/bin/env python3
"""
Setup script for My Idea Engine
Helps configure the environment and install dependencies
"""

import os
import subprocess
import sys

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def create_env_file():
    """Create .env file from template if it doesn't exist."""
    if not os.path.exists('.env'):
        if os.path.exists('env.template'):
            with open('env.template', 'r') as template:
                with open('.env', 'w') as env_file:
                    env_file.write(template.read())
            print("✅ Created .env file from template")
            print("📝 Please edit .env file with your actual API keys")
        else:
            print("❌ env.template not found")
    else:
        print("✅ .env file already exists")

def install_dependencies():
    """Install required Python packages."""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        print("💡 Try running: pip install -r requirements.txt")

def check_virtual_environment():
    """Check if running in a virtual environment."""
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Running in virtual environment")
    else:
        print("⚠️  Not running in virtual environment")
        print("💡 Consider creating one: python -m venv venv")

def main():
    """Main setup function."""
    print("🚀 Setting up My Idea Engine...")
    print("=" * 50)
    
    check_python_version()
    check_virtual_environment()
    create_env_file()
    install_dependencies()
    
    print("\n" + "=" * 50)
    print("🎉 Setup complete!")
    print("\n📋 Next steps:")
    print("1. Edit .env file with your API keys")
    print("2. Set up your Airtable database (see README.md)")
    print("3. Get Reddit API credentials (see README.md)")
    print("4. Run: python reddit_scanner.py")
    print("5. Run: python airtable_manager.py")

if __name__ == '__main__':
    main() 