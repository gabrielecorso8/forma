# FORMA — Galleria d’arte

Vetrina artistica minimale con 21 opere dimostrative, preferenze personali e contatto guidato. HTML, CSS e JavaScript statici, senza dipendenze o compilazione.

## Avvio locale

Con Python 3 installato, dalla cartella della repository:

```sh
python -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Aprire **http://127.0.0.1:8080**. In alternativa, pubblicare il contenuto di `dist/` su un hosting statico. È possibile anche aprire `dist/index.html` direttamente; clipboard e memoria locale funzionano più uniformemente su HTTP locale o HTTPS.

## Funzioni

- 21 opere: 7 Astratto, 7 Geometrico e 7 Paesaggio.
- Filtri con conteggi e caricamento progressivo del catalogo.
- Opere intere in apertura, senza ingrandimento automatico.
- Sala di osservazione con zoom, trascinamento, fondo chiaro/scuro e navigazione fra opere.
- Preferite e preferenze conservate sul dispositivo, senza registrazione.
- Modulo contatti con miniature e titoli delle opere selezionate.
- Canali Email, Telefono, WhatsApp e Facebook; riepilogo copiabile o scaricabile.
- Testi ingrandibili e layout responsive.

## Personalizzazione

| File | Contenuto |
| --- | --- |
| `dist/config.js` | Nome, recapiti, colori principali e catalogo |
| `dist/index.html` | Marchio, testi e struttura della pagina |
| `dist/style.css` | Aspetto, tipografia e layout |
| `dist/app.js` | Filtri, preferite, visualizzatore e modulo |
| `dist/assets/` | Immagini e risorse locali |

I recapiti sono inizialmente `null`. Configurare quelli verificati della galleria per abilitare email, telefono, Facebook e WhatsApp. Le azioni aprono le applicazioni del visitatore con i dati predisposti; nessun messaggio viene inviato automaticamente.

## Contenuti dimostrativi

Marchio, opere, tecniche e misure sono esempi. Il sito non è un inventario di opere realmente in vendita. Le immagini sono generate; i prompt sono documentati in [PROMPT-IMMAGINI.md](PROMPT-IMMAGINI.md). I font della prima versione, conservati fra gli asset con licenza OFL, non vengono caricati dall’allestimento corrente, che usa caratteri di sistema.

Il modulo non trasmette dati a un backend. Senza recapiti configurati prepara solo il riepilogo. Prima dell’uso commerciale sostituire i contenuti dimostrativi e predisporre i dati e l’informativa della galleria.

La guida completa è in [docs/GUIDA.md](docs/GUIDA.md). I metadati interni dell’hosting Sites e le credenziali non sono inclusi nella repository.
