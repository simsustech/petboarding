# Petboarding

> Easy, fast and reliable pet boarding software — the all-in-one platform to manage your pet boarding and daycare facility.

## Website

https://www.petboarding.app

## Documentation

Full documentation at [petboarding.app](https://www.petboarding.app):
- [Features overview](https://www.petboarding.app/features)
- [Customer guide](https://www.petboarding.app/guide/customer)
- [Employee guide](https://www.petboarding.app/guide/employee)
- [Administrator guide](https://www.petboarding.app/guide/administrator)

## Demo

https://demo.petboarding.app


## Features

### 🧑‍🦱 Customer Self-Service Portal
- Customers register and manage their personal information, contact people, and pets
- Online boarding bookings with date ranges, time slots, and optional services
- Daycare date management with prepaid subscription packages
- Real-time booking and daycare status visibility
- Automatic email notifications on approval, rejection, standby, or cancellation

### 🐕 Comprehensive Pet Management
- Rich pet profiles with species, breed, weight, food schedules, and medications
- Vaccination tracking with document upload and automatic compliance checking
- Pet compatibility ratings for safe kennel cohabitation
- Full-text search across all pets

### 📆 Boarding Management
- Booking review workflow: approve, reject, standby, or reply
- Day and week agenda views with color-coded status indicators
- Automatic pricing based on pet category, stay duration, and services
- Down payment support with automatic payment tracking
- Configurable cancelation handling

### 📅 Daycare Operations
- Monthly daycare calendar with pet counts per day
- Prepaid daycare subscriptions with automatic day deduction
- Bulk approve/reject/standby for multiple dates
- Subscription purchase and tracking for customers

### 🏠 Kennel Layout
- Visual drag-and-drop pet-to-kennel assignment
- Building and kennel hierarchy with capacity management
- Vaccination compliance badges on pet chips
- Printable kennel layout for physical reference

### 📊 Business Insights
- Occupancy calendar with color-coded capacity thresholds
- Financial overview with unpaid booking tracking
- Integrated SlimFact invoicing with iDEAL payment support

### 🔒 Role-Based Access Control
- **Customer** — Own profile, pets, bookings, and daycare only
- **Employee** — Customer management, kennel layout, agenda, labels
- **Administrator** — Full system control including configuration and finances

### ⚙️ Configuration
- Pricing categories per species with date-based price overrides
- Customizable opening times with arrival/departure slots
- Optional services (appointments and surcharges)
- Blocked periods with type-based availability rules
- Vacation surcharges with built-in holiday calendars
- Customizable email templates (Handlebars)
- Announcements with urgency levels

### 📱 Technical
- Fully responsive (desktop, tablet, mobile)
- PWA support with offline caching
- Dark mode
- English and Dutch language support
- Self-hosted with Docker Compose

## Self-hosted

You will need a running [Caddy](https://github.com/lucaslorentz/caddy-docker-proxy) container.

```sh
wget https://raw.githubusercontent.com/simsustech/petboarding/main/docker-compose.yaml
wget https://raw.githubusercontent.com/simsustech/petboarding/main/.env.example -O .env
mkdir env
nano -L .env  # Change environment
nano -L env/POSTGRES_PASSWORD # Enter postgres password
nano -L env/OTP_SECRET  # Enter OTP secret, use openssl rand -base64 32
nano -L env/OIDC_COOKIES_KEYS # Enter OIDC cookies keys, use openssl rand -base64 32, comma separated
docker compose up
```

## Development

Petboarding is built on top of [Modular API](https://www.simsus.tech/modularapi). You will need an account for private NPM access.

```sh
git clone https://github.com/simsustech/petboarding.git
cd petboarding
pnpm i
docker compose -f docker-compose.dev.yaml up
cd packages/api
POSTGRES_PASSWORD=your_password POSTGRES_DB=petboarding pnpm run migrate:latest
POSTGRES_PASSWORD=your_password POSTGRES_DB=petboarding pnpm run seed:fake
pnpm run dev
```

## License

Copyright © simsustech 2023-present

[ELv2 License](./LICENSE)

## AI

As of June 2026 the development is AI assisted.
