---
title: Kennelindeling per dag voor boekingen
description: Kenneltoewijzingen voor boekingen kunnen nu per dag worden ingesteld in plaats van één keer per boeking.
date: 2026-07-18
author: Petboarding
---

# Kennelindeling per dag voor boekingen

Kenneltoewijzingen voor boekingen worden nu per dag opgehaald in plaats van één keer per boeking. De basisindeling blijft op de boekingsrij staan; specifieke dagen die afwijken worden als overrides opgeslagen.

## Wat is er veranderd

- De kennelindeling voor een boekingshuisdier is niet langer één enkele waarde die voor elke dag van de boeking geldt.
- Een huisdier voor een specifieke dag naar een kennel slepen schrijft een override voor alleen die datum.
- Een sleep-actie naar de wachtlijst op een specifieke dag verwijdert voorwaartse overrides voor dat huisdier binnen die boeking. De boekingsbasis neemt het weer over.
- De effectieve kennel voor elke (boeking, huisdier, datum) is de meest recente override met `date <= <datum>` binnen de boeking, of de basis als er geen override is.
- Daycare is ongewijzigd; daycare-toewijzingen waren al per dag.
- Opslagkosten zijn één rij per sleep-actie, ongeacht de boekingsduur. Er is geen rij-uitbreiding per dag.

## Backend

De wijziging zit in `packages/api/src/repositories/kennel.ts` en `packages/api/src/trpc/employee/kennels.ts`. Het leespad voegt een `LEFT JOIN LATERAL` toe op `booking_pet_kennel_override`, die de override pakt met `date <= $inputDate` gesorteerd op `date DESC LIMIT 1` en beperkt tot `bookings.startDate..endDate`. De override heeft `(booking_id, pet_id, date)` als sleutel, met een index op `(booking_id, date)` voor de opzoeking.

Het schrijfpad gebruikt PostgreSQL `INSERT … ON CONFLICT (booking_id, pet_id, date) DO UPDATE SET kennel_id = EXCLUDED.kennel_id`. Sleep-naar-wachtlijst is geïmplementeerd als een `DELETE` op `(booking_id, pet_id)` met `date >= <dag>`.

Een nieuwe migratie `31_create_booking_pet_kennel_override_table.ts` maakt de tabel aan.

## Frontend

`packages/app/src/pages/employee/KennelLayout.vue` roept nu `employee.setBookingPetKennelForDate` aan met de geselecteerde datum als onderdeel van elke sleep-actie. `getPetKennels` is vanuit de client ongewijzigd; het accepteert nog steeds `{ date }` en de server lost de effectieve kennel op.

## Gedrag

- Zelfde boeking, geen overrides: gedraagt zich exact zoals voorheen.
- Huisdier X naar kennel 7 slepen op dag _D_: het huisdier zit in kennel 7 op dag _D_ en elke latere dag van de boeking die geen eigen override heeft.
- Huisdier X naar een andere kennel slepen op dag _D+5_: die sleep-actie vervangt de fill-forward vanaf _D+5_.
- Huisdier X naar de wachtlijst slepen op dag _D_: alle overrides voor huisdier X op `date >= D` worden verwijderd; de effectieve kennel vanaf _D_ valt terug op de boekingsbasis.
- Het bewerken van een boeking (de huisdierenlijst wijzigen) wist alle overrides voor die boeking in dezelfde transactie als de bestaande `booking_pet_kennel`-wissen.

## Opslag

Het aantal rijen wordt begrensd door het aantal expliciete sleep-acties per boeking, niet door de duur van de boeking.

## Verificatie

`packages/api/tests/e2e/kennelLayout.spec.ts` voegt een testcase toe die een boekingshuisdier naar een kennel sleept op dag _A_, hetzelfde huisdier naar een andere kennel sleept op dag _B_, terugschakelt naar dag _A_, en controleert dat de dag-_A_-indeling ongewijzigd is. `pnpm run test:e2e` haalt 40 / 40.

![Kennelindeling slepen en neerzetten](/screenshots/employee-kennellayout-nl.png)
