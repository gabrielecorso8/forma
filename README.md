# FORMA — Galleria d’arte

[Sito su GitHub Pages](https://gabrielecorso8.github.io/forma/)

Vetrina artistica minimale con 30 opere dimostrative, preferenze personali e contatto guidato. HTML, CSS e JavaScript statici, senza dipendenze o compilazione.

## Avvio locale

Con Python 3 installato, dalla cartella della repository:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Aprire **http://127.0.0.1:8080**. In alternativa, pubblicare i file della repository su un hosting statico. È possibile anche aprire `index.html` direttamente; clipboard e memoria locale funzionano più uniformemente su HTTP locale o HTTPS.

## Funzioni

- 30 opere: 10 Astratto, 10 Geometrico e 10 Paesaggio.
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
| `config.js` | Nome, recapiti, colori principali e catalogo |
| `index.html` | Marchio, testi e struttura della pagina |
| `style.css` | Aspetto, tipografia e layout |
| `app.js` | Filtri, preferite, visualizzatore e modulo |
| `assets/` | Immagini e risorse locali |

I recapiti sono inizialmente `null`. Configurare quelli verificati della galleria per abilitare email, telefono, Facebook e WhatsApp. Le azioni aprono le applicazioni del visitatore con i dati predisposti; nessun messaggio viene inviato automaticamente.

## Contenuti dimostrativi

Marchio, opere, tecniche e misure sono esempi. Il sito non è un inventario di opere realmente in vendita. Le immagini sono generate; i prompt sono documentati in [PROMPT-IMMAGINI.md](PROMPT-IMMAGINI.md). I font della prima versione, conservati fra gli asset con licenza OFL, non vengono caricati dall’allestimento corrente, che usa caratteri di sistema.

Il modulo non trasmette dati a un backend. Senza recapiti configurati prepara solo il riepilogo. Prima dell’uso commerciale sostituire i contenuti dimostrativi e predisporre i dati e l’informativa della galleria.

La guida completa è in [docs/GUIDA.md](docs/GUIDA.md). I metadati interni dell’hosting Sites e le credenziali non sono inclusi nella repository.

## GitHub Pages

La pubblicazione usa il ramo `main` e la cartella `/(root)`. `index.html`, JavaScript, CSS e `assets/` sono nella radice, pronti per essere pubblicati. `.nojekyll` mantiene il sito statico senza elaborazione Jekyll. I percorsi degli asset sono relativi, compatibili con `/forma/`.

## Vetrina dinamica

La testata mostra un quadrato a sinistra e un verticale a destra. I diciotto quadrati e i dodici verticali ruotano su cicli indipendenti: i verticali continuano la propria sequenza anche quando ricomincia quella dei quadrati. Nelle didascalie compare solo il titolo. Nove verticali nuovi, tre per categoria, ampliano la selezione. Ogni opera ha una variazione leggera di entrata. La sequenza cambia il verticale dopo 5 secondi, poi alterna le due opere ogni 3 secondi. Comandi manuali e pausa sono sempre visibili; la sequenza si sospende durante l’interazione con le opere, con una finestra aperta, in una scheda nascosta o quando la testata esce dallo schermo. Se il dispositivo richiede movimento ridotto, l’avvio è manuale.
