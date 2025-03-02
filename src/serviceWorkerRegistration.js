// Dit optionele code is gebruikt om service-workers te registreren.
// register() wordt niet standaard aangeroepen.

// Dit laat de app sneller laden bij volgende bezoeken in productie, en geeft
// offline mogelijkheden. Echter, het betekent ook dat ontwikkelaars (en gebruikers)
// alleen updates zullen zien nadat alle tabs voor de pagina zijn gesloten, omdat eerder
// in de cache opgeslagen bronnen worden gebruikt tot ze niet meer geldig zijn.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is het IPv6 localhost adres.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 zijn beschouwd als localhost voor IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // De URL constructor is beschikbaar in alle browsers die service workers ondersteunen.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Onze service worker zal niet werken als PUBLIC_URL op een andere oorsprong
      // is dan onze pagina. Dit kan gebeuren als een CDN wordt gebruikt om activa te serveren;
      // Zie https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Dit wordt uitgevoerd op localhost. Laten we kijken of een service worker nog steeds bestaat of niet.
        checkValidServiceWorker(swUrl, config);

        // Voeg wat extra logging toe aan localhost, wijzend ontwikkelaars naar de
        // service worker/PWA documentatie.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Deze web-app wordt actief bediend door een service ' +
              'worker. Om meer te leren, bezoek https://cra.link/PWA'
          );
        });
      } else {
        // Is geen localhost. Registreer gewoon service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Op dit punt is de oude content verwijderd en
              // de nieuwe content is toegevoegd aan de cache.
              console.log(
                'Nieuwe content is beschikbaar en zal worden gebruikt ' +
                  'wanneer alle tabs voor deze pagina zijn gesloten.'
              );

              // Toon een update notificatie aan de gebruiker
              showUpdateNotification();

              // Callback uitvoeren
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Op dit punt is alles gecachet.
              console.log('Content is gecached voor offline gebruik.');

              // Callback uitvoeren
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Fout tijdens registratie van service worker:', error);
    });
}

// Functie om een update notificatie te tonen
function showUpdateNotification() {
  // Creëer een eenvoudige notificatie element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.left = '20px';
  notification.style.right = '20px';
  notification.style.padding = '12px 16px';
  notification.style.background = '#4CAF50';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  notification.style.display = 'flex';
  notification.style.justifyContent = 'space-between';
  notification.style.alignItems = 'center';
  notification.style.zIndex = '9999';
  notification.style.fontFamily = 'Arial, sans-serif';

  // Notificatie tekst
  const message = document.createElement('div');
  message.textContent = 'Er is een nieuwe versie beschikbaar. Vernieuw de pagina om de update te laden.';
  notification.appendChild(message);

  // Vernieuw knop
  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Vernieuwen';
  refreshButton.style.background = 'white';
  refreshButton.style.color = '#4CAF50';
  refreshButton.style.border = 'none';
  refreshButton.style.padding = '8px 12px';
  refreshButton.style.borderRadius = '4px';
  refreshButton.style.cursor = 'pointer';
  refreshButton.style.marginLeft = '16px';
  refreshButton.style.fontWeight = 'bold';
  refreshButton.onclick = () => {
    window.location.reload();
  };
  notification.appendChild(refreshButton);

  // Sluit knop
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Later';
  closeButton.style.background = 'transparent';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.padding = '8px 12px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.marginLeft = '8px';
  closeButton.onclick = () => {
    document.body.removeChild(notification);
  };
  notification.appendChild(closeButton);

  // Voeg de notificatie toe aan de pagina
  document.body.appendChild(notification);
}

function checkValidServiceWorker(swUrl, config) {
  // Controleer of de service worker kan worden gevonden. Als het niet kan, laad de pagina opnieuw.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Zorg ervoor dat de service worker bestaat, en dat we echt een JS-bestand krijgen.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Geen service worker gevonden. Waarschijnlijk een andere app. Herlaad de pagina.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker gevonden. Ga verder zoals normaal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Geen internetverbinding gevonden. App draait in offline modus.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
} 