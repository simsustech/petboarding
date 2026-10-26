# Employee Guide

This guide covers the day-to-day operations tools available to employees — from managing kennels to handling customer records.

---

## Navigation

As an employee, your sidebar menu includes:

- **Day Overview** — Today's arrivals and departures
- **Agenda** — Weekly calendar of bookings and daycare
- **Kennel Layout** — Visual kennel assignment
- **Customers** — Search and manage customer records
- **Pets** — Manage pet profiles and vaccinations
- **Labels** — Print pet and booking labels

---

## Day Overview

The day overview shows all arrivals and departures for a specific date.

1. Go to **Employee → Day Overview**
2. The page defaults to today's date
3. Use the date picker to navigate to other dates
4. See which pets are arriving, departing, or in daycare

> **Print tip:** Print the day overview from the print layout at `/print/overview/:date` for a physical reference sheet.

---

## Agenda

The agenda provides a calendar view of all bookings and daycare appointments.

1. Go to **Employee → Agenda**
2. Switch between **Day** and **Week** views using the toggle
3. Navigate dates with the arrows or date picker
4. Each day shows:
   - **Opening times** — Colored blocks for arrival/departure slots
   - **Bookings** — Pet names with status indicators
   - **Daycare** — Daycare pets for that date
5. **Filter by status** — Show only approved, pending, or specific statuses
6. **Pet chips** show color-coded badges for:
   - 🍽️ Food requirements
   - 💊 Medications
   - 💉 Vaccination status

![Employee agenda](/screenshots/employee-agenda.png)

### Visual Warnings

- **Double-booked** pets are highlighted
- **Appointment services** show an icon badge
- **Missing vaccinations** display a warning indicator

---

## Kennel Layout

Assign pets to kennels visually using drag-and-drop.

### Viewing the Layout

1. Go to **Employee → Kennel Layout**
2. Select a date using the date picker
3. The layout shows buildings and their kennels
4. Assigned pets appear as chips inside kennels

![Kennel layout](/screenshots/employee-kennellayout.png)
4. Assigned pets appear as chips inside kennels

### Assigning Pets to Kennels

1. Find an unassigned pet (they appear in the unassigned area or in another kennel)
2. **Drag** the pet chip
3. **Drop** it onto the target kennel
4. The assignment is saved automatically

### Pet Chip Information

Each pet chip shows:
- Pet name
- Species icon (🐕/🐈)
- Vaccination status badge
- Food and medication indicators
- Right-click for detailed pet information

### Printing the Layout

Print the kennel layout for physical reference:
1. Navigate to `/print/kennellayout/:date`
2. Use your browser's print function
3. The layout is optimized for printing

---

## Managing Customers

Search, view, and update customer records.

### Finding a Customer

1. Go to **Employee → Customers**
2. Use the search bar to find customers by:
   - Name
   - Telephone number
   - Email address
3. Click a customer to view their full profile

### Customer Profile

The customer detail page shows:
- Personal information and contact details
- **Pets** — All registered pets with quick actions
- **Bookings** — All bookings with status
- **Daycare dates** — Daycare attendance records

### Creating Bookings for Customers

1. Open the customer's profile
2. Navigate to their bookings section
3. Click **Add** to create a new booking
4. Fill in dates, times, pets, and services
5. Submit — the booking is created with the same workflow as customer-created bookings

---

## Managing Pets

### Searching Pets

1. Go to **Employee → Pets**
2. Search by name, breed, chip number, or color
3. Results show pet details with vaccination status

### Editing Pet Details

1. Open a pet's profile
2. Edit any field: category, rating, food, medicines, weight, etc.
3. Upload or update the pet's photo
4. Click **Submit** to save

### Recording Vaccinations

1. Open the pet's profile
2. Go to the vaccinations section
3. Click **Add** to record a new vaccination
4. Select the **vaccination type(s)**:
   - **Dogs:** Kennel cough, Parvo, Hepatitis, Distemper, Leptospirosis, Rabies
   - **Cats:** Panleukopenia, Rhinotracheitis, Calicivirus, Rabies, Leukemia
5. Enter the **expiration date**
6. Upload a photo of the vaccination document (passport/certificate)
7. Click **Submit**

> **Compliance:** The kennel layout automatically checks vaccination compliance. Pets with expired or missing mandatory vaccinations show warning badges.

### Pet Relations

Rate compatibility between pets for kennel cohabitation:

1. Open a pet's profile
2. Find the relations section
3. Rate the compatibility (1-10) with another pet
4. Add comments about their relationship

---

## Booking Management (Limited)

As an employee, you can:

- **Create bookings** on behalf of customers
- **Edit booking details** — Dates, times, pets, services
- **Cancel bookings** — With an appropriate reason
- **Update services** — Modify service line items and prices

> **Note:** Approving, rejecting, and standby actions require administrator access.

---

## Labels

Print labels for kennels and bookings.

### Pet Labels

1. Go to **Employee → Labels → Pet Labels**
2. Select the pets you want labels for
3. Labels include pet name, photo, QR code, and key information
4. Print on label paper for kennel doors

### Booking Labels

1. Go to **Employee → Labels → Booking Labels**
2. Select the bookings you want labels for
3. Labels include booking dates, pet names, and owner information
4. Use for check-in/check-out processes

---

## Tips

- **Check the agenda daily** — start your shift with the day overview
- **Update kennel layout early** — assign kennels before arrivals begin
- **Verify vaccinations** — flag expired ones before check-in
- **Print ahead** — get labels and layouts printed before busy periods
- **Use search often** — find any customer or pet in seconds
s
