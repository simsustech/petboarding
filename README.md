# Petboarding

> Easy, fast and reliable pet boarding software.

## Website

https://www.petboarding.app

## Demo

https://demo.petboarding.app

## Features

🧑‍🦱 Customer information
  - Customers register and enter their personal information (customer, contact people and pet details).
  - Customers create boarding bookings or daycare appointments.
    - The status is always visible in the web application.
    - Upon approval or rejection of a booking, customers will receive an email.

📆 Boarding:
  - Review and approve or reject bookings.
  - Day and week overview.
  - Receive a warning about double bookings.
  - Automatically calculate prices.

📅 Daycare:
  - Day and month overviews of the daycare appointments.
  - Prepaid daycare subscriptions for a specified number of days

🔒 Role based authorization
  - Customers can only see and edit their own information.
  - Employees can view customer information and the boarding and daycare overviews.
  - Administrators can handle new bookings and daycare appointments, view the occupancy and add announcements and (unavailable) periods.

📱 Fully responsive (mobile friendly).  
🖨️ Create label printer friendly pet information cards.  

## Self hosted
You will need a running [Caddy](https://github.com/lucaslorentz/caddy-docker-proxy) container.
```sh
wget https://raw.githubusercontent.com/simsustech/petboarding/main/docker-compose.yaml
wget https://raw.githubusercontent.com/simsustech/petboarding/main/.env.example -O .env
mkdir env
nano -L .env  # Change environment
nano -L env/POSTGRES_PASSWORD # Enter postgress password
nano -L env/OTP_SECRET  # Enter OTP secret, use openssl rand -base64 32
nano -L env/OIDC_COOKIES_KEYS # Enter OIDC cookies keys, use openssl rand -base64 32, comma separated
docker compose up
```

## Development
Petboarding is built on top of [Modular API](https://www.simsus.tech/modularapi). You will need an account for private NPM access.
```
git clone https://github.com/simsustech/petboarding.git
cd petboarding
pnpm i
docker compose -f docker-compose.dev.yaml up
cd packages/api
POSTGRES_PASSWORD=ufgouifdgjdfg POSTGRES_DB=petboarding pnpm run migrate:latest
POSTGRES_PASSWORD=ufgouifdgjdfg POSTGRES_DB=petboarding pnpm run seed:fake
pnpm run dev
```

## License
Copyright © simsustech 2023-present

[ELv2 License](./LICENSE)

## AI
As of June 2026 the development is AI assisted.
