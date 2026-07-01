# Beheerdershandleiding

Hier vindt u alles wat u als beheerder kunt doen — van het goedkeuren van reserveringen tot het configureren van uw hele faciliteit.

---

## Navigatie

Als beheerder bevat uw zijbalk alles wat medewerkers zien, plus:

- **Financieel** — Onbetaalde reserveringen en factuurtracking
- **Accounts** — Gebruikersaccountbeheer
- **Reserveringen** — Volledige beoordelingsworkflow
- **Dagopvang** — Dagopvangdatums beheren
- **Bezetting** — Capaciteitsplanningskalender
- **Aankondigingen** — Openbare mededelingen
- **Periodes** — Geblokkeerde datums beheren
- **Configuratie** — Faciliteitsinstellingen en prijzen

> **Wachtrijbadges:** Rode badges op de zijbalk tonen hoeveel reserveringen en dagopvangdatums wachten op uw beoordeling.

---

## Reserveringen beoordelen

### In behandeling zijnde reserveringen bekijken

1. Ga naar **Beheerder → Reserveringen**
2. De pagina toont alle reserveringen, filterbaar op status
3. Klik op **In behandeling** om te zien welke wachten op beoordeling
4. Klik op een reservering voor details

### Een reservering goedkeuren

1. Open een reservering in behandeling
2. Controleer de datums, huisdieren, diensten en klantinformatie
3. Controleer de vaccinatiestatus — ontbrekende vaccinaties kunnen aandacht nodig hebben
4. Klik op **Goedkeuren**
5. Bekijk de goedkeuringsmail — controleer het Handlebars sjabloon
6. Verzenden — de klant ontvangt een e-mail met bevestiging

> **Aanbetaling:** Indien geconfigureerd kunnen reserveringen worden goedgekeurd als "wachtend op aanbetaling". De klant moet betalen voordat de reservering volledig is bevestigd. Onbetaalde reserveringen worden automatisch geannuleerd na de betalingstermijn.

### Een reservering afwijzen

1. Open een reservering
2. Klik op **Afwijzen**
3. Stel een afwijzingsmail op met de reden
4. Verzenden — de klant wordt op de hoogte gesteld

### Op wachtlijst plaatsen

1. Open een reservering
2. Klik op **Standby**
3. De klant ontvangt een melding dat ze op de wachtlijst staan
4. U kunt standby reserveringen later goedkeuren of afwijzen

### Antwoorden op een reservering

Stuur een aangepast bericht zonder de status te wijzigen:
1. Open een willekeurige reservering
2. Klik op **Beantwoorden**
3. Schrijf uw bericht
4. Verzenden

### Annuleringen afhandelen

Geannuleerde reserveringen finaliseren:
1. Ga naar **Beheerder → Reserveringen**
2. Zoek een geannuleerde reservering
3. Klik op **Annulering afhandelen**
4. Annuleringskosten worden automatisch berekend op basis van uw configuratie

---

## Dagopvangdatums beheren

### Dagopvang beoordelen

1. Ga naar **Beheerder → Dagopvang**
2. Bekijk de kalender met alle dagopvangdatums
3. Filter op status (in behandeling, goedgekeurd, etc.)
4. Selecteer meerdere datums voor bulkacties

### Bulkoperaties

- **Geselecteerde goedkeuren** — Keur alle aangevinkte datums goed
- **Geselecteerde afwijzen** — Wijs alle aangevinkte datums af
- **Geselecteerde op standby** — Zet alle aangevinkte datums op de wachtlijst

> **Let op:** Dagopvangoperaties versturen geen automatische e-mails. Klanten controleren hun status op de dagopvangpagina.

---

## Financieel beheer

### Overzicht

1. Ga naar **Beheerder → Financieel → Overzicht**
2. Bekijk alle onbetaalde reserveringen met:
   - Klantnaam
   - Reserveringsdatums
   - Verschuldigd bedrag
   - Dagen openstaand
3. Filter op betalingsstatus

### Reserveringsfacturen

1. Ga naar **Beheerder → Financieel → Reserveringen**
2. Bekijk factuurstatus voor alle goedgekeurde reserveringen
3. Volg betalingen, openstaande bedragen en terugbetalingen
4. Totalenrij vat alle financiële gegevens samen

> **SlimFact integratie:** Indien geconfigureerd worden facturen automatisch aangemaakt en betalingsstatussen gesynchroniseerd. iDEAL-betalingen worden ondersteund.

---

## Gebruikersaccounts

### Accounts beheren

1. Ga naar **Beheerder → Accounts**
2. Zoek accounts op e-mail, naam of filter op rol
3. Klik op een account om details te bekijken

### Rollen toewijzen

1. Open een account
2. Voeg rollen toe:
   - **Beheerder** — Volledige systeemtoegang
   - **Medewerker** — Personeelsoperaties
   - **Manager** — Gereserveerd voor toekomstig gebruik
   - **Stagiair** — Gereserveerd voor toekomstig gebruik
3. Verwijder rollen door op het verwijderpictogram te klikken
4. Wijzigingen worden actief bij de volgende login

---

## Bezettingskalender

Plan capaciteit met het maandelijkse bezettingsoverzicht.

1. Ga naar **Beheerder → Bezetting**
2. Selecteer een maand met de datumkiezer
3. Elke dag toont twee getallen:
   - **B** — Aantal pensionhuisdieren
   - **D** — Aantal dagopvanghuisdieren
4. Kleurcodering:
   - 🟢 Groen — Ruim binnen capaciteit
   - 🟡 Geel — Wordt druk
   - 🟠 Oranje — Bijna vol
   - 🔴 Rood — Op of over capaciteit
5. Klik op een dag om naar de medewerkersagenda te gaan

---

## Aankondigingen

Plaats mededelingen die op de openbare homepage verschijnen.

### Een aankondiging maken

1. Ga naar **Beheerder → Aankondigingen**
2. Klik op **Toevoegen**
3. Vul in:
   - **Titel** — Korte kop
   - **Bericht** — Volledige aankondigingstekst
   - **Type**:
     - **Algemeen** — Standaard mededeling
     - **Belangrijk** — Uitgelichte mededeling
     - **Prioriteit** — Zeer zichtbare mededeling
     - **Urgent** — Blijvend popupvenster op de homepage
   - **Vervaldatum** — Wanneer de aankondiging automatisch moet verdwijnen
4. Klik op **Opslaan**

### Aankondigingen beheren

- **Bewerken** — Titel, bericht, type of vervaldatum bijwerken
- **Verwijderen** — Een aankondiging onmiddellijk verwijderen

---

## Periodes (Geblokkeerde datums)

Blokkeer datums wanneer uw pension niet beschikbaar is.

### Een periode maken

1. Ga naar **Beheerder → Periodes**
2. Klik op **Toevoegen**
3. Stel de begin- en einddatum in
4. Kies een type:
   - **Niet beschikbaar voor alles** — Geen reserveringen of dagopvang
   - **Niet beschikbaar voor reserveringen** — Geen pension, dagopvang wel toegestaan
   - **Niet beschikbaar voor dagopvang** — Geen dagopvang, pension wel toegestaan
5. Voeg **opmerkingen** toe (zichtbaar voor medewerkers)
6. Stel **minimum beoordeling voor uitzondering** in — laat hoog beoordeelde klanten toch boeken
7. Klik op **Opslaan**

### Periodes beheren

- **Bewerken** — Datums, type of opmerkingen aanpassen
- **Verwijderen** — Een periode verwijderen

---

## Configuratie

De configuratiesectie beheert elk aspect van uw faciliteit. Bereikbaar via **Beheerder → Configuratie**.

### Gebouwen

Definieer de fysieke indeling van uw faciliteit.

1. Ga naar **Configuratie → Gebouwen**
2. Klik op **Toevoegen**
3. Voer gebouwnaam, locatie en beschrijving in
4. Stel de weergavevolgorde in
5. Klik op **Opslaan**

### Kennels

Voeg kennels toe binnen elk gebouw.

1. Ga naar **Configuratie → Kennels**
2. Klik op **Toevoegen**
3. Selecteer het **gebouw** waar deze kennel bij hoort
4. Voer kennel **naam**, **beschrijving** en **capaciteit** in
5. Stel weergave **volgorde** in
6. Klik op **Opslaan**

### Categorieën & Prijzen

Stel prijscategorieën in per soort en grootte.

1. Ga naar **Configuratie → Categorieën**
2. Klik op **Toevoegen**
3. Selecteer **soort** (hond of kat)
4. Voer categorie **naam** in (bijv. "Klein", "Middel", "Groot")
5. Stel de basis **prijs** per dag in
6. Stel weergave **volgorde** in
7. Klik op **Opslaan**

#### Categorieprijzen (Datumgebaseerde wijzigingen)

Stel prijzen in die op specifieke datums wijzigen:
1. Selecteer een categorie op de Categorieënpagina
2. Voeg een categorieprijs toe met een ingangs**datum** en **prijs**
3. Prijzen worden automatisch toegepast vanaf de ingangsdatum

### Openingstijden

Definieer wanneer klanten huisdieren kunnen brengen en halen.

1. Ga naar **Configuratie → Openingstijden**
2. Klik op **Toevoegen**
3. Voer een **naam** in (bijv. "Ochtend brengen")
4. Stel **starttijd** en **eindtijd** in
5. Selecteer **dagen van de week**
6. Kies een **type**:
   - **Aankomst** — Brengtijdslot
   - **Vertrek** — Haaltijdslot
   - **Alle** — Zowel brengen als halen
7. Stel **startdag geteld** en **einddag geteld** in:
   - 1.0 = hele dag
   - 0.5 = halve dag
8. Markeer **niet-beschikbare feestdagen**
9. Optioneel **uitschakelen**
10. Klik op **Opslaan**

### Diensten

Bied optionele extra diensten aan.

1. Ga naar **Configuratie → Diensten**
2. Klik op **Toevoegen**
3. Voer dienst **naam** en **beschrijving** in
4. Kies **type**:
   - **Afspraak** — Geplande dienst (bijv. trimmen)
   - **Toeslag** — Per verblijf (bijv. medicatietoediening)
5. Stel de **prijs** in
6. Optioneel **verbergen** of **uitschakelen**
7. Klik op **Opslaan**

### Dagopvangabonnementen

Maak prepaid dagopvangpakketten.

1. Ga naar **Configuratie → Dagopvangabonnementen**
2. Klik op **Toevoegen**
3. Voer een **beschrijving** in (bijv. "10-dagen pakket")
4. Stel het **aantal dagen** in
5. Definieer de **geldigheidsperiode** in jaren, maanden en dagen
6. Stel de **prijs** in
7. Klik op **Opslaan**

### Vakanties

Voeg vakantieperiodes met toeslagen toe.

1. Ga naar **Configuratie → Vakanties**
2. Klik op **Toevoegen**
3. Voer een **naam** in (bijv. "Kerstvakantie")
4. Stel **startdatum** en **einddatum** in
5. Voer de **toeslag per dag** in
6. Klik op **Opslaan**

> **Feestdaggegevens:** Petboarding bevat vooraf geladen schoolvakantiedata voor meerdere landen. Configureer uw land in de omgevingsinstellingen.

### Documenten

Bewerk juridische documenten die aan klanten worden getoond.

1. Ga naar **Configuratie → Documenten**
2. Bewerk de **Algemene Voorwaarden**
3. Bewerk het **Privacybeleid**
4. Wijzigingen worden onmiddellijk van kracht

### E-mailsjablonen

Pas de e-mails aan die naar klanten worden verzonden.

1. Ga naar **Configuratie → E-mailsjablonen** (indien ingeschakeld)
2. Selecteer een sjabloon:
   - Reservering goedgekeurd
   - Reservering afgewezen
   - Reservering op standby
   - Reservering beantwoorden
3. Bewerk het **onderwerp** en de **inhoud** met Handlebars variabelen:

<div v-pre>

- `{{customer.firstName}}` — Voornaam van de klant
- `{{startDate}}` / `{{endDate}}` — Reserveringsdatums
- `{{pets}}` — Huisdiernamen
- `{{invoiceUrl}}` — Betaallink

</div>
   - En meer...
4. Klik op **Opslaan**

### Integraties

Controleer de status van verbonden diensten.

1. Ga naar **Configuratie → Integraties**
2. Bekijk de **SlimFact** integratiestatus
3. Klik op **Opnieuw authenticeren** om de verbinding te vernieuwen

---

## Huisdieren verwijderen (Permanent)

Beheerders kunnen huisdiergegevens permanent verwijderen:

1. Ga naar het profiel van het huisdier
2. Klik op **Huisdier verwijderen**
3. Bevestig de verwijdering

> **Waarschuwing:** Deze actie is onomkeerbaar. Overweeg om het huisdier als "overleden" te markeren.

---

## Tips

- **Beoordeel reserveringen dagelijks** — Laat geen reserveringen in behandeling oplopen
- **Controleer de bezettingskalender** — Plan capaciteit voordat u grote reserveringen goedkeurt
- **Configureer prijzen zorgvuldig** — Test met een voorbeeldreservering na het wijzigen van categorieën of prijzen
- **Gebruik aankondigingen proactief** — Plaats vakantieschema's en sluitingsdata vroegtijdig
- **Monitor financiën regelmatig** — Volg onbetaalde reserveringen voor cashflowbeheer
