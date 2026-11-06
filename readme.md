# BookTheVibe

Travel and tour-booking application built with Node.js, Express, MongoDB, and
Mongoose.

## Setup

1. Install Node.js 20.19 or newer.
2. Install dependencies with `npm install`.
3. Copy `config.env.example` to `config.env` and fill in the values locally.
   Never commit `config.env` or send credentials in chat. Rotate any credentials
   that have already been shared.

   ```powershell
   Copy-Item config.env.example config.env
   ```

4. Configure MongoDB and JWT before starting the server:

   ```powershell
   npm start
   ```

5. To enable Stripe test payments, copy your test secret key into
   `STRIPE_SECRET_KEY`. For local webhook testing, run the Stripe CLI:

   ```powershell
   stripe listen --forward-to localhost:3000/webhook-checkout
   ```

   Copy the CLI's webhook signing secret into `STRIPE_WEBHOOK_SECRET`. Configure
   the webhook for `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`. The current checkout currency is
   INR, and payment methods are selected automatically from those enabled for
   your Stripe account. Never put Stripe keys in chat or source control.
6. To display tour maps, create a restricted Mapbox public token, allow your
   local and production site origins, and set it as `MAPBOX_ACCESS_TOKEN`.
7. For development email, create a Mailtrap Email Testing inbox and copy its
   SMTP username and password into `EMAIL_USERNAME` and `EMAIL_PASSWORD`.
   The example uses `sandbox.smtp.mailtrap.io`, port `2525`, and
   `EMAIL_SECURE=false`. `EMAIL_LOGO_URL` is optional and must be publicly
   reachable by email clients. If signup succeeds but the welcome email fails,
   or password reset cannot send mail, verify that the SMTP credentials are
   current and belong to that Mailtrap inbox. Check them in local `config.env`;
   never paste them into chat or commit them. Mailtrap Email Testing captures
   messages in its testing inbox; it does not deliver them to real user
   inboxes. To deliver password-reset emails to users, configure a real SMTP
   provider or Mailtrap Email Sending with a verified sending domain.
8. When deploying behind a reverse proxy, set `TRUST_PROXY_HOPS` to the exact
   number of trusted proxies in front of this app. Leave it at `0` for direct
   local development.

To load the included sample tours, users, and reviews into the configured
database, run `node dev-data/data/import-dev-data.js --import`. The development
tour catalogue includes 30 sample journeys; the import command inserts missing
seed records without duplicating existing sample tours, users, or reviews. This
seed command should only be used with a development database.

## Events

The public `/tours` directory includes search, sorting, pagination, and
individual tour detail pages. It combines database tours with
the additional sample journeys in `dev-data/data/additional-tours.js`, so the
full catalogue can be browsed before seeding. Sample journeys are browse-only
until imported into the development database with `node dev-data/data/import-dev-data.js --import`.

The public `/events` directory includes search, category filters, pagination,
and individual event detail pages. Its 18 clearly labeled sample listings live
in `data/events.js`; dates, schedules, and locations are illustrative and must
be confirmed with event organizers before publication.

## Deployment and source-code privacy

Deploy this project as a Node.js web service, not as a static site. Start it
with `npm run start:prod`, set the required configuration values in the
hosting provider's environment-variable settings, and keep the project root
private. The Express app serves browser assets from `public`; do not configure
the provider to publish the repository root or place `config.env` inside
`public`. The local `config.env` file is excluded from Git.

## Postman API

Import `bookthevibe-postman-collection.json` into Postman. Its `URL` collection
variable defaults to `http://127.0.0.3:3000/`, matching the local address and
port used for development; update it if `PORT` or the server address changes.
The server listens on the configured port on all network interfaces.

The collection's `email` variable defaults to the sample admin account and its
`password` variable is intentionally blank. Set both in Postman's collection
variables to match an account in your database, or sign up a new account and
set its email and password there. After a successful login, the collection
stores the returned token in `jwt` for its protected requests. Admin-only
requests still require an account with the admin role.

Use `GET /api/v1/users/me` or the `/me` page to retrieve the signed-in user's
profile and email address. Listing all accounts with `GET /api/v1/users` is
admin-only; a regular user is expected to receive `403 Forbidden`.

The tour listing endpoint accepts a case-insensitive `search` term across tour
names, summaries, descriptions, and starting locations. For example:

```text
GET /api/v1/tours?search=mountain&difficulty=easy&sort=price
```

Search terms are limited to 100 characters. Existing filtering, sorting, field
selection, and pagination parameters can be combined with `search`.

Stripe payment methods are selected automatically based on the Stripe account,
currency, and available payment methods. Set `STRIPE_CURRENCY` to the desired
three-letter currency code.
