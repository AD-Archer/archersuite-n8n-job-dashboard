# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js TypeScript application for managing job search configurations and storing job results from LinkedIn searches via n8n automation.

## Tech Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS

## Key Features
- Search configuration management (keywords, location, experience level, etc.)
- Job data storage with duplicate prevention
- RESTful API endpoints for CRUD operations
- LinkedIn job search URL generation logic
- Modern UI with Tailwind CSS

## Development Guidelines
- Use TypeScript for type safety
- Implement proper error handling and validation
- Follow Next.js App Router conventions
- Use Prisma for database operations with proper relation handling
- Ensure database operations prevent duplicates
- Use environment variables for configuration
- Follow Tailwind CSS utility-first approach
