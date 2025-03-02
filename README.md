# Wandeldagboek App

Een minimalistische app waarmee je wandelnotities kunt maken, inclusief audio-opnames, locatie, weer, foto's en tekst.

## Functionaliteiten

- Maak audio-opnames tijdens je wandeling
- Sla automatisch je locatie en de weersomstandigheden op
- Voeg optioneel foto's en beschrijvingen toe
- Bekijk al je wandelnotities in een handig overzicht
- Luister je opgenomen notities terug
- Gegevens worden lokaal opgeslagen in je browser

## Aan de slag

In de projectdirectory kun je het volgende commando uitvoeren:

### `npm start`

Hiermee start je de app in development mode.\
Open [http://localhost:3000](http://localhost:3000) om het in de browser te bekijken.

## Weer-API configureren

De app gebruikt OpenWeatherMap voor weergegevens. Standaard wordt een gratis API-sleutel gebruikt, maar deze heeft beperkingen:
- 60 aanvragen per minuut
- 1.000 aanvragen per dag
- Beperkte gegevens

Voor een betrouwbaardere ervaring raden we aan om je eigen API-sleutel te gebruiken:

1. Maak een account aan op [OpenWeatherMap](https://openweathermap.org/api)
2. Verkrijg een gratis API-sleutel
3. Maak een `.env` bestand aan in de hoofdmap van het project
4. Voeg de volgende regel toe: `REACT_APP_WEATHER_API_KEY=jouw_api_sleutel`
5. Herstart de ontwikkelserver

Als alternatief kun je ook andere weer-API's gebruiken door de `fetchWeather` functie in `src/components/NewEntry.js` aan te passen.

## Implementatiedetails

- Gebouwd met React.js
- Gebruikt de HTML5 Geolocation API voor locatiebepaling
- Gebruikt de Web Audio API voor opnames
- Maakt gebruik van localStorage voor gegevensopslag
- Weer-informatie wordt opgehaald via OpenWeatherMap API

## Links

<!-- Verwijder de podcastlink hier --> 