# Job Search Dashboard

A self-hostable job search dashboard designed to work with n8n workflows for automated job searching and application tracking.

## Overview

This application provides a web interface to manage job search configurations and track job applications. It integrates seamlessly with n8n workflows that automatically scrape LinkedIn job listings, analyze them with AI, and store results in your database.

## Features

- 🔍 **Search Configuration Management**: Create and manage multiple job search criteria
- 📊 **Job Dashboard**: View and track all discovered jobs with scores and details
- 🤖 **n8n Integration**: RESTful API endpoints for automated workflow integration
- 📈 **Application Tracking**: Track job application status (new, applied, interview, offer, rejected)
- 🎯 **AI-Powered Scoring**: Jobs are scored based on resume matching via AI analysis
- 📱 **Responsive UI**: Clean, modern interface that works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- n8n instance (for automated job searching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AD-Archer/archersuite-n8n-job-dashboard.git
cd archersuite-n8n-job-dashboard
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

4. Configure your database connection in `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/job_dashboard"
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3508](http://localhost:3508) to view the application.

**Note**: This application runs on port 3508 by default to avoid conflicts with other Next.js applications.

## API Endpoints

The application provides several endpoints for n8n workflow integration:

### Job Management
- `POST /api/n8n/jobs` - Create jobs from n8n workflow
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/[id]` - Get specific job
- `PUT /api/jobs/[id]` - Update job status

### Search Configuration
- `GET /api/search-configs` - Get all search configurations
- `POST /api/search-configs` - Create new search configuration
- `GET /api/n8n/jobs` - Get search configs for n8n (formatted for workflow consumption)

### Utilities
- `GET /api/health` - Health check endpoint
- `POST /api/generate-linkedin-url` - Generate LinkedIn search URLs from criteria

## n8n Workflow Integration

This dashboard is designed to work with the included n8n workflow that:

1. **Fetches your resume** from a specified endpoint
2. **Reads search configurations** from the dashboard API
3. **Scrapes LinkedIn** job listings based on your criteria
4. **Analyzes jobs with AI** (Gemini/GPT) to score resume matches
5. **Generates cover letters** automatically
6. **Stores results** in your database via the dashboard API
7. **Sends notifications** for high-scoring matches

### Sample n8n Workflow

A complete n8n workflow template is included in the repository. Import `LinkedIn Job Search Auto-Match Resume with GPT_Gemini + Cover Letter Generator & Telegram Alerts.json` into your n8n instance.

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key entities:

- **Jobs**: Stores job listings with AI scores and cover letters
- **SearchConfig**: Manages job search criteria and filters
- **User sessions**: Simple authentication for dashboard access

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Optional: Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3508"

# Optional: AI Integration
OPENAI_API_KEY="your-openai-key"
```

## Deployment

### Using PM2 (Recommended for VPS)

1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start ecosystem.config.js
```

### Using Docker

```bash
docker build -t job-dashboard .
docker run -p 3508:3508 job-dashboard
```

### GitHub Actions CI/CD

The repository includes GitHub Actions workflows for automated deployment. Configure the following secrets:

- `SSH_HOST` - Your server IP
- `SSH_USERNAME` - Server username  
- `SSH_KEY` - Private SSH key
- `SSH_PORT` - SSH port (usually 22)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: PM2, Docker, GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact [antonioarcher.dev@gmail.com](mailto:antonioarcher.dev@gmail.com).

---

**Built with ❤️ by [Antonio Archer](https://antonioarcher.com)**
