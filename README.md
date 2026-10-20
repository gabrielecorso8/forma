# FORMA — Galleria d’arte

[Sito su GitHub Pages](https://gabrielecorso8.github.io/forma/)

Sito statico bilingue IT/EN per una galleria: 30 opere dimostrative, sei artisti immaginari, eventi e contatto diretto. HTML, CSS e JavaScript senza dipendenze di esecuzione o compilazione.

## Avvio locale

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Aprire http://127.0.0.1:8080. La pubblicazione GitHub Pages usa il ramo `main`, cartella `/(root)`, con `.nojekyll` e percorsi relativi compatibili con `/forma/`.

## Esperienza

- Collage di dieci opere: sei quadrate e quattro verticali, distribuite fra loro in due fasce su desktop e tre su mobile. I rapporti originali 1:1 e 2:3 restano invariati, senza fughe o sovrapposizioni fra gli slot.
- Gruppi casuali di due, tre o quattro dissolvenze simultanee, ciascuna di 3,6 secondi, avviate subito. Alla conclusione parte direttamente un nuovo gruppo su slot diversi. Le immagini vengono scelte solo fra quelle dello stesso formato e non presenti negli altri slot.
- Pausa esplicita, sospensione con scheda nascosta, collage fuori schermo o finestra aperta. Rispetto del movimento ridotto del dispositivo.
- Eventi fra collage e opere: copertine, date, orari, accesso, dettagli e richiesta di informazioni; scorrimento tramite frecce, tastiera o gesto touch.
- Astratto, Geometrico e Paesaggio: due opere iniziali per categoria, espansione indipendente di due in due fino a dieci, con possibilità di richiudere.
- Artisti con percorsi dedicati all’indirizzo `#artisti/identificativo` e cinque opere ciascuno. I collegamenti funzionano anche dopo un ricaricamento diretto.
- Selezione personale con miniature, titolo e artista. I salvataggi rimangono sul dispositivo.
- Sala di osservazione con zoom, trascinamento, fondo chiaro/scuro e navigazione fra opere; nel percorso artista naviga soltanto fra le sue opere.
- Presentazione della galleria fisica e collegamento Informazioni e appuntamenti nel blocco Contatti.
- Lingua IT/EN per navigazione, contenuti, schede, artisti, eventi e moduli. Preferenza lingua e ingrandimento testi salvati sul dispositivo.

## Personalizzazione

Tutti i dati editoriali sono in `config.js`:

| Campo | Uso |
| --- | --- |
| `artworks` | Titolo, titolo inglese, descrizioni IT/EN, tecnica, misure, immagine e `artistId` |
| `featuredWorkIds` | I due ID da mostrare per primi in ogni categoria |
| `artists` | Nome, pratica, biografia bilingue, tre tappe del percorso e opera di copertina |
| `events` | Titolo, tipo, descrizione e accesso bilingui; data, eventuale fine, orario e due opere di copertina |
| `email`, `phone`, `whatsapp` | Recapiti verificati della galleria |
| `address`, `openingHours` | Sede della collezione e orari |
| `facebook`, `instagram`, `x` | URL dei profili ufficiali |
| `visitSlots` | Date e orari richiedibili, ad esempio `"2026-12-03": ["10:00", "11:30"]` |

`featuredWorkIds` usa le chiavi `Astratto`, `Geometrico`, `Paesaggio`. Gli ID indicati devono appartenere alla categoria corrispondente. Le altre opere seguono nell’ordine del catalogo.

Le schede degli artisti ricavano le opere dal relativo `artistId`, quindi non serve mantenere una seconda lista. Per cambiare le traduzioni dell’interfaccia modificare le coppie `tr(italiano, inglese)` in `app.js`.

## Contatti e visite

I recapiti reali sono ancora da inserire. Le date disponibili vengono lette da `visitSlots`; il sito esclude giorni privi di slot e orari già trascorsi. Con calendario vuoto propone di concordare una visita tramite contatto. La richiesta non prenota automaticamente né blocca lo slot: la galleria deve confermarlo via email o WhatsApp.

I moduli non inviano dati a un backend. Il visitatore controlla un riepilogo e sceglie di aprire email o WhatsApp; può anche copiarlo o scaricarlo. Nessun messaggio parte automaticamente. La selezione delle opere viene accompagnata da miniature, titoli e nomi degli artisti.

## Contenuti dimostrativi

Opere, artisti, eventi, date e immagine della galleria sono esempi. Il sito non rappresenta un inventario o un programma reale. Le opere sono generate con ImageGen 2.5; i prompt delle immagini sono in [PROMPT-IMMAGINI.md](PROMPT-IMMAGINI.md). Gli artisti sono immaginari e gli eventi sono indicati come dimostrativi nell’interfaccia. Per l’uso commerciale inserire dati verificati e informativa privacy appropriata.

## Verifica

Controllati sul browser: griglia a 1440, 390 e 320 px; rapporti dei dieci slot, copertura e assenza di sovrapposizioni; gruppi di 2–4 dissolvenze simultanee, pausa e ripresa, senza interruzioni fra i gruppi; espansione 2/4/6/8/10; salvataggi e persistenza; percorsi artista e ricaricamento; cambio lingua; carosello eventi; riepilogo richieste; calendario configurato e vuoto; 320 px con testi ingranditi e movimento ridotto. Nessun errore JavaScript durante questi controlli.
