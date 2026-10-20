# FORMA — Allestimento 03

Prototipo navigabile e personalizzabile per una galleria che accompagna il visitatore dalla scoperta delle opere a una richiesta di contatto.

## Direzione del progetto

Un allestimento centrato sulle opere: sans serif Helvetica/Arial di sistema, fondo neutro, indice numerato, dettagli pittorici a tutta larghezza e catalogo asimmetrico. Tipografia essenziale, fondi neutri e comandi espliciti. Contatto e selezione restano espliciti, senza account.

La pagina iniziale mostra l’opera intera, senza ritaglio ingrandito. Le dimensioni iniziali sono limitate alla risoluzione nativa del pannello: non si allarga un dettaglio da 512 pixel sull’intera larghezza dello schermo. «Osserva l’opera» apre la sala a tutta pagina. + e − portano lo zoom volontario dal 100% al 300%; trascinamento e ripristino esplorano il dettaglio. Il fondo è commutabile e si può passare fra tutte le 30 opere, anche con le frecce della tastiera. Escape chiude la sala.

Il catalogo comprende 30 opere: 10 Astratto, 10 Geometrico e 10 Paesaggio. Tutte le schede sono mostrate subito; i filtri di categoria mostrano i 10 lavori corrispondenti. La testata mette in evidenza una sola opera alla volta, intera e con il solo titolo. Le 30 opere scorrono in sequenza unica ogni 3 secondi con una transizione graduale, pausa e comandi manuali. Ogni opera è cliccabile e mantiene il proprio collegamento alla sala di osservazione.

L’elemento distintivo è il percorso guidato: stile, budget indicativo e occasione. Il sito suggerisce opere secondo gli stili selezionati e trasferisce tutte le preferenze al riepilogo di contatto. Budget e occasione sono informazioni per la galleria: non esiste un motore di valutazione economica.

## Funzioni realizzate

- Catalogo di 30 opere dimostrative tutte visibili all’apertura, filtri con conteggi e sala di osservazione con zoom, trascinamento e navigazione fra opere.
- Preferite conservate nel browser del dispositivo.
- Percorso di preferenze in tre passaggi, modificabile.
- Modulo di contatto con recapito email, telefono, WhatsApp o profilo Facebook. La scelta WhatsApp richiede il numero del visitatore e compare nel riepilogo.
- Pannello «Contatti» separato dalla schermata «Informazioni e appuntamenti», con sei collegamenti SVG per indirizzo, orari, telefono, email, WhatsApp e social.
- Richieste di visita limitate alle date e agli orari pubblicati nella configurazione, da confermare manualmente dalla galleria via email o WhatsApp.
- Riepilogo della richiesta, copia negli appunti e download in formato testo.
- Pulsante per ingrandire i testi; navigazione da tastiera e finestre con focus gestito.
- Layout mobile con contatto e preferite sempre disponibili.
- Immagini locali e caratteri di sistema. Nessuna richiesta a servizi di font e nessun servizio di tracciamento aggiunto.

## Cosa è dimostrativo

Forma è un marchio di esempio. Opere, dimensioni, tecniche e ambienti sono dimostrativi, non un inventario commerciale. Le immagini sono state generate con IA e non provengono dalle gallerie di riferimento.

Il modulo NON invia messaggi e NON memorizza i dati di contatto. Senza recapiti configurati prepara soltanto un testo che il visitatore può copiare o scaricare. Non viene mostrata una falsa conferma d’invio. Le date e gli orari sono una lista configurata dalla galleria, non un calendario condiviso in tempo reale: la richiesta non blocca uno slot e la visita si considera fissata solo dopo la risposta della galleria. Non sono implementati backend, CRM, newsletter, pagamenti o prenotazioni confermate automaticamente.

## Personalizzazione

Aprire `config.js`:

```js
window.FORMA_CONFIG = {
  name: 'Nome galleria',
  email: 'info@dominio-della-galleria.it',
  phone: '+39 numero-verificato',
  address: 'indirizzo completo verificato',
  openingHours: 'giorni e orari verificati',
  facebook: 'https://www.facebook.com/pagina-verificata/',
  instagram: null,
  x: null,
  whatsapp: null, // Inserire il numero WhatsApp verificato della galleria, con prefisso internazionale
  visitSlots: { 'AAAA-MM-GG': ['10:00', '11:30'] },
  accent: '#20201e',
  artworks: [ /* schede delle opere */ ]
};
```

Gli esempi di recapiti sopra non sono recapiti utilizzabili: inserire quelli verificati del cliente. `visitSlots` accetta solo date future nel formato `AAAA-MM-GG`, associate a orari `HH:MM`; l’elenco va aggiornato dalla galleria. Il modulo genera una richiesta e apre l’email o WhatsApp del visitatore, ma la galleria deve confermare e mantenere aggiornata la disponibilità. Il campo `name` aggiorna i riepiloghi di contatto; per il marchio, i titoli della pagina e i testi editoriali modificare `index.html`. `accent` aggiorna il colore principale; gli altri colori e le dimensioni si trovano nelle variabili e nelle regole di `style.css`.

Inserendo un’email compare «Apri la tua email». Il telefono abilita il collegamento per chiamare e il link Facebook apre la pagina o Messenger. Il campo `whatsapp` deve contenere il numero verificato della galleria in formato internazionale: se il visitatore seleziona WhatsApp, nel riepilogo compare «Apri WhatsApp» con il messaggio precompilato. Senza un numero configurato, la demo prepara soltanto il riepilogo copiabile. L’invio finale resta sempre un’azione del visitatore nella sua applicazione; nessun messaggio viene inviato automaticamente.

Le prime tre opere usano `collection.jpg` con `panel: 0`, `1`, `2`. Le 18 opere quadrate usano tre atlanti da 1536 × 1024 pixel, uno per categoria, con sei pannelli quadrati da 512 × 512 ciascuno. I metadati `image` definiscono sorgente, coordinate e dimensioni. `image()` usa viewport e maschera SVG per isolare il pannello senza modificare i file; non si tratta di varianti dello stesso dipinto. I nove verticali aggiuntivi sono immagini singole in `assets/verticali/`, con metadati che descrivono l’intera immagine. Per un catalogo commerciale sostituire gli asset con fotografie delle opere.

Per una messa online commerciale: sostituire il catalogo, inserire identità e recapiti del cliente, orari e indirizzo, predisporre l’informativa privacy appropriata e collegare un backend solo se si desidera ricevere richieste direttamente dal sito.

## Aprire e trasferire il sito

Il sito è HTML/CSS/JavaScript statico: nessuna installazione o compilazione. Aprire `index.html` per una consultazione locale oppure servire la radice della repository su un hosting statico. Per clipboard e comportamento di archiviazione più uniforme, usare HTTP locale o HTTPS.

La repository GitHub esclude la cartella `.openai`, che contiene i metadati interni della pubblicazione Sites. Per distribuire il sito è sufficiente la radice della repository. Non sono presenti chiavi API o credenziali applicative.

## Verifiche effettuate

- Sintassi JavaScript verificata con `node --check`.
- Browser desktop: 30 schede iniziali; filtri per ciascuna delle tre categorie.
- Scheda della ventunesima opera e ritaglio corretto dell’ultimo pannello del nuovo atlante Paesaggio.
- Modulo WhatsApp con numero dedicato e riepilogo che conserva canale e recapito.
- Percorso sala di osservazione → salvataggio → contatto con l’opera scelta.
- Zoom al 150%, trascinamento verificato, ripristino, cambio fondo e navigazione alla prossima opera.
- Ritaglio SVG controllato per evitare la comparsa di pannelli adiacenti nella vista completa.
- Tutti e tre i passaggi delle preferenze e suggerimento coerente con lo stile.
- Percorso mobile preferenze → contatto Facebook → riepilogo con opera salvata e preferenze compilate.
- Layout a 390 e 320 px, anche con testi ingranditi, senza overflow orizzontale osservato.
- Immagini caricate; nessun errore o avviso nella console del browser durante il controllo finale.
- Dati di prova rimossi tramite i comandi della demo prima della consegna.

Non è stata svolta una sessione di usabilità con persone del target, né una certificazione di accessibilità. Il prototipo è una base concreta per questi passaggi.

## Asset e licenze

Asset attivi: `assets/collection.jpg`, `astratto-v3.jpg`, `geometrico-v3.jpg` e `paesaggio-v3.jpg`. I tre nuovi atlanti sono stati creati con lo strumento integrato Imagegen; i prompt completi sono in `PROMPT-IMMAGINI.md`. Il footer contiene esattamente la dicitura richiesta: «Fac simile · Opere dimostrative generate con ImageGen 2.5». `gallery.jpg` e i vecchi font con relative licenze restano conservati ma non vengono caricati dalla pagina.

Riferimenti esaminati: [Vistamare](https://vistamare.com/), [ZERO…](https://galleriazero.it/), [Cantadora](https://www.cantadora.it/) e [Radar](https://www.galleriaradar.it/). Il testo della pagina Radar non era disponibile nell’estrazione consultata. Il prototipo adotta una direzione originale, senza riprodurre contenuti o identità delle gallerie.


## Anteprime nel modulo contatti

Le opere incluse nella richiesta compaiono con miniatura intera e titolo, in due colonne su desktop e una su telefono. Il contatto diretto dalla scheda mostra l’opera corrente; il contatto generale mostra le opere salvate. Il riepilogo testuale mantiene i titoli per copia, download e condivisione.

## Aggiornamento vetrina: una sola opera

30 opere complessive, 10 per categoria. La vetrina mostra un’opera intera alla volta, con didascalia per il solo titolo, e avanza ogni tre secondi. Le immagini verticali sono salvate in `assets/verticali/`; prompt in `PROMPT-IMMAGINI.md`.

Verifica aggiornata: 30 opere visibili all’apertura; passaggio automatico ogni tre secondi, pausa e comandi manuali; pannello contatti e schermata visite separati; date senza slot con invio disabilitato; layout mobile controllato a 390 px. La prenotazione effettiva resta subordinata ai dati della galleria e alla conferma manuale.
