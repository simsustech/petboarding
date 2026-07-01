# Administrator Guide

This guide covers the full administrator toolkit — from approving bookings to configuring your entire facility.

---

## Navigation

As an administrator, your sidebar includes everything employees see, plus:

- **Financial** — Unpaid bookings and invoice tracking
- **Accounts** — User account management
- **Bookings** — Full booking review workflow
- **Daycare** — Manage daycare dates
- **Occupancy** — Capacity planning calendar
- **Announcements** — Public notices
- **Periods** — Blocked date management
- **Configuration** — Facility setup and pricing

> **Pending badges:** Red badges on the sidebar show how many bookings and daycare dates are waiting for your review.

---

## Reviewing Bookings

### Viewing Pending Bookings

1. Go to **Admin → Bookings**
2. The page shows all bookings, filterable by status
3. Click **Pending** to see bookings awaiting review
4. Click a booking to view its details

![Admin bookings](/screenshots/admin-bookings.png)

### Approving a Booking

1. Open a pending booking
2. Review the dates, pets, services, and customer information
3. Check pet vaccination status — missing vaccinations may need attention
4. Click **Approve**
5. Pre-compose the approval email — review the Handlebars template
6. Send — the customer receives an email with booking confirmation

> **Down payment:** If configured, bookings can be approved as "awaiting down payment." The customer must pay before the booking is fully confirmed. Unpaid bookings are automatically canceled after the payment deadline.

### Rejecting a Booking

1. Open a booking
2. Click **Reject**
3. Compose a rejection email explaining the reason
4. Send — the customer is notified

### Placing on Standby

1. Open a booking
2. Click **Standby**
3. The customer receives a notification that they're on the waiting list
4. You can approve or reject standby bookings later

### Replying to a Booking

Send a custom message without changing the booking status:
1. Open any booking
2. Click **Reply**
3. Write your message
4. Send

### Settling Cancelations

Finalize canceled bookings:
1. Go to **Admin → Bookings**
2. Find a canceled booking
3. Click **Settle cancelation**
4. Cancelation costs are automatically calculated based on your configuration

---

## Managing Daycare Dates

### Reviewing Daycare

1. Go to **Admin → Daycare**
2. View the calendar showing all daycare dates
3. Filter by status (pending, approved, etc.)
4. Select multiple dates for bulk actions

### Bulk Operations

- **Approve selected** — Approve all checked daycare dates
- **Reject selected** — Reject all checked daycare dates
- **Standby selected** — Place all checked dates on standby

> **Note:** Daycare operations do not send automatic emails. Customers check their status on the daycare page.

---

## Financial Management

### Overview

1. Go to **Admin → Financial → Overview**
2. See all unpaid bookings with:
   - Customer name
   - Booking dates
   - Amount due
   - Days outstanding
3. Filter by payment status

### Booking Invoices

1. Go to **Admin → Financial → Bookings**
2. View invoice status for all approved bookings
3. Track payments, outstanding amounts, and refunds
4. Totals row summarizes all financial data

> **SlimFact integration:** If configured, invoices are automatically created and payment statuses are synchronized. iDEAL payments are supported.

---

## User Accounts

### Managing Accounts

1. Go to **Admin → Accounts**
2. Search accounts by email, name, or filter by role
3. Click an account to view details

### Assigning Roles

1. Open an account
2. Add roles:
   - **Administrator** — Full system access
   - **Employee** — Staff operations
   - **Manager** — Reserved for future use
   - **Intern** — Reserved for future use
3. Remove roles by clicking the remove icon
4. Changes take effect on the user's next login

---

## Occupancy Calendar

Plan capacity with the monthly occupancy view.

1. Go to **Admin → Occupancy**
2. Select a month using the date picker
3. Each day shows two numbers:
   - **B** — Booking pet count
   - **D** — Daycare pet count
4. Color coding:
   - 🟢 Green — Well within capacity
   - 🟡 Yellow — Getting busy
   - 🟠 Orange — Nearly full
   - 🔴 Red — At or over capacity
5. Click a day to jump to the employee agenda for that date

![Occupancy calendar](/screenshots/admin-occupancy.png)

---

## Announcements

Post notices that appear on the public homepage.

### Creating an Announcement

1. Go to **Admin → Announcements**
2. Click **Add**
3. Fill in:
   - **Title** — Short heading
   - **Message** — Full announcement text
   - **Type**:
     - **General** — Standard notice
     - **Important** — Highlighted notice
     - **Priority** — High-visibility notice
     - **Urgent** — Persistent popup dialog on the homepage
   - **Expiration date** — When the announcement should automatically hide
4. Click **Submit**

### Managing Announcements

- **Edit** — Update title, message, type, or expiration
- **Delete** — Remove an announcement immediately

---

## Periods (Blocked Dates)

Block dates when your facility is unavailable.

### Creating a Period

1. Go to **Admin → Periods**
2. Click **Add**
3. Set the start and end dates
4. Choose a type:
   - **Unavailable for all** — No bookings or daycare
   - **Unavailable for bookings** — No boarding, daycare still allowed
   - **Unavailable for daycare** — No daycare, boarding still allowed
5. Add **comments** (visible to employees)
6. Set **minimum rating for exception** — Allow high-rated customers to book despite the block
7. Click **Submit**

### Managing Periods

- **Edit** — Adjust dates, type, or comments
- **Delete** — Remove a period

---

## Configuration

The configuration section controls every aspect of your facility. Access it from **Admin → Configuration**.

### Buildings

Define your physical facility layout.

1. Go to **Configuration → Buildings**
2. Click **Add**
3. Enter building name, location, and description
4. Set display order to control the listing sequence
5. Click **Submit**

### Kennels

Add kennels within each building.

1. Go to **Configuration → Kennels**
2. Click **Add**
3. Select the **building** this kennel belongs to
4. Enter kennel **name**, **description**, and **capacity**
5. Set display **order**
6. Click **Submit**

### Categories & Pricing

Set pet pricing categories by species and size.

1. Go to **Configuration → Categories**
2. Click **Add**
3. Select **species** (dog or cat)
4. Enter category **name** (e.g., "Small", "Medium", "Large")
5. Set the base **price** per day
6. Set display **order**
7. Click **Submit**

#### Category Prices (Date-Based Overrides)

Set prices that change on specific dates (e.g., annual price adjustments):
1. In the Categories page, select a category
2. Add a category price with an effective **date** and **list price**
3. Prices automatically apply from the effective date forward

### Opening Times

Define when customers can drop off and pick up pets.

1. Go to **Configuration → Opening Times**
2. Click **Add**
3. Enter a **name** (e.g., "Morning drop-off")
4. Set **start time** and **end time**
5. Select **days of the week** when this slot is available
6. Choose a **type**:
   - **Arrival** — Drop-off time slot
   - **Departure** — Pick-up time slot
   - **All** — Both arrival and departure
7. Set **start day counted** and **end day counted** — Controls how days are priced:
   - 1.0 = full day
   - 0.5 = half day
8. Mark **unavailable holidays** — Dates when this slot is not available
9. Optionally **disable** the slot temporarily
10. Click **Submit**

### Services

Offer optional add-on services.

1. Go to **Configuration → Services**
2. Click **Add**
3. Enter service **name** and **description**
4. Choose **type**:
   - **Appointment** — Scheduled service (e.g., grooming)
   - **Surcharge** — Per-stay fee (e.g., medication administration)
5. Set the **list price**
6. Optionally **hide** or **disable** the service
7. Click **Submit**

### Daycare Subscriptions

Create prepaid daycare packages.

1. Go to **Configuration → Daycare Subscriptions**
2. Click **Add**
3. Enter a **description** (e.g., "10-day package")
4. Set **number of days** included
5. Define the **validity period** in years, months, and days
6. Set the **list price**
7. Click **Submit**

### Vacations

Add holiday periods with surcharges.

1. Go to **Configuration → Vacations**
2. Click **Add**
3. Enter a **name** (e.g., "Christmas holiday")
4. Set **start date** and **end date**
5. Enter the **surcharge per day**
6. Click **Submit**

> **Holiday data:** Petboarding includes pre-loaded school vacation dates for multiple countries. Configure your country in the environment settings.

### Documents

Edit legal documents displayed to customers.

1. Go to **Configuration → Documents**
2. Edit the **Terms and Conditions** content
3. Edit the **Privacy Policy** content
4. Changes take effect immediately

### Email Templates

Customize the emails sent to customers.

1. Go to **Configuration → Email Templates** (if enabled)
2. Select a template:
   - Booking approved
   - Booking rejected
   - Booking standby
   - Booking reply
3. Edit the **subject** and **body** using Handlebars variables:

<div v-pre>

- `{{customer.firstName}}` — Customer's first name
- `{{startDate}}` / `{{endDate}}` — Booking dates
- `{{pets}}` — Pet names
- `{{invoiceUrl}}` — Payment link

</div>
   - And more...
4. Click **Submit**

### Integrations

Check the status of connected services.

1. Go to **Configuration → Integrations**
2. View the **SlimFact** integration status:
   - ✅ Connected and authorized
   - ⚠️ Authorization expiring — Re-authenticate
   - ❌ Not connected — Check configuration
3. Click **Re-authenticate** to refresh the SlimFact connection

---

## Deleting Pets (Permanent)

Administrators can permanently delete pet records:

1. Go to the pet's profile (via employee or admin routes)
2. Click **Delete pet**
3. Confirm the deletion

> **Warning:** This action is irreversible. Consider marking the pet as "deceased" instead.

---

## Tips

- **Review bookings daily** — don't let pending bookings pile up
- **Check the occupancy calendar** — plan capacity before approving large bookings
- **Configure pricing carefully** — test with a sample booking after changing categories or prices
- **Use announcements proactively** — post holiday schedules and maintenance closures early
- **Monitor financials regularly** — keep an eye on unpaid bookings to maintain cash flow
