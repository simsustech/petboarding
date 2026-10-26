# Medewerkershandleiding

Dit is uw handleiding voor de dagelijkse tools die u als medewerker gebruikt — van kennelbeheer tot klantdossiers.

---

## Navigatie

Als medewerker bevat uw zijbalkmenu:

- **Dagoverzicht** — Aankomsten en vertrekken van vandaag
- **Agenda** — Weekkalender van reserveringen en dagopvang
- **Kennelindeling** — Visuele kenneltoewijzing
- **Klanten** — Klanten zoeken en beheren
- **Huisdieren** — Huisdierprofielen en vaccinaties beheren
- **Labels** — Huisdier- en reserveringslabels afdrukken

---

## Dagoverzicht

Het dagoverzicht toont alle aankomsten en vertrekken voor een specifieke datum.

1. Ga naar **Medewerker → Dagoverzicht**
2. De pagina toont standaard de datum van vandaag
3. Gebruik de datumkiezer om naar andere datums te navigeren
4. Zie welke huisdieren aankomen, vertrekken of in de dagopvang zijn

> **Printtip:** Druk het dagoverzicht af via `/print/overview/:datum` voor een fysiek referentieblad.

---

## Agenda

De agenda biedt een kalenderweergave van alle reserveringen en dagopvangafspraken.

1. Ga naar **Medewerker → Agenda**
2. Schakel tussen **Dag** en **Week** weergave
3. Navigeer door datums met de pijlen of datumkiezer
4. Elke dag toont:
   - **Openingstijden** — Gekleurde blokken voor breng-/haalslots
   - **Reserveringen** — Huisdiernamen met statusindicatoren
   - **Dagopvang** — Dagopvanghuisdieren voor die datum
5. **Filter op status** — Toon alleen goedgekeurd, in behandeling of specifieke statussen
6. **Huisdierchips** tonen kleurgecodeerde badges voor:
   - 🍽️ Voedingsvereisten
   - 💊 Medicatie
   - 💉 Vaccinatiestatus

### Visuele Waarschuwingen

- **Dubbel geboekte** huisdieren worden gemarkeerd
- **Afspraakdiensten** tonen een icoonbadge
- **Ontbrekende vaccinaties** tonen een waarschuwingsindicator

---

## Kennelindeling

Wijs huisdieren visueel toe aan kennels met drag-and-drop.

### De indeling bekijken

1. Ga naar **Medewerker → Kennelindeling**
2. Selecteer een datum met de datumkiezer
3. De indeling toont gebouwen en hun kennels
4. Toegewezen huisdieren verschijnen als chips in kennels

### Huisdieren aan kennels toewijzen

1. Zoek een niet-toegewezen huisdier (ze verschijnen in het niet-toegewezen gebied of in een andere kennel)
2. **Sleep** de huisdierchip
3. **Laat los** op de doelkennel
4. De toewijzing wordt automatisch opgeslagen

### Huisdierchip Informatie

Elke huisdierchip toont:
- Huisdiernaam
- Soortpictogram (🐕/🐈)
- Vaccinatiestatusbadge
- Voedsel- en medicatie-indicatoren
- Rechtsklik voor gedetailleerde huisdierinformatie

### De indeling afdrukken

Druk de kennelindeling af voor fysieke referentie:
1. Navigeer naar `/print/kennellayout/:datum`
2. Gebruik de printfunctie van uw browser
3. De indeling is geoptimaliseerd voor afdrukken

---

## Klanten beheren

Klantgegevens zoeken, bekijken en bijwerken.

### Een klant vinden

1. Ga naar **Medewerker → Klanten**
2. Gebruik de zoekbalk om klanten te vinden op:
   - Naam
   - Telefoonnummer
   - E-mailadres
3. Klik op een klant om het volledige profiel te bekijken

### Klantprofiel

De klantdetailpagina toont:
- Persoonlijke gegevens en contactdetails
- **Huisdieren** — Alle geregistreerde huisdieren met snelle acties
- **Reserveringen** — Alle reserveringen met status
- **Dagopvangdatums** — Dagopvang aanwezigheidsgegevens

### Reserveringen maken voor klanten

1. Open het klantprofiel
2. Navigeer naar hun reserveringssectie
3. Klik op **Toevoegen** om een nieuwe reservering te maken
4. Vul datums, tijden, huisdieren en diensten in
5. Verzenden — de reservering wordt aangemaakt volgens dezelfde workflow

---

## Huisdieren beheren

### Huisdieren zoeken

1. Ga naar **Medewerker → Huisdieren**
2. Zoek op naam, ras, chipnummer of kleur
3. Resultaten tonen huisdierdetails met vaccinatiestatus

### Huisdiergegevens bewerken

1. Open het profiel van een huisdier
2. Bewerk elk veld: categorie, beoordeling, voeding, medicijnen, gewicht, etc.
3. Upload of update de foto van het huisdier
4. Klik op **Opslaan**

### Vaccinaties registreren

1. Open het profiel van het huisdier
2. Ga naar de vaccinatiesectie
3. Klik op **Toevoegen** om een nieuwe vaccinatie te registreren
4. Selecteer het **vaccinatietype(n)**:
   - **Honden:** Kennelhoest, Parvo, Hepatitis, Distemper, Leptospirose, Rabiës
   - **Katten:** Panleukopenie, Rhinotracheïtis, Calicivirus, Rabiës, Leukemie
5. Voer de **vervaldatum** in
6. Upload een foto van het vaccinatiedocument (paspoort/certificaat)
7. Klik op **Opslaan**

> **Naleving:** De kennelindeling controleert automatisch de vaccinatienaleving. Huisdieren met verlopen of ontbrekende verplichte vaccinaties tonen waarschuwingsbadges.

### Huisdierrelaties

Beoordeel compatibiliteit tussen huisdieren voor kennelindeling:

1. Open het profiel van een huisdier
2. Zoek de relatiesectie
3. Beoordeel de compatibiliteit (1-10) met een ander huisdier
4. Voeg opmerkingen toe over hun relatie

---

## Reserveringsbeheer (Beperkt)

Als medewerker kunt u:

- **Reserveringen maken** namens klanten
- **Reserveringsdetails bewerken** — Datums, tijden, huisdieren, diensten
- **Reserveringen annuleren** — Met een passende reden
- **Diensten bijwerken** — Dienstregels en prijzen wijzigen

> **Let op:** Goedkeuren, afwijzen en op standby zetten vereist beheerderstoegang.

---

## Labels

Print labels voor kennels en reserveringen.

### Huisdierlabels

1. Ga naar **Medewerker → Labels → Huisdierlabels**
2. Selecteer de huisdieren waarvoor u labels wilt
3. Labels bevatten huisdiernaam, foto, QR-code en belangrijke informatie
4. Print op labelpapier voor kenneldeuren

### Reserveringslabels

1. Ga naar **Medewerker → Labels → Reserveringslabels**
2. Selecteer de reserveringen waarvoor u labels wilt
3. Labels bevatten reserveringsdatums, huisdiernamen en eigenaarsinformatie
4. Gebruik voor in- en uitcheckprocessen

---

## Tips

- **Controleer de agenda dagelijks** — Begin uw dienst met het dagoverzicht
- **Werk de kennelindeling vroeg bij** — Wijs kennels toe voordat aankomsten beginnen
- **Controleer vaccinaties** — Markeer verlopen vaccinaties voor het inchecken
- **Print vooruit** — Print labels en indelingen voor drukke periodes
- **Gebruik zoeken regelmatig** — Vind elke klant of elk huisdier in seconden
