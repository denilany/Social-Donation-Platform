#!/bin/bash

# Development Setup Script for Social Donation Platform
# This script automates common development tasks

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Social Donation Platform Development Setup ===${NC}"

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
  echo -e "${RED}Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}Node.js version is $NODE_VERSION. Please upgrade to Node.js 18+${NC}"
  exit 1
fi

if ! command_exists npm; then
  echo -e "${RED}npm is not installed. Please install npm${NC}"
  exit 1
fi

echo -e "${GREEN}Prerequisites satisfied!${NC}"

# Setup options
echo -e "${YELLOW}What would you like to do?${NC}"
echo "1) Full setup (install dependencies, setup database, seed data)"
echo "2) Start development server"
echo "3) Reset database"
echo "4) Open Prisma Studio"
echo "5) Start ngrok tunnel for M-Pesa callbacks"
echo "6) Exit"

read -p "Enter your choice (1-6): " choice

case $choice in
  1)
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    
    echo -e "${YELLOW}Setting up database...${NC}"
    npm run db:generate
    npm run db:push
    
    echo -e "${YELLOW}Seeding database with sample data...${NC}"
    npm run db:seed
    
    echo -e "${GREEN}Setup complete! Run 'npm run dev' to start the development server${NC}"
    ;;
    
  2)
    echo -e "${YELLOW}Starting development server...${NC}"
    npm run dev
    ;;
    
  3)
    echo -e "${YELLOW}Resetting database...${NC}"
    npm run db:reset
    echo -e "${GREEN}Database reset complete!${NC}"
    ;;
    
  4)
    echo -e "${YELLOW}Opening Prisma Studio...${NC}"
    npm run db:studio
    ;;
    
  5)
    if ! command_exists ngrok; then
      echo -e "${RED}ngrok is not installed. Please install ngrok first.${NC}"
      exit 1
    fi
    
    echo -e "${YELLOW}Starting ngrok tunnel for M-Pesa callbacks...${NC}"
    echo -e "${YELLOW}Make sure to update your .env file with the callback URL${NC}"
    ngrok http --url=neat-precise-trout.ngrok-free.app 5173
    ;;
    
  6)
    echo -e "${GREEN}Exiting...${NC}"
    exit 0
    ;;
    
  *)
    echo -e "${RED}Invalid option. Please try again.${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}Done!${NC}"