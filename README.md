# Ouma-Ge Application

A comprehensive mobile-first application with chat, payments, marketplace, and social features.

## Features

- **Chat & Messaging**: Real-time chat with voice messages, attachments, and emoji support
- **Digital Wallet**: Send/receive money, bill payments, transaction history
- **Marketplace**: Buy/sell items, service requests, job postings
- **Social Features**: Moments (posts), stories, discover feed
- **Transportation**: Bus/train ticket booking, ride-sharing
- **Government Services**: Tax center, passport fees, KYC verification
- **QR Code**: Scanner and generator for payments and sharing
- **Voice/Video Calls**: Real-time communication features

## Tech Stack

- **Frontend**: React 18.2.0, TypeScript, Vite
- **Styling**: Tailwind CSS (implied from component structure)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API
- **Maps**: Google Maps API
- **Build Tool**: Vite

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve the dist folder**:
   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder** to your hosting provider

## Environment Variables

Create a `.env.local` file with:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Project Structure

- `/components` - React components
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/services` - API services and utilities
- `/utils` - Utility functions
- `/public` - Static assets
- `/dist` - Production build output
