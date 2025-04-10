# CodeSnap QR - QR Code Generation SaaS

A modern SaaS web application for generating, customizing, and tracking QR codes built with Next.js, Tailwind CSS, and Prisma.

![CodeSnap QR Screenshot](./public/screenshot.png)

## Features

### Core Features

- **User Authentication**
  - Secure login, signup, and password reset functionality
  - Google OAuth integration
  - JWT-based authentication with NextAuth.js

- **Dashboard Interface**
  - Intuitive dashboard with sidebar navigation
  - Recent QR codes overview
  - Usage statistics and metrics

- **QR Code Generation**
  - Multiple QR code types: URL, Text, Email, Phone, vCard, WiFi
  - Static QR codes (free plan) and Dynamic QR codes (pro plan)
  - Customization options: colors, logo, frame styles
  - Real-time preview and download options (PNG, SVG)
  - Save and organize QR codes

- **QR Code Management**
  - List view with search and filtering
  - Edit/Delete operations
  - Usage statistics for each QR code

- **Analytics (Pro Plan)**
  - Scan tracking over time
  - Device and location analytics
  - Visual reports and charts

- **Subscription Management**
  - Free and Pro plan options
  - Stripe integration for payments
  - Account and subscription management

## Tech Stack

- **Frontend**:
  - Next.js (App Router)
  - Tailwind CSS for styling
  - shadcn/ui component library
  - Framer Motion for animations
  - React Hook Form for form handling
  - Zod for validation

- **Backend**:
  - Next.js API routes
  - Prisma ORM with PostgreSQL
  - NextAuth.js for authentication
  - QR code generation libraries
  - Stripe for payment processing

- **Analytics**:
  - Recharts for data visualization
  - Custom analytics tracking

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codesnap-qr.git
   cd codesnap-qr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the necessary environment variables:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/codesnap?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"

   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Stripe
   STRIPE_API_KEY="your-stripe-api-key"
   STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY="your-stripe-public-key"

   # Subscription Plans
   NEXT_PUBLIC_PRO_MONTHLY_PLAN_ID="your-stripe-price-id"
   ```

4. Initialize the database and run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
codesnap/
├── prisma/                 # Prisma schema and migrations
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── auth/           # Authentication pages
│   │   └── ...             # Other app routes
│   ├── components/         # React components
│   │   ├── ui/             # UI components
│   │   └── ...             # Feature components
│   ├── lib/                # Utility functions
│   ├── providers/          # Context providers
│   └── types/              # TypeScript type definitions
└── ...
```

## Deployment

This application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe](https://stripe.com/)
