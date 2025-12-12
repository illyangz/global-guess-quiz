# Global Guess Quiz 🌍

A geography quiz game where players try to name all 197 UN member states within 15 minutes. Built with Next.js, TypeScript, and PostgreSQL.

## Features

- **Interactive World Map**: Visual feedback as you guess countries
- **Real-time Validation**: Countries are highlighted as soon as you type them correctly
- **Leaderboard**: Compete with other players worldwide
- **Time-based Scoring**: 15-minute timer with time remaining tracked
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-complete**: Countries are submitted automatically when recognized

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Database**: PostgreSQL (Railway recommended)
- **UI Components**: Radix UI primitives
- **Map**: Custom SVG world map with ISO country codes

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or Railway)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/global-guess-quiz.git
   cd global-guess-quiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your database**

   Create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and add your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/global_guess_quiz
   ```

4. **Initialize the database**
   ```bash
   psql -d global_guess_quiz -f scripts/init-db.sql
   ```

   Or if using Railway:
   ```bash
   railway run psql $DATABASE_URL -f scripts/init-db.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Railway

See the detailed [Railway Setup Guide](RAILWAY_SETUP.md) for step-by-step instructions.

Quick steps:
1. Push your code to GitHub
2. Create a new project on Railway from your GitHub repo
3. Add a PostgreSQL database to your project
4. Initialize the database with the provided SQL script
5. Your app will be automatically deployed!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── scores/        # Scores endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── quiz-game.tsx      # Main quiz component
│   ├── world-map.tsx      # Interactive map
│   ├── leaderboard.tsx    # Scores display
│   └── ...
├── lib/                   # Utility functions
│   ├── countries.ts       # Country data and matching logic
│   └── db/                # Database client
├── public/                # Static assets
│   └── World Vector Map.svg  # Map SVG
└── scripts/               # Database scripts
    └── init-db.sql        # Database schema
```

## How It Works

### Country Matching

The app uses a sophisticated country matching system that:
- Recognizes common aliases (e.g., "USA" for "United States")
- Normalizes input (removes special characters, converts to lowercase)
- Provides real-time feedback as you type

### Map Coloring

- Countries are stored with their ISO alpha-2 codes
- The SVG map uses these codes as path IDs
- As countries are guessed, their paths are colored green
- Missed countries are shown in red when the game ends

### Scoring

- Score = number of countries guessed
- Time remaining is tracked for leaderboard ranking
- Players with the same score are ranked by time remaining

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- Map SVG from [MapSVG](http://mapsvg.com)
- Country data based on UN member states
- Built with [shadcn/ui](https://ui.shadcn.com) components

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [Railway Setup Guide](RAILWAY_SETUP.md) for deployment help
- Review the database initialization script in `scripts/init-db.sql`

---

Made with ❤️ for geography enthusiasts everywhere
