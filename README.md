# Address Map Visualizer (v1.0)

A web application that allows users to upload spreadsheets containing addresses and visualize them on Google Maps. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Upload Excel (.xlsx, .xls) or CSV files containing addresses
- Automatic address field detection
- Interactive Google Maps visualization
- Search and filter addresses
- Export data in CSV or JSON formats
- Real-time progress tracking during address processing
- Responsive design

## Prerequisites

- Node.js 18+ and npm
- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Geocoding API

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to a GitHub repository

2. Visit [Vercel](https://vercel.com) and sign up/login

3. Click "New Project" and import your GitHub repository

4. Configure the environment variable:
   - Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with your Google Maps API key

5. Click "Deploy"

## Important Notes

- Ensure your Google Maps API key has the necessary APIs enabled
- Set up billing in Google Cloud Console
- Consider API usage limits and costs
- The free tier of Google Maps API should be sufficient for moderate usage

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Maps API
- react-dropzone
- XLSX