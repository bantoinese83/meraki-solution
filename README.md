# Meraki Solution

## 📋 Overview

Meraki Invoicing is a comprehensive invoicing solution designed to streamline financial operations for freelancers and small businesses. The platform combines intuitive invoice management with powerful AI insights to help users make data-driven decisions and improve their financial workflows.

## ✨ Key Features

- **Smart Invoice Management**: Create, edit, and track invoices with an intuitive interface
- **Client Management**: Maintain a database of clients with detailed profiles and payment histories
- **AI-Powered Insights**: Leverage Google Gemini AI to analyze financial data and provide actionable insights
- **Real-time Analytics**: Track revenue, outstanding payments, and business performance
- **Secure Payments**: Integrate with popular payment gateways for seamless transactions
- **Customizable Templates**: Create branded invoices that reflect your business identity
- **Expense Tracking**: Monitor business expenses and categorize spending
- **Time Tracking**: Log billable hours and automatically generate invoices
- **Recurring Invoices**: Set up automated billing for regular clients
- **Client Portal**: Allow clients to view and pay invoices through a dedicated portal
- **Multi-currency Support**: Work with clients globally using multiple currencies
- **Tax Management**: Calculate and track taxes for compliance
- **Comprehensive Reporting**: Generate detailed financial reports for accounting and tax purposes
- **Mobile Responsive**: Access your invoicing dashboard from any device

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/your-org/meraki-solution
cd meraki-solution
pnpm install
```

## Running Locally

[Install](https://docs.stripe.com/stripe-cli) and log in to your Stripe account:

```bash
stripe login
```

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can also create new users through the `/sign-up` route.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see Meraki Solution in action.

You can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Production Deployment

When you're ready to deploy Meraki Solution to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com

## ⚙️ Environment Variables

Create a `.env` file in your project root. The following variables are required:

- `BASE_URL` - Your app's base URL (e.g., http://localhost:3000)
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `POSTGRES_URL` - Your Postgres database connection string
- `AUTH_SECRET` - A random string for session encryption (generate with `openssl rand -base64 32`)
- `GEMINI_API_KEY` - Your Google Gemini API key (for AI insights and OCR)
- (Optional) `OCR_SPACE_API_KEY` - If using OCR.space as a fallback for receipt OCR

**Never commit your `.env` file or any secrets to version control.**

## 🔒 Security & Secret Management

- **Never hardcode secrets or API keys in your code.**
- Always use environment variables for sensitive credentials.
- If a secret is accidentally committed:
  1. **Revoke the key immediately** in the provider's dashboard (e.g., Google Cloud Console, Stripe).
  2. **Replace the key** in your environment and update the `.env` file.
  3. **Remove the secret from your git history** if possible (see [GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)).
  4. **Push a fix** and close any GitHub secret scanning alerts.

## 🤖 AI & OCR Features

### AI-Powered Insights (Gemini)
- The dashboard uses Google Gemini to analyze your business data and provide actionable insights.
- Requires `GEMINI_API_KEY` in your environment.
- Insights are shown on the dashboard and can be customized in `app/api/ai-insights/route.ts`.

### Receipt OCR Extraction
- Upload receipts in the Expenses section to extract merchant, date, total, and category using AI OCR.
- By default, uses Google Gemini for high-accuracy extraction. Optionally, you can set up `OCR_SPACE_API_KEY` for fallback OCR.
- All extracted data can be reviewed and edited before saving as an expense.

## 👤 Client Portal
- Each client has access to a dedicated portal to view and pay invoices.
- Share the portal link with your client: `/client-portal/[clientId]` (replace `[clientId]` with the actual client ID).
- Clients can update their info, view payment history, and make payments securely.

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request for bug fixes, improvements, or new features.

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
