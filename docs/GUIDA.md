# Guida FORMA

La documentazione corrente è nel [README](../README.md), incluse personalizzazione, contatti, visite e verifica.

## Scegliere le prime due opere di ogni collezione

In `config.js` modificare `featuredWorkIds`. Esempio:

```js
"featuredWorkIds": {
  "Astratto": ["forma-04", "forma-22"],
  "Geometrico": ["forma-05", "forma-23"],
  "Paesaggio": ["forma-06", "forma-24"]
}
```

Ogni categoria mostra inizialmente le due opere scelte, poi aggiunge due opere alla volta fino alle dieci disponibili. Per tornare alla selezione iniziale usare Mostra meno.

## Artisti

Ogni opera contiene `artistId`. Un artista in `artists` contiene `id`, `name`, `category`, `practice`, `bio`, `coverWorkId` e `journey`. I campi bilingui hanno forma `{"it":"Testo italiano","en":"English text"}`. Il percorso è raggiungibile da `#artisti/id`, senza pagine HTML aggiuntive e senza regole di riscrittura del server.

## Eventi

Ogni evento contiene un `id` univoco, `title`, `kind`, `description`, `admission`, `date` in formato AAAA-MM-GG, `endDate` opzionale, `time` e `coverWorkIds`. Le due opere di copertina sono selezionate dal catalogo. La scheda mostra le informazioni di accesso e la sede configurata della collezione. Gli esempi iniziali devono essere sostituiti con il programma reale.

## Recapiti e calendario

Inserire email, telefono, WhatsApp con prefisso internazionale, indirizzo, orari e URL social reali. Le visite sono richieste da confermare: `visitSlots` contiene le date e gli orari pubblicati e non è sincronizzato con un calendario esterno. Aggiornare manualmente gli slot quando non sono più disponibili.

```js
"visitSlots": {
  "2026-12-03": ["10:00", "11:30"],
  "2026-12-04": ["15:00", "16:30"]
}
```

Senza date attive viene proposto un contatto per concordare la visita. Senza recapiti configurati il riepilogo è soltanto copiabile o scaricabile. La galleria deve rispondere per confermare l’appuntamento.

## Immagini

Le immagini del catalogo possono essere file singoli o porzioni di una tavola. Il campo `image` indica `src`, coordinate `x`/`y`, `width`/`height` della porzione e `sheetWidth`/`sheetHeight` del file. Il collage usa solo opere esattamente quadrate e verticali 2:3 per mantenere le proporzioni degli slot. Le altre proporzioni rimangono disponibili nel catalogo e nei percorsi artista.

## Pubblicazione

Commettere i file aggiornati e inviarli al ramo `main`. GitHub Pages pubblica la radice della repository. Attendere il completamento del deployment; i parametri di versione dei CSS e degli script in `index.html` vanno aggiornati quando si modifica il codice, per evitare cache obsolete.
