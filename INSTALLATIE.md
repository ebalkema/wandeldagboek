# Installatie van de Wandeldagboek App

Volg onderstaande stappen om de Wandeldagboek App te installeren en te starten op je lokale machine.

## Vereisten

- Node.js (versie 14 of hoger)
- npm (meestal meegeleverd met Node.js)

## Stappen

1. **Installeer de benodigde dependencies**

   Navigeer naar de hoofdmap van het project en voer het volgende commando uit:

   ```bash
   npm install
   ```

   Dit installeert alle benodigde packages die gedefinieerd zijn in het `package.json` bestand.

2. **Start de ontwikkelserver**

   Na het installeren van de dependencies, kun je de app starten met:

   ```bash
   npm start
   ```

   Dit commando start de ontwikkelserver en opent automatisch een browservenster met de app. Als dit niet gebeurt, kun je handmatig navigeren naar [http://localhost:3000](http://localhost:3000).

## Gebruik van de App

- Op het startscherm zie je een lijst van al je wandelnotities (leeg bij eerste start)
- Klik op "Nieuwe Wandelnotitie" om een nieuwe notitie toe te voegen
- De app vraagt om toestemming voor je locatie en microfoon - sta deze toe
- Maak een spraaknotitie door op "Start Opname" te klikken en vervolgens "Stop Opname" wanneer je klaar bent
- Je kunt optioneel een foto toevoegen en extra aantekeningen schrijven
- Klik op "Opslaan" om de notitie op te slaan in de lokale opslag van je browser

## Aandachtspunten

- Alle gegevens worden lokaal opgeslagen in je browser (localStorage)
- Voor optimale functionaliteit, gebruik een moderne browser die de Web Audio API en Geolocation API ondersteunt
- Voor het weer-gedeelte wordt een gratis API-key gebruikt van OpenWeatherMap met beperkte toegang. In een productieomgeving zou je je eigen key moeten gebruiken.

## Problemen oplossen

Als je problemen ondervindt:

- Zorg dat je toestemming hebt gegeven voor locatie en microfoon
- Controleer of je een actieve internetverbinding hebt (nodig voor de weer-API)
- Probeer de browser te vernieuwen of de app opnieuw te starten 