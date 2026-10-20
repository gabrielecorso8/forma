(() => {
  'use strict';
  const config = window.FORMA_CONFIG;
  const works = config.artworks;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const persist = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Browsing remains available without storage. */ } };
  const initial = read('forma-saved');
  let saved = new Set(Array.isArray(initial) ? initial.filter(id => works.some(w => w.id === id)) : []);
  let preferences = read('forma-preferences');
  if (!preferences || !Array.isArray(preferences.styles)) preferences = null;
  const styleOptions = ['Astratto', 'Geometrico', 'Paesaggio', 'Mi lascio consigliare'];
  const budgetOptions = ['Fino a 1.000 €', '1.000–3.000 €', 'Oltre 3.000 €', 'Ne parliamo insieme'];
  const intentOptions = ['Per la mia casa', 'Per la mia collezione', 'Per un regalo', 'Per il piacere di scoprire'];
  if (preferences) preferences = {styles: preferences.styles.filter(s => styleOptions.includes(s)), budget: budgetOptions.includes(preferences.budget) ? preferences.budget : '', intent: intentOptions.includes(preferences.intent) ? preferences.intent : ''};
  let visibleLimit = works.length;
  let filter = 'all', quizStep = 0, draft, requestText = '', toastTimer;
  const dialog = $('#dialog'), body = $('#dialog-body');
  let imageSerial = 0;
  const image = (w, fit = 'slice') => {
    const clip = 'art-clip-' + (++imageSerial);
    const a = w.image || {src:'assets/collection.jpg',x:w.panel*512,y:0,width:512,height:1024,sheetWidth:1536,sheetHeight:1024};
    return `<svg class="artwork" viewBox="${a.x} ${a.y} ${a.width} ${a.height}" preserveAspectRatio="xMidYMid ${fit}" style="--native-width:${a.width}px;--native-height:${a.height}px" role="img" aria-label="${esc(w.title)}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${clip}" clipPathUnits="userSpaceOnUse"><rect x="${a.x}" y="${a.y}" width="${a.width}" height="${a.height}" fill="white" stroke="none"/></clipPath></defs><image href="${esc(a.src)}" width="${a.sheetWidth}" height="${a.sheetHeight}" clip-path="url(#${clip})" /></svg>`;
  };
  const saveButton = w => `<button class="save" data-save="${esc(w.id)}" aria-pressed="${saved.has(w.id)}" aria-label="${saved.has(w.id) ? 'Rimuovi' : 'Salva'} ${esc(w.title)} ${saved.has(w.id) ? 'dalle' : 'tra le'} preferite">${icon('heart')}<span>${saved.has(w.id) ? 'Salvata' : 'Salva'}</span></button>`;
  let viewState = { index: 0, zoom: 1, x: 0, y: 0, dark: false };
  const showcase = $('#inizio');
  const showcaseGrid = $('.showcase-grid');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const aspectOf = w => w.image ? w.image.width / w.image.height : 0.5;
  const showcaseWorks = works;
  const sceneCount = showcaseWorks.length;
  const cycleIndex = (index, length) => ((index % length) + length) % length;
  let showcaseIndex = 0, showcaseTimer = null, showcaseChanging = false;
  const showcaseInterval = 3000;
  let showcasePlaying = !reducedMotion.matches, showcaseVisible = true, showcaseHovered = false;
  function canShowcaseAdvance() {
    return showcasePlaying && showcaseVisible && !showcaseHovered && !document.hidden && !dialog.open && !showcaseGrid.contains(document.activeElement) && sceneCount>1;
  }
  function scheduleShowcase() {
    clearTimeout(showcaseTimer);
    showcaseTimer = null;
    if(canShowcaseAdvance()) showcaseTimer = setTimeout(()=>moveShowcase(1,true),showcaseInterval);
  }
  function showcaseWork(w) {
    const n = works.indexOf(w);
    const motion = `--entry-duration:${reducedMotion.matches ? 0 : 1100}ms;--entry-hue:${(n%5)-2}`;
    return `<figure class="showcase-work" style="${motion}"><button data-detail="${esc(w.id)}" aria-label="Osserva ${esc(w.title)}"><span class="showcase-picture">${image(w,'meet')}</span><span class="showcase-work-caption"><strong>${esc(w.title)}</strong><span class="showcase-open-mark" aria-hidden="true">${icon('external-arrow')}</span></span></button></figure>`;
  }
  function renderShowcase(manual=false) {
    const current = showcaseWorks[cycleIndex(showcaseIndex, sceneCount)];
    $('#showcase-pair').innerHTML = current ? showcaseWork(current) : '';
    const position = cycleIndex(showcaseIndex, sceneCount) + 1;
    $('#showcase-count').textContent = `${String(position).padStart(2,'0')} / ${String(sceneCount).padStart(2,'0')}`;
    $('#showcase-count').setAttribute('aria-label',`Esposizione ${position} di ${sceneCount}`);
    if(manual) $('#showcase-announcement').textContent = current?.title || '';
    showcaseGrid.classList.remove('is-changing');
    showcaseChanging = false;
    scheduleShowcase();
  }
  function moveShowcase(direction,automatic=false) {
    if(showcaseChanging || (automatic && !canShowcaseAdvance())) return;
    clearTimeout(showcaseTimer);
    showcaseChanging = true;
    showcaseGrid.classList.add('is-changing');
    setTimeout(()=>{
      showcaseIndex+=direction;
      renderShowcase(!automatic);
    },reducedMotion.matches?0:420);
  }
  function updateShowcasePlayback() {
    $('#showcase-play-label').textContent = showcasePlaying ? 'Pausa' : 'Riprendi';
    $('#showcase-play-icon').textContent = showcasePlaying ? 'Ⅱ' : '▷';
    $('[data-showcase="toggle"]').setAttribute('aria-label',showcasePlaying?'Metti in pausa lo scorrimento automatico':'Avvia lo scorrimento automatico');
    scheduleShowcase();
  }
  function startShowcase() {
    updateShowcasePlayback();renderShowcase();
    showcaseGrid.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){showcaseHovered=true;scheduleShowcase();}});
    showcaseGrid.addEventListener('pointerleave',()=>{showcaseHovered=false;scheduleShowcase();});
    showcaseGrid.addEventListener('focusin',scheduleShowcase);
    showcaseGrid.addEventListener('focusout',()=>queueMicrotask(scheduleShowcase));
    document.addEventListener('visibilitychange',scheduleShowcase);
    dialog.addEventListener('close',scheduleShowcase);
    reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)showcasePlaying=false;updateShowcasePlayback();});
    if('IntersectionObserver' in window) new IntersectionObserver(entries=>{showcaseVisible=entries[0].isIntersecting;scheduleShowcase();},{threshold:0}).observe(showcase);
  }
  function notify(message) { $('.toast').textContent = message; $('.toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 3000); }
  function updateCounts() { $$('.count').forEach(el => el.textContent = saved.size); }
  function renderWorks() {
    const matched = works.filter(w => filter === 'all' || w.category === filter);
    const visible = matched.slice(0,visibleLimit);
    $('#art-grid').dataset.filtered = filter !== 'all';
    $('#art-grid').innerHTML = visible.map(w => `<article class="art-card${aspectOf(w) >= 0.8 ? ' square-work' : ' portrait-work'}"><button class="art-img" data-detail="${esc(w.id)}" aria-label="Osserva ${esc(w.title)}">${image(w)}</button><div class="card-top"><div><p class="card-category">${String(works.indexOf(w) + 1).padStart(2,'0')} / ${esc(w.category)}</p><h3><button class="title-button" data-detail="${esc(w.id)}">${esc(w.title)}</button></h3></div>${saveButton(w)}</div><p class="card-details">${esc(w.medium)}<br>${esc(w.size)}</p><button class="detail-link" data-detail="${esc(w.id)}">Osserva l’opera ${icon('arrow')}</button></article>`).join('');
    $('#results-count').textContent = `${matched.length} ${matched.length === 1 ? 'opera' : 'opere'}`;
    $('#catalog-progress').textContent = `Mostrate ${visible.length} di ${matched.length} opere`;
    const more = $('[data-action="more-works"]');
    more.hidden = visible.length >= matched.length;
    more.textContent = `Mostra altre opere (${matched.length-visible.length})`;
    $$('.filter').forEach(b=>{const category=b.dataset.filter;const count=category==='all'?works.length:works.filter(w=>w.category===category).length;b.textContent=`${category==='all'?'Tutte':category} (${count})`;});
  }
  function toggleSaved(id) {
    if (!works.some(w => w.id === id)) return;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    persist('forma-saved', [...saved]); updateCounts(); renderWorks();
    $$(`[data-save="${id}"]`, dialog).forEach(el => { el.setAttribute('aria-pressed', saved.has(id)); el.setAttribute('aria-label', `${saved.has(id) ? 'Rimuovi' : 'Salva'} ${works.find(w => w.id === id).title} ${saved.has(id) ? 'dalle' : 'tra le'} preferite`); });
    if (dialog.dataset.view === 'saved') renderSaved();
    notify(saved.has(id) ? 'Opera aggiunta alle tue preferite' : 'Opera rimossa dalle preferite');
  }
  function open(view, html) { clearTimeout(showcaseTimer); dialog.classList.toggle('viewer', view === 'detail'); dialog.dataset.view = view; body.innerHTML = html; if (!dialog.open) dialog.showModal(); const heading = $('#dialog-title'); if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({preventScroll:true}); } dialog.scrollTop = 0; }
  function detail(id) {
    const index = works.findIndex(w => w.id === id); if (index < 0) return;
    viewState = {index, zoom:1, x:0, y:0, dark:viewState.dark};
    renderViewer();
  }
  function renderViewer() {
    const w = works[viewState.index];
    open('detail', `<div class="viewer-top"><strong>FORMA</strong><span>Sala di osservazione / ${String(viewState.index+1).padStart(2,'0')}</span></div><div class="viewer-layout"><div class="viewer-image-area ${viewState.dark ? 'dark' : ''}"><div class="viewer-viewport" aria-label="Opera ingrandibile: usa i comandi sottostanti"><div class="viewer-canvas">${image(w,'meet')}</div></div><div class="viewer-controls"><div class="zoom-control"><button data-view="zoom-out" aria-label="Riduci ingrandimento" disabled>−</button><output id="zoom-output" aria-live="polite">100%</output><button data-view="zoom-in" aria-label="Ingrandisci opera">+</button></div><button data-view="reset">Ripristina</button><button data-view="background" aria-pressed="${viewState.dark}">Fondo ${viewState.dark ? 'chiaro' : 'scuro'}</button></div></div><div class="viewer-info"><p class="viewer-kicker modal-eyebrow">${String(viewState.index+1).padStart(2,'0')} / ${esc(w.category)}</p><h2 id="dialog-title">${esc(w.title)}</h2><p>${esc(w.medium)}<br>${esc(w.size)}</p><p class="viewer-description">${esc(w.description)}</p><p class="viewer-hint">Ingrandisci con +. Poi trascina l’immagine per esplorare i dettagli.</p><div class="modal-actions"><button class="button" data-inquire="${esc(w.id)}">Informazioni sull’opera ${icon('external-arrow')}</button><button class="button secondary" data-save="${esc(w.id)}" aria-pressed="${saved.has(w.id)}">${icon('heart')} ${saved.has(w.id) ? 'Salvata' : 'Salva l’opera'}</button></div><div class="viewer-nav"><button data-view="previous" aria-label="Opera precedente">←</button><span>${viewState.index+1} / ${works.length}</span><button data-view="next" aria-label="Opera successiva">→</button></div><p class="demo-note">Opera dimostrativa generata con IA.</p></div></div>`);
    setupPan();
  }
  function updateZoom() {
    const canvas = $('.viewer-canvas',dialog), viewport = $('.viewer-viewport',dialog);
    if (!canvas) return;
    const bounds = viewport.getBoundingClientRect();
    const maxX = bounds.width * (viewState.zoom-1)/2, maxY = bounds.height * (viewState.zoom-1)/2;
    viewState.x = Math.min(maxX,Math.max(-maxX,viewState.x));
    viewState.y = Math.min(maxY,Math.max(-maxY,viewState.y));
    canvas.style.setProperty('--zoom',viewState.zoom);
    canvas.style.setProperty('--pan-x',`${viewState.x}px`);
    canvas.style.setProperty('--pan-y',`${viewState.y}px`);
    viewport.classList.toggle('is-zoomed',viewState.zoom>1);
    $('#zoom-output').textContent = `${Math.round(viewState.zoom*100)}%`;
    $('[data-view="zoom-out"]').disabled = viewState.zoom<=1;
    $('[data-view="zoom-in"]').disabled = viewState.zoom>=3;
  }
  function setupPan() {
    const viewport = $('.viewer-viewport',dialog); let pointer = null;
    viewport.addEventListener('pointerdown',e=>{if(viewState.zoom<=1 || (e.pointerType==='mouse' && e.button!==0))return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,originX:viewState.x,originY:viewState.y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
    viewport.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;viewState.x=pointer.originX+e.clientX-pointer.x;viewState.y=pointer.originY+e.clientY-pointer.y;updateZoom();});
    const stop=()=>{pointer=null;viewport.classList.remove('dragging');};
    viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);viewport.addEventListener('lostpointercapture',stop);
  }
  function viewerAction(action) {
    if(action==='previous'||action==='next'){viewState.index=(viewState.index+(action==='next'?1:-1)+works.length)%works.length;viewState.zoom=1;viewState.x=0;viewState.y=0;renderViewer();}
    else if(action==='background'){viewState.dark=!viewState.dark;$('.viewer-image-area').classList.toggle('dark',viewState.dark);const b=$('[data-view="background"]');b.textContent=`Fondo ${viewState.dark?'chiaro':'scuro'}`;b.setAttribute('aria-pressed',viewState.dark);}
    else {if(action==='reset'){viewState.zoom=1;viewState.x=0;viewState.y=0;}else viewState.zoom=Math.min(3,Math.max(1,viewState.zoom+(action==='zoom-in'?.5:-.5)));updateZoom();}
  }
  function renderSaved() {
    const list = works.filter(w => saved.has(w.id));
    open('saved', `<p class="modal-eyebrow">LA TUA SELEZIONE</p><h2 id="dialog-title">Le tue preferite${list.length ? ` (${list.length})` : ''}</h2>${list.length ? `<p>Le opere salvate su questo dispositivo.</p>${list.map(w => `<div class="saved-item">${image(w)}<div><h3><button class="title-button" data-detail="${esc(w.id)}">${esc(w.title)}</button></h3><p>${esc(w.category)} · ${esc(w.size)}</p></div>${saveButton(w)}</div>`).join('')}<div class="modal-actions"><button class="button" data-action="contact">Informazioni sulle opere ${icon('arrow')}</button><button class="button secondary" data-action="browse">Continua a esplorare</button></div>` : `<div class="empty">${icon('heart')}<p>Non hai ancora salvato un’opera.<br>Tocca il cuore accanto a quelle che ti piacciono.</p><button class="button" data-action="browse">Scopri le opere ${icon('arrow')}</button></div>`}`);
  }
  function startQuiz() { quizStep = 0; draft = preferences ? { ...preferences, styles: [...preferences.styles] } : { styles: [], budget: '', intent: '' }; renderQuiz(); }
  function renderQuiz() {
    const questions = [
      { title: 'Quali stili ti interessano?', text: 'Puoi indicare più stili.', options: styleOptions, key: 'styles' },
      { title: 'Hai un budget in mente?', text: 'È solo un’indicazione. Puoi anche parlarne con noi.', options: budgetOptions, key: 'budget' },
      { title: 'Per quale occasione?', text: 'Indica la destinazione dell’opera.', options: intentOptions, key: 'intent' }
    ];
    const q = questions[quizStep];
    open('quiz', `<p class="modal-eyebrow">LE TUE PREFERENZE · ${quizStep + 1} DI 3</p><div class="quiz-progress" aria-hidden="true">${questions.map((_,i) => `<span class="${i <= quizStep ? 'done' : ''}"></span>`).join('')}</div><h2 id="dialog-title">${q.title}</h2><p>${q.text}</p><div class="choices" role="group" aria-label="${q.title}">${q.options.map(value => `<button class="choice" data-choice="${esc(value)}" data-key="${q.key}" aria-pressed="${q.key === 'styles' ? draft.styles.includes(value) : draft[q.key] === value}">${esc(value)}</button>`).join('')}</div><div class="quiz-footer"><button class="text-link" data-action="quiz-back">${quizStep ? '← Indietro' : 'Chiudi'}</button><button class="button" data-action="quiz-next" ${!(quizStep === 0 ? draft.styles.length : draft[q.key]) ? 'disabled' : ''}>${quizStep < 2 ? 'Continua' : 'Vedi la tua selezione'} ${icon('arrow')}</button></div>`);
  }
  function finishQuiz() {
    preferences = {...draft, styles:[...draft.styles]}; persist('forma-preferences', preferences);
    const recommended = works.filter(w => preferences.styles.includes(w.category));
    open('quiz-result', `<p class="modal-eyebrow">LE TUE PREFERENZE</p><h2 id="dialog-title">Opere selezionate.</h2><p>${recommended.length ? 'Abbiamo raccolto le opere degli stili che hai scelto.' : 'Ti proponiamo di iniziare esplorando tutti gli stili.'} Le preferenze saranno incluse nella richiesta.</p><div class="contact-summary"><strong>I tuoi interessi</strong><br>${esc(preferences.styles.join(', '))}<br>${esc(preferences.budget)} · ${esc(preferences.intent)}</div>${(recommended.length ? recommended : works).map(w => `<div class="saved-item">${image(w)}<div><h3><button class="title-button" data-detail="${esc(w.id)}">${esc(w.title)}</button></h3><p>${esc(w.category)}</p></div>${saveButton(w)}</div>`).join('')}<div class="modal-actions"><button class="button" data-action="contact">Prepara una richiesta ${icon('chat')}</button><button class="button secondary" data-action="quiz">Modifica preferenze</button></div><p class="demo-note">L’abbinamento usa gli stili selezionati. Il budget e l’occasione vengono inclusi nella richiesta per la galleria.</p>`);
  }
  function contact() {
    const address = String(config.address || '').trim();
    const hours = String(config.openingHours || '').trim();
    const phone = String(config.phone || '').trim();
    const email = String(config.email || '').trim();
    const whatsapp = String(config.whatsapp || '').replace(/[^0-9]/g,'');
    const mapUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
    const directLink = (href, symbol, title, detail) => href
      ? `<a class="contact-tile" href="${esc(href)}" ${href.startsWith('https:') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${icon(symbol)}<span><strong>${esc(title)}</strong><small>${esc(detail)}</small></span>${icon('external-arrow')}</a>`
      : `<div class="contact-tile is-unavailable" aria-disabled="true">${icon(symbol)}<span><strong>${esc(title)}</strong><small>${esc(detail || 'Dato da inserire')}</small></span></div>`;
    const socials = [['facebook','Facebook',config.facebook],['instagram','Instagram',config.instagram],['x','X',config.x]]
      .map(([symbol,label,url]) => /^https:\/\/(www\.)?(facebook\.com|instagram\.com|x\.com)\//.test(String(url || ''))
        ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon(symbol)}</a>`
        : `<span aria-label="${label} non configurato" title="${label}: dato da inserire">${icon(symbol)}</span>`).join('');
    open('contact-hub', `<p class="modal-eyebrow">CONTATTI</p><h2 id="dialog-title">La galleria, in modo diretto.</h2><p>Indirizzo, orari e canali di contatto.</p><div class="contact-grid">
      ${directLink(mapUrl,'location','Dove siamo',address || 'Indirizzo da inserire')}
      <button class="contact-tile" data-action="appointment">${icon('clock')}<span><strong>Orari e visite</strong><small>${esc(hours || 'Orari da inserire')} · Prenota una visita</small></span>${icon('external-arrow')}</button>
      ${directLink(phone ? `tel:${phone.replace(/[^+\d]/g,'')}` : '', 'phone','Telefono',phone || 'Numero da inserire')}
      ${directLink(email ? `mailto:${email}` : '', 'mail','Email',email || 'Indirizzo da inserire')}
      ${directLink(/^[1-9][0-9]{7,14}$/.test(whatsapp) ? `https://wa.me/${whatsapp}` : '', 'whatsapp','WhatsApp',config.whatsapp ? 'Apri la conversazione' : 'Numero da inserire')}
      <div class="contact-tile contact-social">${icon('social')}<span><strong>Social</strong><small>Segui la galleria</small><span class="social-links">${socials}</span></span></div>
    </div><div class="modal-actions"><button class="button" data-action="inquiry">Scrivi un messaggio ${icon('chat')}</button><button class="button secondary" data-action="appointment">Informazioni e appuntamenti ${icon('arrow')}</button></div>`);
  }
  function contactForm(workId) {
    const selected = workId ? works.filter(w => w.id === workId) : works.filter(w => saved.has(w.id));
    const selection = selected.map(w => w.title).join(', ');
    const channels = config.email || config.phone || config.facebook || config.whatsapp;
    open('contact', `<p class="modal-eyebrow">CONTATTI</p><h2 id="dialog-title">Scrivi alla galleria.</h2><p>Fai una domanda sulle opere o sulle preferenze che hai scelto.</p>${selection || preferences ? `<div class="contact-summary">${selection ? `<strong>Le opere che ti interessano</strong><ul class="contact-works" aria-label="Opere selezionate">${selected.map(w => `<li><span class="contact-work-image">${image(w,'meet')}</span><span class="contact-work-title">${esc(w.title)}</span></li>`).join('')}</ul>` : ''}${preferences ? `<p style="margin:8px 0 0;font-size:13px">Preferenze: ${esc(preferences.styles.join(', '))} · ${esc(preferences.budget)} · ${esc(preferences.intent)}</p>` : ''}</div>` : ''}<form id="contact-form"><div class="form-grid"><label class="field">Il tuo nome<input name="name" autocomplete="given-name" required maxlength="100" placeholder="Come ti chiami?"></label><label class="field">Preferisco essere contattato via<select name="channel"><option value="Email">Email</option><option value="Telefono">Telefono</option><option value="WhatsApp">WhatsApp</option><option value="Facebook">Facebook</option></select></label></div><label class="field" id="reply-field">La tua email<input name="reply" type="email" autocomplete="email" required maxlength="150" placeholder="nome@esempio.it"></label><label class="field">Cosa vorresti sapere? <small>Facoltativo</small><textarea name="message" maxlength="2000" placeholder="Ad esempio: mi piacerebbe vedere quest’opera in galleria."></textarea></label><input type="hidden" name="selection" value="${esc(selection)}"><button class="button" type="submit">Prepara la richiesta ${icon('arrow')}</button><p class="demo-note">${channels ? 'Potrai controllare la richiesta e scegliere come inviarla. Il sito non invia messaggi automaticamente.' : 'Questo è un fac simile: nessun messaggio viene inviato. Potrai copiare o scaricare la richiesta di esempio.'} I dati del modulo non vengono salvati sul sito.</p></form>${config.phone ? `<p><a class="text-link" href="tel:${esc(config.phone.replace(/[^+\d]/g,''))}">Preferisci chiamare? ${esc(config.phone)}</a></p>` : ''}${config.facebook && /^https:\/\/(www\.)?(facebook\.com|m\.me)\//.test(config.facebook) ? `<a class="text-link" href="${esc(config.facebook)}" target="_blank" rel="noopener noreferrer">Scrivi su Facebook ${icon('arrow')}</a>` : ''}`);
  }
  function appointmentSlots(date) {
    const slots = Array.isArray(config.visitSlots?.[date]) ? config.visitSlots[date] : [];
    const valid = slots.filter(time => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time));
    return valid.length
      ? `<fieldset class="slot-picker"><legend>Orari disponibili</legend><div class="slot-options">${valid.map((time,i)=>`<label><input type="radio" name="slot" value="${esc(time)}" ${i===0?'checked':''}><span>${esc(time)}</span></label>`).join('')}</div></fieldset>`
      : `<p class="slots-empty">Per questa data non ci sono orari pubblicati. Scegli un altro giorno.</p>`;
  }
  function appointment() {
    const today = new Date(), localToday = new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
    const address = String(config.address || '').trim();
    const mapUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
    const location = address ? `<a class="appointment-location" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">${icon('location')}<span><strong>La visita si svolge qui</strong><br>${esc(address)}</span>${icon('external-arrow')}</a>` : `<div class="appointment-location is-unavailable">${icon('location')}<span><strong>Sede della collezione</strong><br>Indirizzo in aggiornamento</span></div>`;
    open('appointment', `<p class="modal-eyebrow">INFORMAZIONI E APPUNTAMENTI</p><h2 id="dialog-title">Prenota una visita.</h2><p>Seleziona un giorno e un orario pubblicato. La galleria ti confermerà l’appuntamento via email o WhatsApp.</p>${location}<form id="appointment-form"><label class="field">Giorno della visita<input name="date" type="date" min="${localToday}" value="${localToday}" required></label><div id="appointment-slots">${appointmentSlots(localToday)}</div><div class="form-grid"><label class="field">Il tuo nome<input name="name" autocomplete="given-name" required maxlength="100"></label><label class="field">Conferma tramite<select name="channel"><option value="Email">Email</option><option value="WhatsApp">WhatsApp</option></select></label></div><label class="field" id="appointment-reply-field">La tua email<input name="reply" type="email" autocomplete="email" required maxlength="150" placeholder="nome@esempio.it"></label><button class="button" type="submit" ${appointmentSlots(localToday).includes('slot-picker')?'':'disabled'}>Invia richiesta di visita ${icon('arrow')}</button><p class="demo-note">La richiesta non blocca lo slot: l’appuntamento è confermato solo dopo la risposta della galleria. Gli orari mostrati sono quelli inseriti in config.js.</p></form>`);
    $('#appointment-form [name="date"]').addEventListener('change',e=>{ $('#appointment-slots').innerHTML=appointmentSlots(e.target.value); $('#appointment-form button[type="submit"]').disabled=!$('#appointment-slots .slot-picker'); });
  }
  function prepareAppointment(form) {
    const data = new FormData(form), date = String(data.get('date') || ''), slot = String(data.get('slot') || '');
    if (!Array.isArray(config.visitSlots?.[date]) || !config.visitSlots[date].includes(slot)) { notify('Questo orario non è più disponibile'); appointment(); return; }
    requestText = `Richiesta di visita — ${config.name}\n\nNome: ${data.get('name')}\nGiorno richiesto: ${date}\nOrario richiesto: ${slot}\nConferma tramite: ${data.get('channel')}\nRecapito: ${data.get('reply')}\n\nLa visita non è confermata finché la galleria non risponde.`;
    const whatsappNumber=String(config.whatsapp || '').replace(/[^0-9]/g,'');
    const whatsappUrl=data.get('channel')==='WhatsApp'&&/^[1-9][0-9]{7,14}$/.test(whatsappNumber)?`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(requestText)}`:null;
    const emailUrl=data.get('channel')==='Email'&&config.email?`mailto:${encodeURIComponent(config.email)}?subject=${encodeURIComponent('Richiesta di visita — '+config.name)}&body=${encodeURIComponent(requestText)}`:null;
    open('appointment-request',`<p class="modal-eyebrow">RICHIESTA DI VISITA</p><h2 id="dialog-title">Controlla i dettagli.</h2><pre class="request-preview">${esc(requestText)}</pre><div class="modal-actions">${whatsappUrl?`<a class="button" href="${esc(whatsappUrl)}" target="_blank" rel="noopener noreferrer">Invia con WhatsApp ${icon('external-arrow')}</a>`:''}${emailUrl?`<a class="button" href="${esc(emailUrl)}">Invia con email ${icon('arrow')}</a>`:''}<button class="button ${whatsappUrl||emailUrl?'secondary':''}" data-action="copy-request">Copia la richiesta</button><button class="button secondary" data-action="download-request">Scarica il riepilogo</button></div><p class="demo-note">La galleria deve confermare l’orario. Nessun messaggio parte senza la tua azione.</p>`);
  }
  function prepareRequest(form) {
    const data = new FormData(form);
    requestText = `Richiesta di informazioni — ${config.name}\n\nNome: ${data.get('name')}\nContatto preferito: ${data.get('channel')}\nRecapito: ${data.get('reply')}\n${data.get('selection') ? `\nOpere: ${data.get('selection')}\n` : ''}${preferences ? `\nPreferenze: ${preferences.styles.join(', ')}\nBudget indicativo: ${preferences.budget}\nOccasione: ${preferences.intent}\n` : ''}\nMessaggio: ${data.get('message') || 'Vorrei ricevere maggiori informazioni.'}`;
    const whatsappNumber = String(config.whatsapp || '').replace(/[^0-9]/g,'');
    const whatsappUrl = data.get('channel') === 'WhatsApp' && /^[1-9][0-9]{7,14}$/.test(whatsappNumber) ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(requestText)}` : null;
    open('request', `<p class="modal-eyebrow">RIEPILOGO DELLA RICHIESTA</p><h2 id="dialog-title">Riepilogo della richiesta.</h2><p>Controlla i dettagli prima di condividerli.</p><pre class="request-preview">${esc(requestText)}</pre><div class="modal-actions">${whatsappUrl ? `<a class="button" href="${esc(whatsappUrl)}" target="_blank" rel="noopener noreferrer">Apri WhatsApp ${icon('external-arrow')}</a>` : ''}${config.email ? `<a class="button" href="mailto:${encodeURIComponent(config.email)}?subject=${encodeURIComponent('Informazioni sulle opere — ' + config.name)}&body=${encodeURIComponent(requestText)}">Apri la tua email ${icon('arrow')}</a>` : ''}<button class="button ${config.email ? 'secondary' : ''}" data-action="copy-request">Copia la richiesta</button><button class="button secondary" data-action="download-request">Scarica il riepilogo</button></div><p class="demo-note">${whatsappUrl ? 'WhatsApp aprirà il messaggio precompilato. L’invio avviene soltanto con una tua conferma nell’app.' : config.email ? 'L’invio avviene soltanto dal tuo programma di posta.' : 'Richiesta di esempio: non è stata inviata alla galleria. I recapiti reali devono essere configurati per attivare il contatto.'}</p>`);
  }
  function privacy() { open('privacy', `<p class="modal-eyebrow">PRIVACY DEL PROTOTIPO</p><h2 id="dialog-title">Privacy e dati.</h2><p>Questa demo conserva solo gli identificativi delle opere preferite, le preferenze selezionate e la dimensione del testo nella memoria locale del tuo browser. Non richiede un account e non usa strumenti di analisi o tracciamento aggiunti dal sito.</p><p>I dati che inserisci nel modulo restano nella pagina: non vengono inviati a un server né memorizzati nella memoria locale. Copia e download sono attivati solo da una tua azione. Il servizio di hosting può trattare dati tecnici per erogare il sito.</p><p>Le immagini e i dati delle opere sono dimostrativi. Prima di usare il sito per una galleria reale, occorre inserire contenuti, recapiti e informativa privacy appropriati.</p><button class="button secondary" data-action="clear-data">Cancella preferite e preferenze</button>`); }
  document.addEventListener('click', async e => {
    const target = e.target.closest('button,a'); if (!target) return;
    if (target.dataset.view) return viewerAction(target.dataset.view);
    if(target.dataset.showcase) { if(target.dataset.showcase==='toggle'){showcasePlaying=!showcasePlaying;updateShowcasePlayback();}else moveShowcase(target.dataset.showcase==='next'?1:-1);return; }
    if (target.dataset.save) { toggleSaved(target.dataset.save); if(dialog.dataset.view === 'detail') { const w = works.find(w=>w.id===target.dataset.save); if(w) target.innerHTML = `${icon('heart')} ${saved.has(w.id) ? 'Salvata' : 'Salva l’opera'}`; } return; }
    if (target.dataset.detail) return detail(target.dataset.detail);
    if (target.dataset.inquire) return contactForm(target.dataset.inquire);
    if (target.dataset.filter) { filter = target.dataset.filter; visibleLimit = works.length; $$('.filter').forEach(b => { b.classList.toggle('active', b.dataset.filter === filter); b.setAttribute('aria-pressed', b.dataset.filter === filter); }); renderWorks(); return; }
    if (target.dataset.choice) {
      const key = target.dataset.key, value = target.dataset.choice;
      if (key === 'styles') { if (value === 'Mi lascio consigliare') draft.styles = draft.styles.includes(value) ? [] : [value]; else { draft.styles = draft.styles.filter(s => s !== 'Mi lascio consigliare'); draft.styles = draft.styles.includes(value) ? draft.styles.filter(s => s !== value) : [...draft.styles, value]; } }
      else draft[key] = value;
      $$('.choice', dialog).forEach(b => b.setAttribute('aria-pressed', key === 'styles' ? draft.styles.includes(b.dataset.choice) : draft[key] === b.dataset.choice));
      $('[data-action="quiz-next"]', dialog).disabled = !(key === 'styles' ? draft.styles.length : draft[key]); return;
    }
    switch(target.dataset.action) {
      case 'more-works': visibleLimit = works.length; renderWorks(); break;
      case 'saved': renderSaved(); break;
      case 'contact': contact(); break;
      case 'appointment': appointment(); break;
      case 'inquiry': contactForm(); break;
      case 'quiz': startQuiz(); break;
      case 'browse': dialog.close(); $('#opere').scrollIntoView({behavior:'smooth'}); break;
      case 'quiz-back': if (quizStep) { quizStep--; renderQuiz(); } else dialog.close(); break;
      case 'quiz-next': if (quizStep < 2) { quizStep++; renderQuiz(); $('#dialog-title').setAttribute('tabindex','-1'); $('#dialog-title').focus(); } else finishQuiz(); break;
      case 'privacy': privacy(); break;
      case 'clear-data': saved.clear(); preferences = null; ['forma-saved','forma-preferences'].forEach(k => {try {localStorage.removeItem(k);} catch{}}); updateCounts(); renderWorks(); notify('Preferite e preferenze cancellate'); break;
      case 'copy-request': try { await navigator.clipboard.writeText(requestText); notify('Richiesta copiata: puoi incollarla nel tuo messaggio'); } catch { const range=document.createRange();range.selectNodeContents($('.request-preview',dialog));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);notify('Seleziona Copia dal menu del dispositivo per copiare il testo'); } break;
      case 'download-request': { const url = URL.createObjectURL(new Blob([requestText],{type:'text/plain;charset=utf-8'})); const a = document.createElement('a'); a.href=url;a.download='richiesta-forma.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); break; }
    }
  });
  document.addEventListener('change', e => { if(e.target.matches('[name="channel"]')) { const channel=e.target.value; const appointmentMode=!!e.target.closest('#appointment-form'); const label=appointmentMode?$('#appointment-reply-field'):$('#reply-field'); if(!label)return; label.innerHTML=channel === 'WhatsApp' ? 'Il tuo numero WhatsApp<input name="reply" type="tel" inputmode="tel" autocomplete="tel" required maxlength="30" placeholder="Numero con prefisso internazionale">' : channel === 'Telefono' ? 'Il tuo telefono<input name="reply" type="tel" autocomplete="tel" required maxlength="30" placeholder="Il numero a cui richiamarti">' : channel === 'Facebook' ? 'Il tuo nome o profilo Facebook<input name="reply" required maxlength="200" placeholder="Nome o link del tuo profilo">' : 'La tua email<input name="reply" type="email" autocomplete="email" required maxlength="150" placeholder="nome@esempio.it">'; } });
  document.addEventListener('submit', e => { if(e.target.id === 'contact-form') { e.preventDefault(); prepareRequest(e.target); } if(e.target.id === 'appointment-form') { e.preventDefault(); prepareAppointment(e.target); } });
  $('.close',dialog).addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  const textButton=$('#text-size');
  function setTextSize(large) { document.body.classList.toggle('large-text',large);textButton.setAttribute('aria-pressed',large);textButton.setAttribute('aria-label',large?'Ripristina dimensione dei testi':'Ingrandisci i testi'); }
  setTextSize(read('forma-large-text') === true);
  textButton.addEventListener('click',()=>{const large=!document.body.classList.contains('large-text');setTextSize(large);persist('forma-large-text',large);notify(large?'Testi ingranditi':'Dimensione dei testi ripristinata');});
  if(/^#[0-9a-f]{6}$/i.test(config.accent))document.documentElement.style.setProperty('--ink',config.accent);
  document.addEventListener('keydown',e=>{if(dialog.open&&dialog.dataset.view==='detail'&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){if(e.key==='ArrowRight'){e.preventDefault();viewerAction('next');}if(e.key==='ArrowLeft'){e.preventDefault();viewerAction('previous');}}});
  $('.sup').textContent=`01—${String(works.length).padStart(2,'0')}`;
  $('#collection-summary').textContent=`${works.length} opere, 3 categorie.`;
  $('#year').textContent = new Date().getFullYear(); updateCounts(); renderWorks(); startShowcase();
})();
