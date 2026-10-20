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
- Tutte le 30 opere visibili subito, con filtri per categoria.
- Opere intere in apertura, senza ingrandimento automatico.
- Sala di osservazione con zoom, trascinamento, fondo chiaro/scuro e navigazione fra opere.
- Preferite e preferenze conservate sul dispositivo, senza registrazione.
- Modulo contatti con miniature e titoli delle opere selezionate.
- Pannello contatti con indirizzo, orari, telefono, email, WhatsApp e social configurabili.
- Richiesta di visita su data e orario pubblicati, da confermare via email o WhatsApp.
- Testi ingrandibili e layout responsive.

## Personalizzazione

| File | Contenuto |
| --- | --- |
| `config.js` | Nome, recapiti, colori principali e catalogo |
| `index.html` | Marchio, testi e struttura della pagina |
| `style.css` | Aspetto, tipografia e layout |
| `app.js` | Filtri, preferite, visualizzatore e modulo |
| `assets/` | Immagini e risorse locali |

I recapiti, l’indirizzo e gli orari sono inizialmente `null`. Inserire in `config.js` i dati verificati della galleria. `visitSlots` contiene le date disponibili e i relativi orari (`"AAAA-MM-GG": ["10:00", "11:30"]`); il sito consente di richiedere soltanto uno di quegli orari e la galleria deve confermare la visita. Le azioni aprono le applicazioni del visitatore con i dati predisposti; nessun messaggio viene inviato automaticamente.

## Contenuti dimostrativi

Marchio, opere, tecniche e misure sono esempi. Il sito non è un inventario di opere realmente in vendita. Le immagini sono generate; i prompt sono documentati in [PROMPT-IMMAGINI.md](PROMPT-IMMAGINI.md). I font della prima versione, conservati fra gli asset con licenza OFL, non vengono caricati dall’allestimento corrente, che usa caratteri di sistema.

Il modulo non trasmette dati a un backend. Senza recapiti configurati prepara solo il riepilogo. Prima dell’uso commerciale sostituire i contenuti dimostrativi e predisporre i dati e l’informativa della galleria.

La guida completa è in [docs/GUIDA.md](docs/GUIDA.md). I metadati interni dell’hosting Sites e le credenziali non sono inclusi nella repository.

## GitHub Pages

La pubblicazione usa il ramo `main` e la cartella `/(root)`. `index.html`, JavaScript, CSS e `assets/` sono nella radice, pronti per essere pubblicati. `.nojekyll` mantiene il sito statico senza elaborazione Jekyll. I percorsi degli asset sono relativi, compatibili con `/forma/`.

## Vetrina dinamica

La testata mostra un’opera alla volta, intera e mai oltre la risoluzione del file, con il solo titolo sottostante. Le 30 opere ruotano in una sequenza unica ogni 3 secondi; dissolvenza e movimento sono progressivi. Comandi manuali e pausa sono sempre visibili; la sequenza si sospende durante l’interazione con le opere, con una finestra aperta, in una scheda nascosta o quando la testata esce dallo schermo. Se il dispositivo richiede movimento ridotto, l’avvio è manuale.
