(() => {
  'use strict';
  const config = window.FORMA_CONFIG;
  const works = config.artworks, artists = config.artists || [], events = config.events || [];
  const categories = ['Astratto', 'Geometrico', 'Paesaggio'];
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const persist = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ } };
  let language = read('forma-language') === 'en' ? 'en' : 'it';
  const tr = (it, en) => language === 'en' ? en : it;
  const local = value => typeof value === 'object' && value ? value[language] || value.it : value;
  const title = w => language === 'en' ? w.titleEn || w.title : w.title;
  const categoryName = category => ({Astratto:tr('Astratto','Abstract'),Geometrico:tr('Geometrico','Geometric'),Paesaggio:tr('Paesaggio','Landscape')})[category] || category;
  const medium = w => language === 'it' ? w.medium : ({'Tecnica mista su tela':'Mixed media on canvas','Acrilico su tela':'Acrylic on canvas','Olio su tela':'Oil on canvas'})[w.medium] || w.medium;
  const artistOf = w => artists.find(a => a.id === w.artistId);
  const artistLink = w => { const a = artistOf(w); return a ? `<a class="artist-name" href="#artisti/${a.id}">${esc(a.name)}</a>` : ''; };
  const stored = read('forma-saved');
  const saved = new Set(Array.isArray(stored) ? stored.filter(id => works.some(w => w.id === id)) : []);
  const limits = Object.fromEntries(categories.map(c => [c, 2]));
  const dialog = $('#dialog'), dialogBody = $('#dialog-body');
  let imageSerial = 0, toastTimer, requestText = '', inquiryContext = '';
  let viewState = {index:0, list:works, zoom:1, x:0, y:0, dark:false};
  let activeArtist = null, eventResizeObserver = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const aspect = w => w.image ? w.image.width / w.image.height : 0.5;

  function image(w, fit = 'meet') {
    const clip = 'art-clip-' + (++imageSerial);
    const a = w.image || {src:'assets/collection.jpg',x:w.panel*512,y:0,width:512,height:1024,sheetWidth:1536,sheetHeight:1024};
    return `<svg class="artwork" viewBox="${a.x} ${a.y} ${a.width} ${a.height}" preserveAspectRatio="xMidYMid ${fit}" style="--native-width:${a.width}px;--native-height:${a.height}px" role="img" aria-label="${esc(title(w))}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${clip}" clipPathUnits="userSpaceOnUse"><rect x="${a.x}" y="${a.y}" width="${a.width}" height="${a.height}" fill="white" stroke="none"/></clipPath></defs><image href="${esc(a.src)}" width="${a.sheetWidth}" height="${a.sheetHeight}" clip-path="url(#${clip})"/></svg>`;
  }
  function saveButton(w, extra = '') {
    const selected = saved.has(w.id);
    return `<button type="button" class="save ${extra}" data-save="${esc(w.id)}" aria-pressed="${selected}" aria-label="${esc(tr(selected?'Rimuovi':'Salva',selected?'Remove':'Save')+' '+title(w))}">${icon('heart')}<span>${selected?tr('Salvata','Saved'):tr('Salva','Save')}</span></button>`;
  }
  function artCard(w) {
    return `<article class="art-card"><button class="art-img" data-detail="${w.id}" aria-label="${esc(tr('Osserva ','View ')+title(w))}">${image(w)}</button><div class="card-top"><div><h4><button class="title-button" data-detail="${w.id}">${esc(title(w))}</button></h4>${artistLink(w)}</div>${saveButton(w)}</div><p class="card-details">${esc(medium(w))} · ${esc(w.size)}</p></article>`;
  }
  function renderShell() {
    document.documentElement.lang = language;
    document.title = tr('FORMA — Galleria d’arte','FORMA — Art gallery');
    $('meta[name="description"]').content = tr('Forma. Opere, artisti ed eventi. Una selezione personale e un contatto diretto con la galleria.','Forma. Artworks, artists and events. A personal selection and direct contact with the gallery.');
    $('#skip-link').textContent = tr('Vai al contenuto','Skip to content');
    $('#site-header').innerHTML = `<a class="brand" href="#inizio" aria-label="${tr('Forma, pagina iniziale','Forma, home')}">FORMA<span>${tr('Galleria d’arte','Art gallery')}</span></a><nav aria-label="${tr('Navigazione principale','Main navigation')}"><a href="#eventi">${tr('Eventi','Events')}</a><a href="#opere">${tr('Opere','Artworks')}</a><a href="#artisti">${tr('Artisti','Artists')}</a><a href="#galleria">${tr('Galleria','Gallery')}</a></nav><div class="header-actions"><button id="text-size" class="text-size" aria-pressed="false">A+</button><button class="saved-nav" data-action="saved">${tr('Selezione','Selection')} <span class="count">${saved.size}</span></button><button class="contact-link" data-action="contact">${tr('Contatti','Contact')} ${icon('external-arrow')}</button><div class="language-switch" role="group" aria-label="${tr('Lingua del sito','Website language')}"><button data-lang="it" lang="it" aria-label="Italiano" aria-pressed="${language==='it'}">IT</button><span aria-hidden="true">|</span><button data-lang="en" lang="en" aria-label="English" aria-pressed="${language==='en'}">EN</button></div></div>`;
    $('#site-footer').innerHTML = `<div class="footer-wordmark" aria-hidden="true">FORMA</div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Forma</span><span>${tr('Fac simile · Opere dimostrative generate con ImageGen 2.5','Demo · Demonstration artworks generated with ImageGen 2.5')}</span><button class="plain" data-action="privacy">${tr('Privacy e dati','Privacy and data')}</button><a href="#inizio">${tr('Torna all’inizio','Back to top')} ↑</a></div>`;
    $('#mobile-bar').innerHTML = `<button data-action="saved">${tr('Selezione','Selection')} <span class="count">${saved.size}</span></button><button data-action="contact">${tr('Contatti','Contact')} ${icon('external-arrow')}</button>`;
    $('[data-close-text]').textContent = tr('Chiudi','Close');
    $('.close').setAttribute('aria-label',tr('Chiudi finestra','Close window'));
    setTextSize(read('forma-large-text') === true);
  }
  function renderHome() {
    stopCollage();
    eventResizeObserver?.disconnect();
    $('#home').innerHTML = `
      <section class="showcase" id="inizio" aria-labelledby="hero-title">
        <div class="showcase-heading"><div><p class="label">${tr('Collezione / Forma','Collection / Forma')}</p><h1 id="hero-title">${tr('Studi sul colore.','Studies in colour.')}</h1></div><button class="showcase-toggle" data-action="toggle-collage"></button></div>
        <div id="showcase-collage" class="collage" role="group" aria-label="${tr('Dieci opere della collezione','Ten works from the collection')}"></div>
        <div class="showcase-foot"><p>${tr('Seleziona un’opera per osservarla da vicino.','Select a work to look closer.')}</p><span>${tr('30 opere, 3 collezioni.','30 works, 3 collections.')}</span><a href="#opere">${tr('Esplora le opere','Explore the artworks')} ↓</a></div>
      </section>
      <section id="eventi" class="events-section container" aria-labelledby="events-title">
        <div class="section-top"><div><p class="label">${tr('In galleria','At the gallery')}</p><h2 id="events-title">${tr('Eventi','Events')}</h2></div><div class="event-navigation"><button data-event-scroll="-1" aria-label="${tr('Eventi precedenti','Previous events')}">←</button><button data-event-scroll="1" aria-label="${tr('Eventi successivi','Next events')}">→</button></div></div>
        <p class="section-note">${tr('Programma dimostrativo · date ed eventi di esempio.','Demonstration programme · sample dates and events.')}</p><div class="event-track" tabindex="0" aria-label="${tr('Scorri gli eventi','Browse events')}">${events.map(eventCard).join('')}</div>
      </section>
      <section class="collection container" id="opere" aria-labelledby="collection-title">
        <div class="section-top collection-heading"><h2 id="collection-title">${tr('Le opere','Artworks')}</h2><p class="work-disclaimer">${tr('Opere dimostrative generate con ImageGen 2.5','Demonstration artworks generated with ImageGen 2.5')}</p></div>
        <div class="collection-index" aria-label="${tr('Collezioni','Collections')}">${categories.map(c=>`<a href="#collezione-${c.toLowerCase()}">${categoryName(c)} <span>10</span></a>`).join('')}</div>
        <div id="collections">${categories.map(c=>`<section class="category-group" id="collezione-${c.toLowerCase()}" aria-labelledby="heading-${c}"><div class="category-heading"><h3 id="heading-${c}">${categoryName(c)}</h3><span class="category-progress" aria-live="polite"></span></div><div class="category-works art-grid" id="works-${c}"></div><div class="category-actions"><button class="line-link" data-expand="${c}" aria-controls="works-${c}"></button><button class="plain" data-collapse="${c}" hidden>${tr('Mostra meno','Show fewer')}</button></div></section>`).join('')}</div>
      </section>
      <section id="artisti" class="artists-section container" aria-labelledby="artists-title"><div class="section-top"><h2 id="artists-title">${tr('Artisti','Artists')}</h2><p>${tr('Sei sguardi sulla collezione.','Six perspectives on the collection.')}</p></div><p class="section-note">${tr('Profili immaginari per illustrare il sito.','Imaginary profiles to demonstrate the website.')}</p><div class="artists-list">${artists.map(a=>`<a class="artist-row" href="#artisti/${a.id}"><span class="artist-thumbnail">${image(works.find(w=>w.id===a.coverWorkId))}</span><span class="artist-row-text"><strong>${esc(a.name)}</strong><span>${esc(local(a.practice))}</span></span>${icon('external-arrow')}</a>`).join('')}</div></section>
      <section id="preferenze" class="selection-section container" aria-labelledby="selection-title"><div class="selection-heading"><p class="label">${tr('La tua ricerca','Your exploration')}</p><h2 id="selection-title">${tr('Una selezione personale.','A personal selection.')}</h2><p>${tr('Le opere che vuoi ritrovare, tutte qui.','The works you want to return to, all here.')}</p></div><div id="saved-home"></div></section>
      <section id="galleria" class="gallery-note container" aria-labelledby="gallery-title"><figure class="gallery-figure"><img src="assets/gallery.jpg" alt="${tr('Ambiente espositivo dimostrativo della galleria','Demonstration gallery interior')}" loading="lazy"><figcaption>${tr('Immagine dimostrativa della galleria','Demonstration gallery image')}</figcaption></figure><div><p class="label">${tr('La galleria','The gallery')}</p><h2 id="gallery-title">${tr('Uno spazio per incontrare l’arte.','A space to encounter art.')}</h2><p>${tr('La collezione prende forma anche dal vivo. Uno spazio raccolto, dove osservare le opere alla luce naturale, avvicinarsi ai materiali e prendersi il tempo di scegliere.','The collection also comes to life in person. An intimate space to see the works in natural light, get closer to their materials and take time to choose.')}</p><p>${tr('Le visite sono un’occasione per conoscere la collezione e parlare direttamente con la galleria, seguendo i propri interessi.','Visits are an opportunity to discover the collection and speak directly with the gallery, following your own interests.')}</p><div class="gallery-address">${icon('location')}<span>${esc(config.address || tr('Sede della collezione · indirizzo in aggiornamento','Collection location · address to be announced'))}</span></div></div></section>
      <section class="contact-section container"><p class="label">${tr('Parliamone','Let’s talk')}</p><button class="contact-title" data-action="contact">${tr('Contatti','Contact')}${icon('external-arrow')}</button><div class="contact-foot"><button class="line-link" data-action="appointment">${tr('Informazioni e appuntamenti','Information and appointments')}${icon('external-arrow')}</button><button class="line-link" data-action="saved">${tr('La tua selezione','Your selection')} <span class="count">${saved.size}</span></button></div></section>`;
    categories.forEach(renderCategory);
    renderSelection();
    setupEventScroll();
    startCollage();
  }
  function orderedCategory(category) {
    const list = works.filter(w=>w.category===category);
    const featured = (config.featuredWorkIds?.[category] || []).map(id=>list.find(w=>w.id===id)).filter(Boolean).slice(0,2);
    return [...featured, ...list.filter(w=>!featured.includes(w))];
  }
  function renderCategory(category) {
    const group = $(`#collezione-${category.toLowerCase()}`);
    const list = orderedCategory(category), visible = list.slice(0,limits[category]);
    $('.category-works',group).innerHTML = visible.map(artCard).join('');
    $('.category-progress',group).textContent = `${visible.length} / ${list.length}`;
    const more = $('[data-expand]',group);
    more.hidden = visible.length === list.length;
    more.textContent = tr('Mostra altre 2 opere','Show 2 more works') + ' +';
    more.setAttribute('aria-label',tr('Mostra altre 2 opere: ','Show 2 more works: ')+categoryName(category));
    $('[data-collapse]',group).hidden = visible.length <= 2;
  }
  function renderSelection() {
    const list = works.filter(w=>saved.has(w.id)), root = $('#saved-home');
    if (!root) return;
    root.innerHTML = list.length ? `<div class="selection-strip" tabindex="0" aria-label="${tr('Opere salvate','Saved works')}">${list.map(w=>`<article class="selection-tile"><button class="selection-image" data-detail="${w.id}" aria-label="${esc(tr('Osserva ','View ')+title(w))}">${image(w)}</button><h3><button data-detail="${w.id}">${esc(title(w))}</button></h3>${artistLink(w)}${saveButton(w)}</article>`).join('')}</div><button class="line-link" data-action="inquiry">${tr('Chiedi informazioni sulla selezione','Enquire about your selection')}${icon('external-arrow')}</button>` : `<div class="selection-empty">${icon('heart')}<p>${tr('La tua selezione inizia da un’opera. Tocca il cuore accanto ai quadri che vuoi ritrovare.','Your selection starts with one work. Tap the heart beside the paintings you want to return to.')}</p><a class="line-link" href="#opere">${tr('Esplora le opere','Explore the artworks')} ↓</a></div>`;
  }

  // Fixed ratio slots: square = 1:1, portrait = 2:3. Only one crossfade is active.
  let collageSlots = [], collageAnimation = null, collagePending = null, collageGeneration = 0;
  let collagePlaying = !reducedMotion.matches, collageVisible = true, lastSlot = -1, collageObserver;
  const collageDuration = 3600;
  function collageCanPlay() { return collagePlaying && collageVisible && !document.hidden && !dialog.open && !activeArtist; }
  function stopCollage() {
    collageGeneration++;
    if (collageAnimation) { collageAnimation.onfinish = null; collageAnimation.cancel(); }
    collageAnimation = null; collagePending = null;
    collageObserver?.disconnect();
  }
  function updatePlayback() {
    const button = $('[data-action="toggle-collage"]');
    if (button) { button.innerHTML = `<span aria-hidden="true">${collagePlaying?'Ⅱ':'▷'}</span>${collagePlaying?tr('Pausa','Pause'):tr('Riprendi','Resume')}`; button.setAttribute('aria-label',collagePlaying?tr('Metti in pausa le dissolvenze','Pause the crossfades'):tr('Riprendi le dissolvenze','Resume the crossfades')); }
    if (collageAnimation) { if (collageCanPlay()) collageAnimation.play(); else collageAnimation.pause(); }
    else if (collageCanPlay()) nextCollageChange();
  }
  function startCollage() {
    const squares = works.filter(w=>Math.abs(aspect(w)-1)<0.01), portraits = works.filter(w=>Math.abs(aspect(w)-2/3)<0.01);
    const shapes = ['square','portrait','square','portrait','square','portrait','square','square','square','portrait'];
    let s=0,p=0;
    collageSlots = shapes.map((shape,index)=>({index,shape,pool:shape==='square'?squares:portraits,work:shape==='square'?squares[s++]:portraits[p++]}));
    $('#showcase-collage').innerHTML = collageSlots.map(slot=>`<button class="collage-tile slot-${slot.index+1}" data-collage-slot="${slot.index}" aria-label="${esc(tr('Osserva ','View ')+title(slot.work))}"><span class="collage-layer">${image(slot.work)}</span></button>`).join('');
    collageVisible = !activeArtist;
    updatePlayback();
    if ('IntersectionObserver' in window) {
      collageObserver = new IntersectionObserver(entries=>{collageVisible=entries[0].isIntersecting;updatePlayback();},{threshold:0});
      collageObserver.observe($('#showcase-collage'));
    }
  }
  function nextCollageChange() {
    if (!collageCanPlay() || collageAnimation || !collageSlots.length) return;
    const eligible = collageSlots.filter(slot=>slot.index!==lastSlot);
    const slot = eligible[Math.floor(Math.random()*eligible.length)];
    const used = new Set(collageSlots.map(other=>other.work.id));
    const candidates = slot.pool.filter(w=>!used.has(w.id));
    const next = candidates[Math.floor(Math.random()*candidates.length)];
    if (!next) return;
    const tile = $(`[data-collage-slot="${slot.index}"]`), incoming = document.createElement('span');
    if (!tile) return;
    incoming.className = 'collage-layer incoming';
    incoming.setAttribute('aria-hidden','true');
    incoming.innerHTML = image(next);
    tile.append(incoming);
    collagePending = {slot,next};
    lastSlot = slot.index;
    const generation = collageGeneration;
    collageAnimation = incoming.animate([{opacity:0},{opacity:1}],{duration:collageDuration,easing:'linear',fill:'forwards'});
    collageAnimation.onfinish = () => {
      if (generation!==collageGeneration) return;
      tile.firstElementChild.remove();
      incoming.classList.remove('incoming');incoming.removeAttribute('aria-hidden');incoming.style.opacity='1';
      slot.work = next;tile.setAttribute('aria-label',tr('Osserva ','View ')+title(next));
      collageAnimation.cancel();collageAnimation=null;collagePending=null;
      nextCollageChange();
    };
  }
  document.addEventListener('visibilitychange',updatePlayback);
  document.addEventListener('focusin',e=>{if(e.target.closest('#showcase-collage'))updatePlayback();});
  document.addEventListener('focusout',()=>queueMicrotask(updatePlayback));
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)collagePlaying=false;updatePlayback();});

  function formatDate(value, options={day:'numeric',month:'long',year:'numeric'}) {
    return new Intl.DateTimeFormat(language==='en'?'en-GB':'it-IT',options).format(new Date(value+'T12:00:00'));
  }
  function eventDate(event) { return formatDate(event.date,{day:'numeric',month:'short'})+(event.endDate?' — '+formatDate(event.endDate,{day:'numeric',month:'short',year:'numeric'}):' '+event.date.slice(0,4)); }
  function eventCard(event) {
    return `<article class="event-card"><button class="event-cover" data-event="${event.id}" aria-label="${esc(local(event.title))}">${event.coverWorkIds.map(id=>`<span>${image(works.find(w=>w.id===id))}</span>`).join('')}</button><p class="event-meta">${esc(local(event.kind))} · ${esc(eventDate(event))}</p><h3><button data-event="${event.id}">${esc(local(event.title))}</button></h3><p class="event-info">${esc(event.time)}<br>${esc(local(event.admission))}</p><button class="line-link" data-event="${event.id}">${tr('Dettagli dell’evento','Event details')}${icon('external-arrow')}</button></article>`;
  }
  function setupEventScroll() {
    const track=$('.event-track');
    const update=()=>{$('[data-event-scroll="-1"]').disabled=track.scrollLeft<4;$('[data-event-scroll="1"]').disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-4;};
    track.addEventListener('scroll',update,{passive:true});
    eventResizeObserver=new ResizeObserver(update);eventResizeObserver.observe(track);requestAnimationFrame(update);
  }
  function showEvent(id) {
    const event=events.find(e=>e.id===id);if(!event)return;
    open('event',`<p class="modal-eyebrow">${tr('EVENTO DIMOSTRATIVO','DEMONSTRATION EVENT')}</p><h2 id="dialog-title">${esc(local(event.title))}</h2><p>${esc(local(event.description))}</p><dl class="event-facts"><div><dt>${tr('Quando','When')}</dt><dd>${esc(eventDate(event))}<br>${esc(event.time)}</dd></div><div><dt>${tr('Dove','Where')}</dt><dd>${esc(config.address||tr('Sede della collezione · indirizzo in aggiornamento','Collection location · address to be announced'))}</dd></div><div><dt>${tr('Accesso','Admission')}</dt><dd>${esc(local(event.admission))}</dd></div></dl><button class="button" data-event-inquiry="${id}">${tr('Chiedi informazioni','Ask for information')}${icon('arrow')}</button><p class="demo-note">${tr('Titolo, date e programma sono esempi dimostrativi.','The title, dates and programme are demonstration examples.')}</p>`);
  }
  function route() {
    const id=location.hash.startsWith('#artisti/')?location.hash.slice(9).split('/')[0]:null;
    activeArtist=artists.find(a=>a.id===id)||null;
    $('#home').hidden=!!activeArtist;$('#artist-page').hidden=!activeArtist;
    if(activeArtist){
      const a=activeArtist,list=works.filter(w=>w.artistId===a.id),cover=works.find(w=>w.id===a.coverWorkId);
      $('#artist-page').innerHTML=`<a class="line-link back-artists" href="#artisti">← ${tr('Tutti gli artisti','All artists')}</a><div class="artist-intro"><div><p class="label">${tr('Profilo immaginario / ','Imaginary profile / ')+categoryName(a.category)}</p><h1 tabindex="-1">${esc(a.name)}</h1><p class="artist-practice">${esc(local(a.practice))}</p><p class="artist-bio">${esc(local(a.bio))}</p><a class="line-link" href="#artisti/${a.id}/opere">${tr('Le opere in collezione','Works in the collection')} ↓</a></div><div class="artist-hero-art">${image(cover)}</div></div><div class="artist-journey"><h2>${tr('Il percorso','The practice')}</h2><div>${a.journey.map((step,i)=>`<article><span class="label">0${i+1}</span><h3>${esc(local(step.title))}</h3><p>${esc(local(step.text))}</p></article>`).join('')}</div></div><section id="percorso-opere"><div class="category-heading"><h2>${tr('Le opere','Artworks')}</h2><span>${list.length} ${tr('opere dimostrative','demonstration works')}</span></div><div class="art-grid artist-works">${list.map(artCard).join('')}</div></section><a class="line-link back-artists" href="#artisti">← ${tr('Tutti gli artisti','All artists')}</a>`;
      document.title=`${a.name} — FORMA`;
      requestAnimationFrame(()=>{if(location.hash.endsWith('/opere'))$('#percorso-opere').scrollIntoView({behavior:'instant'});else{window.scrollTo({top:0,behavior:'instant'});$('#artist-page h1').focus({preventScroll:true});}});
    } else {
      document.title=tr('FORMA — Galleria d’arte','FORMA — Art gallery');
      if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));
    }
    updatePlayback();
  }
  window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();route();});

  function notify(message) { const toast=$('.toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3000); }
  function updateSaved() {
    $$('.count').forEach(n=>n.textContent=saved.size);
    $$('[data-save]').forEach(button=>{const w=works.find(w=>w.id===button.dataset.save);const selected=saved.has(w.id);button.setAttribute('aria-pressed',selected);button.setAttribute('aria-label',tr(selected?'Rimuovi ':'Salva ',selected?'Remove ':'Save ')+title(w));$('span',button).textContent=selected?tr('Salvata','Saved'):tr('Salva','Save');});
    renderSelection();
    if(dialog.open&&dialog.dataset.view==='saved')renderSaved();
  }
  function toggleSaved(id) {
    if(!works.some(w=>w.id===id))return;
    saved.has(id)?saved.delete(id):saved.add(id);persist('forma-saved',[...saved]);updateSaved();
    notify(saved.has(id)?tr('Opera aggiunta alla selezione','Work added to your selection'):tr('Opera rimossa dalla selezione','Work removed from your selection'));
  }
  function open(view,html) {
    dialog.classList.toggle('viewer',view==='detail');dialog.dataset.view=view;dialogBody.innerHTML=html;
    if(!dialog.open)dialog.showModal();updatePlayback();
    const h=$('#dialog-title');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}dialog.scrollTop=0;
  }
  function detail(id) {
    const list=activeArtist?works.filter(w=>w.artistId===activeArtist.id):works;
    const index=list.findIndex(w=>w.id===id);if(index<0)return;
    viewState={index,list,zoom:1,x:0,y:0,dark:viewState.dark};renderViewer();
  }
  function renderViewer() {
    const w=viewState.list[viewState.index];
    open('detail',`<div class="viewer-top"><strong>FORMA</strong><span>${tr('Sala di osservazione','Viewing room')} / ${String(works.indexOf(w)+1).padStart(2,'0')}</span></div><div class="viewer-layout"><div class="viewer-image-area ${viewState.dark?'dark':''}"><div class="viewer-viewport" aria-label="${tr('Opera ingrandibile: usa i comandi sottostanti','Zoomable artwork: use the controls below')}"><div class="viewer-canvas">${image(w)}</div></div><div class="viewer-controls"><div class="zoom-control"><button data-view="zoom-out" aria-label="${tr('Riduci ingrandimento','Zoom out')}" disabled>−</button><output id="zoom-output" aria-live="polite">100%</output><button data-view="zoom-in" aria-label="${tr('Ingrandisci opera','Zoom in')}">+</button></div><button data-view="reset">${tr('Ripristina','Reset')}</button><button data-view="background" aria-pressed="${viewState.dark}">${viewState.dark?tr('Fondo chiaro','Light background'):tr('Fondo scuro','Dark background')}</button></div></div><div class="viewer-info"><p class="modal-eyebrow">${categoryName(w.category)}</p><h2 id="dialog-title">${esc(title(w))}</h2>${artistLink(w)}<p class="viewer-medium">${esc(medium(w))}<br>${esc(w.size)}</p><p class="viewer-description">${esc(language==='en'?w.descriptionEn:w.description)}</p><p class="viewer-hint">${tr('Ingrandisci con +. Poi trascina l’immagine per esplorare i dettagli.','Zoom in with +, then drag the image to explore its details.')}</p><div class="modal-actions"><button class="button" data-inquire="${w.id}">${tr('Informazioni sull’opera','Enquire about this work')}${icon('external-arrow')}</button>${saveButton(w,'button secondary')}</div><div class="viewer-nav"><button data-view="previous" aria-label="${tr('Opera precedente','Previous work')}">←</button><span>${viewState.index+1} / ${viewState.list.length}</span><button data-view="next" aria-label="${tr('Opera successiva','Next work')}">→</button></div><p class="demo-note">${tr('Opera dimostrativa generata con ImageGen 2.5. Artista immaginario.','Demonstration artwork generated with ImageGen 2.5. Imaginary artist.')}</p></div></div>`);
    setupPan();
  }
  function updateZoom() {
    const canvas=$('.viewer-canvas',dialog),viewport=$('.viewer-viewport',dialog);if(!canvas)return;
    const bounds=viewport.getBoundingClientRect(),maxX=bounds.width*(viewState.zoom-1)/2,maxY=bounds.height*(viewState.zoom-1)/2;
    viewState.x=Math.min(maxX,Math.max(-maxX,viewState.x));viewState.y=Math.min(maxY,Math.max(-maxY,viewState.y));
    canvas.style.setProperty('--zoom',viewState.zoom);canvas.style.setProperty('--pan-x',`${viewState.x}px`);canvas.style.setProperty('--pan-y',`${viewState.y}px`);
    viewport.classList.toggle('is-zoomed',viewState.zoom>1);$('#zoom-output').textContent=`${Math.round(viewState.zoom*100)}%`;
    $('[data-view="zoom-out"]').disabled=viewState.zoom<=1;$('[data-view="zoom-in"]').disabled=viewState.zoom>=3;
  }
  function setupPan() {
    const viewport=$('.viewer-viewport',dialog);let pointer=null;
    viewport.addEventListener('pointerdown',e=>{if(viewState.zoom<=1||(e.pointerType==='mouse'&&e.button!==0))return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,originX:viewState.x,originY:viewState.y};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
    viewport.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;viewState.x=pointer.originX+e.clientX-pointer.x;viewState.y=pointer.originY+e.clientY-pointer.y;updateZoom();});
    const stop=()=>{pointer=null;viewport.classList.remove('dragging');};['pointerup','pointercancel','lostpointercapture'].forEach(event=>viewport.addEventListener(event,stop));
  }
  function viewerAction(action) {
    if(action==='next'||action==='previous'){viewState.index=(viewState.index+(action==='next'?1:-1)+viewState.list.length)%viewState.list.length;viewState.zoom=1;viewState.x=0;viewState.y=0;renderViewer();}
    else if(action==='background'){viewState.dark=!viewState.dark;$('.viewer-image-area').classList.toggle('dark',viewState.dark);const button=$('[data-view="background"]');button.textContent=viewState.dark?tr('Fondo chiaro','Light background'):tr('Fondo scuro','Dark background');button.setAttribute('aria-pressed',viewState.dark);}
    else {if(action==='reset'){viewState.zoom=1;viewState.x=0;viewState.y=0;}else viewState.zoom=Math.min(3,Math.max(1,viewState.zoom+(action==='zoom-in'?.5:-.5)));updateZoom();}
  }
  function savedSummary(list) { return `<ul class="contact-works">${list.map(w=>`<li><span class="contact-work-image">${image(w)}</span><span><strong>${esc(title(w))}</strong><small>${esc(artistOf(w)?.name||'')}</small></span></li>`).join('')}</ul>`; }
  function renderSaved() {
    const list=works.filter(w=>saved.has(w.id));
    open('saved',`<p class="modal-eyebrow">${tr('LA TUA SELEZIONE','YOUR SELECTION')}</p><h2 id="dialog-title">${tr('Le tue preferite','Your favourites')} (${list.length})</h2>${list.length?`<div class="saved-list">${list.map(w=>`<div class="saved-item"><button class="saved-image" data-detail="${w.id}" aria-label="${esc(tr('Osserva ','View ')+title(w))}">${image(w)}</button><div><h3><button class="title-button" data-detail="${w.id}">${esc(title(w))}</button></h3>${artistLink(w)}</div>${saveButton(w)}</div>`).join('')}</div><div class="modal-actions"><button class="button" data-action="inquiry">${tr('Informazioni sulle opere','Enquire about the works')}${icon('arrow')}</button><button class="button secondary" data-action="browse">${tr('Continua a esplorare','Continue exploring')}</button></div>`:`<p>${tr('Non hai ancora salvato un’opera. Tocca il cuore accanto ai quadri che ti piacciono.','You haven’t saved a work yet. Tap the heart beside the paintings you like.')}</p><button class="button" data-action="browse">${tr('Scopri le opere','Discover the artworks')}${icon('arrow')}</button>`}`);
  }
  function contact() {
    const address=String(config.address||'').trim(),phone=String(config.phone||'').trim(),email=String(config.email||'').trim(),whatsapp=String(config.whatsapp||'').replace(/[^0-9]/g,'');
    const direct=(href,symbol,label,value)=>href?`<a class="contact-tile" href="${esc(href)}" ${href.startsWith('https:')?'target="_blank" rel="noopener noreferrer"':''}>${icon(symbol)}<span><strong>${label}</strong><small>${esc(value)}</small></span>${icon('external-arrow')}</a>`:`<div class="contact-tile is-unavailable">${icon(symbol)}<span><strong>${label}</strong><small>${tr('Dato da inserire','Details to be added')}</small></span></div>`;
    const socials=[['facebook','Facebook',config.facebook],['instagram','Instagram',config.instagram],['x','X',config.x]].map(([symbol,label,url])=>/^https:\/\/(www\.)?(facebook\.com|instagram\.com|x\.com)\//.test(String(url||''))?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon(symbol)}</a>`:`<span aria-label="${label}: ${tr('da configurare','not configured')}">${icon(symbol)}</span>`).join('');
    open('contact',`<p class="modal-eyebrow">${tr('CONTATTI','CONTACT')}</p><h2 id="dialog-title">${tr('La galleria, in modo diretto.','A direct line to the gallery.')}</h2><div class="contact-grid">${direct(address?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`:'','location',tr('Dove siamo','Find us'),address)}<button class="contact-tile" data-action="appointment">${icon('clock')}<span><strong>${tr('Orari e visite','Opening hours and visits')}</strong><small>${esc(config.openingHours||tr('Visite su appuntamento','Visits by appointment'))}</small></span>${icon('external-arrow')}</button>${direct(phone?`tel:${phone.replace(/[^+\d]/g,'')}`:'','phone',tr('Telefono','Phone'),phone)}${direct(email?`mailto:${email}`:'','mail','Email',email)}${direct(/^[1-9][0-9]{7,14}$/.test(whatsapp)?`https://wa.me/${whatsapp}`:'','whatsapp','WhatsApp',tr('Apri la conversazione','Start a conversation'))}<div class="contact-tile contact-social">${icon('social')}<span><strong>Social</strong><span class="social-links">${socials}</span></span></div></div><button class="button" data-action="inquiry">${tr('Scrivi un messaggio','Write a message')}${icon('arrow')}</button>`);
  }
  function replyField(channel) {
    const phone=channel==='WhatsApp'||channel==='Phone';
    return `${phone?tr('Il tuo numero di telefono','Your phone number'):tr('La tua email','Your email')}<input name="reply" type="${phone?'tel':'email'}" autocomplete="${phone?'tel':'email'}" required maxlength="150" placeholder="${phone?tr('Con prefisso internazionale','Include country code'):'nome@esempio.it'}">`;
  }
  function contactForm(workId, context='') {
    inquiryContext=context;
    const list=workId?works.filter(w=>w.id===workId):works.filter(w=>saved.has(w.id));
    open('inquiry',`<p class="modal-eyebrow">${tr('INFORMAZIONI','ENQUIRIES')}</p><h2 id="dialog-title">${tr('Scrivi alla galleria.','Write to the gallery.')}</h2>${context?`<p>${esc(context)}</p>`:''}${list.length?`<div class="contact-summary"><strong>${tr('Le opere che ti interessano','The works you’re interested in')}</strong>${savedSummary(list)}</div>`:''}<form id="contact-form"><div class="form-grid"><label class="field">${tr('Il tuo nome','Your name')}<input name="name" autocomplete="name" required maxlength="100"></label><label class="field">${tr('Preferisco essere contattato via','Preferred contact channel')}<select name="channel"><option value="Email">Email</option><option value="WhatsApp">WhatsApp</option><option value="Phone">${tr('Telefono','Phone')}</option></select></label></div><label class="field reply-field">${replyField('Email')}</label><label class="field">${tr('Il tuo messaggio','Your message')}<textarea name="message" maxlength="2000"></textarea></label><input type="hidden" name="selection" value="${esc(list.map(w=>title(w)+' — '+artistOf(w)?.name).join(', '))}"><button class="button" type="submit">${tr('Prepara la richiesta','Prepare your enquiry')}${icon('arrow')}</button><p class="demo-note">${tr('Potrai controllare la richiesta prima di inviarla via email o WhatsApp. I dati del modulo non vengono salvati sul sito.','You can review your enquiry before sending it by email or WhatsApp. Form data is not saved on the website.')}</p></form>`);
  }
  const localDay = () => {const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;};
  function validSlots(date) {
    const now=new Date();
    return [...new Set(Array.isArray(config.visitSlots?.[date])?config.visitSlots[date]:[])].filter(time=>/^([01]\d|2[0-3]):[0-5]\d$/.test(time)&&new Date(date+'T'+time+':00')>now).sort();
  }
  function slotMarkup(date) { const slots=validSlots(date);return slots.length?`<fieldset class="slot-picker"><legend>${tr('Orari disponibili','Available times')}</legend><div class="slot-options">${slots.map((time,i)=>`<label><input type="radio" name="slot" value="${time}" ${i===0?'checked':''} required><span>${time}</span></label>`).join('')}</div></fieldset>`:`<p>${tr('Non ci sono orari disponibili per questo giorno.','There are no available times for this date.')}</p>`; }
  function appointment() {
    const dates=Object.keys(config.visitSlots||{}).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>=localDay()&&validSlots(date).length).sort();
    open('appointment',`<p class="modal-eyebrow">${tr('INFORMAZIONI E APPUNTAMENTI','INFORMATION AND APPOINTMENTS')}</p><h2 id="dialog-title">${tr('Una visita in galleria.','A visit to the gallery.')}</h2><p>${tr('Scegli tra i giorni e gli orari pubblicati. La visita sarà confermata dalla galleria via email o WhatsApp.','Choose from the published dates and times. Your visit will be confirmed by the gallery by email or WhatsApp.')}</p><div class="appointment-location">${icon('location')}<span>${esc(config.address||tr('Sede della collezione · indirizzo in aggiornamento','Collection location · address to be announced'))}</span></div>${dates.length?`<form id="appointment-form"><label class="field">${tr('Giorno della visita','Visit date')}<select name="date">${dates.map(date=>`<option value="${date}">${formatDate(date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</option>`).join('')}</select></label><div id="appointment-slots">${slotMarkup(dates[0])}</div><div class="form-grid"><label class="field">${tr('Il tuo nome','Your name')}<input name="name" autocomplete="name" required maxlength="100"></label><label class="field">${tr('Conferma tramite','Confirm via')}<select name="channel"><option value="Email">Email</option><option value="WhatsApp">WhatsApp</option></select></label></div><label class="field reply-field">${replyField('Email')}</label><button class="button" type="submit">${tr('Prepara la richiesta di visita','Prepare your visit request')}${icon('arrow')}</button><p class="demo-note">${tr('La richiesta non blocca lo slot. Attendi la conferma della galleria.','A request does not reserve the time slot. Please wait for confirmation from the gallery.')}</p></form>`:`<div class="slots-empty"><p>${tr('Il calendario delle visite è in aggiornamento. Contattaci per concordare un giorno e un orario.','The visit calendar is being updated. Contact us to arrange a date and time.')}</p><button class="button" data-visit-inquiry>${tr('Chiedi una visita','Enquire about a visit')}${icon('arrow')}</button></div>`}`);
  }
  function showRequest(channel, subject) {
    const number=String(config.whatsapp||'').replace(/[^0-9]/g,'');
    const whatsapp=/^[1-9][0-9]{7,14}$/.test(number)?`https://wa.me/${number}?text=${encodeURIComponent(requestText)}`:null;
    const email=config.email?`mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(requestText)}`:null;
    open('request',`<p class="modal-eyebrow">${tr('RIEPILOGO DELLA RICHIESTA','ENQUIRY SUMMARY')}</p><h2 id="dialog-title">${tr('Controlla i dettagli.','Review the details.')}</h2><pre class="request-preview">${esc(requestText)}</pre><div class="modal-actions">${whatsapp?`<a class="button" href="${esc(whatsapp)}" target="_blank" rel="noopener noreferrer">${tr('Invia con WhatsApp','Send with WhatsApp')}${icon('external-arrow')}</a>`:''}${email?`<a class="button" href="${esc(email)}">${tr('Invia con email','Send by email')}${icon('arrow')}</a>`:''}<button class="button ${whatsapp||email?'secondary':''}" data-action="copy-request">${tr('Copia la richiesta','Copy enquiry')}</button><button class="button secondary" data-action="download-request">${tr('Scarica il riepilogo','Download summary')}</button></div><p class="demo-note">${whatsapp||email?tr('Il messaggio sarà inviato solo dalla tua app, con una tua azione.','The message will only be sent from your app, with your action.'):tr('Questo è un fac simile: i recapiti sono da configurare. Puoi copiare o scaricare la richiesta; nessun messaggio è stato inviato.','This is a demo: contact details have not been configured. You can copy or download your enquiry; no message has been sent.')}</p>`);
  }
  function prepareRequest(form, visit=false) {
    const data=new FormData(form),channel=String(data.get('channel'));
    if(visit&&!validSlots(String(data.get('date'))).includes(String(data.get('slot')))){notify(tr('Questo orario non è più disponibile.','This time is no longer available.'));appointment();return;}
    const subject=visit?tr('Richiesta di visita — Forma','Visit request — Forma'):tr('Richiesta di informazioni — Forma','Enquiry — Forma');
    requestText=`${subject}\n\n${tr('Nome','Name')}: ${data.get('name')}\n${tr('Canale','Channel')}: ${channel}\n${tr('Recapito','Contact')}: ${data.get('reply')}\n`;
    if(visit)requestText+=`\n${tr('Giorno richiesto','Requested date')}: ${formatDate(String(data.get('date')))}\n${tr('Orario','Time')}: ${data.get('slot')}\n\n${tr('La visita è da confermare dalla galleria.','The visit must be confirmed by the gallery.')}`;
    else requestText+=`${inquiryContext?'\n'+inquiryContext+'\n':''}${data.get('selection')?'\n'+tr('Opere','Artworks')+': '+data.get('selection')+'\n':''}\n${tr('Messaggio','Message')}: ${data.get('message')||tr('Vorrei ricevere maggiori informazioni.','I would like more information.')}`;
    showRequest(channel,subject);
  }
  function privacy() {
    open('privacy',`<p class="modal-eyebrow">${tr('PRIVACY DEL PROTOTIPO','PROTOTYPE PRIVACY')}</p><h2 id="dialog-title">${tr('Privacy e dati.','Privacy and data.')}</h2><p>${tr('Questa demo conserva sul tuo dispositivo gli identificativi delle opere salvate, la lingua e la dimensione del testo. Non richiede un account e non aggiunge strumenti di analisi o tracciamento.','This demo stores saved artwork identifiers, language and text size on your device. It does not require an account or add analytics or tracking tools.')}</p><p>${tr('I dati dei moduli restano nel browser per preparare la richiesta e non vengono salvati sul sito. Le richieste vengono inviate solo tramite le tue applicazioni, dopo una tua azione. Il servizio di hosting può trattare dati tecnici per erogare il sito.','Form data remains in your browser to prepare the enquiry and is not saved on the website. Enquiries are only sent through your applications after your action. The hosting provider may process technical data to serve the website.')}</p><p>${tr('Opere, artisti ed eventi sono dimostrativi. Per una galleria reale occorre inserire contenuti, recapiti e informativa appropriati.','Artworks, artists and events are demonstrations. A real gallery requires its own content, contact details and privacy information.')}</p><button class="button secondary" data-action="clear-data">${tr('Cancella le opere salvate','Clear saved artworks')}</button>`);
  }
  function setTextSize(large) {document.body.classList.toggle('large-text',large);const b=$('#text-size');if(b){b.setAttribute('aria-pressed',large);b.setAttribute('aria-label',large?tr('Ripristina dimensione dei testi','Reset text size'):tr('Ingrandisci i testi','Enlarge text'));}}
  document.addEventListener('click',async e=>{
    const target=e.target.closest('button,a');if(!target)return;
    if(target.dataset.lang){if(target.dataset.lang!==language){language=target.dataset.lang;persist('forma-language',language);renderShell();renderHome();route();}return;}
    if(target.id==='text-size'){const large=!document.body.classList.contains('large-text');persist('forma-large-text',large);setTextSize(large);return;}
    if(target.dataset.expand){const category=target.dataset.expand;limits[category]=Math.min(10,limits[category]+2);renderCategory(category);const next=$(`[data-expand="${category}"]`);(next.hidden?$(`[data-collapse="${category}"]`):next).focus({preventScroll:true});return;}
    if(target.dataset.collapse){limits[target.dataset.collapse]=2;renderCategory(target.dataset.collapse);$(`#collezione-${target.dataset.collapse.toLowerCase()}`).scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});$(`[data-expand="${target.dataset.collapse}"]`).focus({preventScroll:true});return;}
    if(target.dataset.eventScroll){const track=$('.event-track');track.scrollBy({left:Number(target.dataset.eventScroll)*(track.querySelector('.event-card').getBoundingClientRect().width+28),behavior:reducedMotion.matches?'instant':'smooth'});return;}
    if(target.dataset.event)return showEvent(target.dataset.event);
    if(target.dataset.eventInquiry){const event=events.find(event=>event.id===target.dataset.eventInquiry);return contactForm(null,tr('Evento: ','Event: ')+local(event.title)+' · '+eventDate(event));}
    if(target.hasAttribute('data-visit-inquiry'))return contactForm(null,tr('Vorrei concordare una visita alla collezione.','I would like to arrange a visit to the collection.'));
    if(target.dataset.view)return viewerAction(target.dataset.view);
    if(target.dataset.save)return toggleSaved(target.dataset.save);
    if(target.dataset.collageSlot!==undefined){const slot=collageSlots[Number(target.dataset.collageSlot)];const visible=collagePending?.slot===slot&&collageAnimation.currentTime>collageDuration/2?collagePending.next:slot.work;return detail(visible.id);}
    if(target.dataset.detail)return detail(target.dataset.detail);
    if(target.dataset.inquire)return contactForm(target.dataset.inquire);
    switch(target.dataset.action){
      case 'toggle-collage':collagePlaying=!collagePlaying;updatePlayback();break;
      case 'saved':renderSaved();break;
      case 'contact':contact();break;
      case 'appointment':appointment();break;
      case 'inquiry':contactForm();break;
      case 'browse':dialog.close();location.hash='opere';if(location.hash==='#opere')route();break;
      case 'privacy':privacy();break;
      case 'clear-data':saved.clear();persist('forma-saved',[]);updateSaved();notify(tr('Selezione cancellata','Selection cleared'));break;
      case 'copy-request':try{await navigator.clipboard.writeText(requestText);notify(tr('Richiesta copiata','Enquiry copied'));}catch{const range=document.createRange();range.selectNodeContents($('.request-preview'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);notify(tr('Usa Copia dal menu del dispositivo.','Use Copy from your device menu.'));}break;
      case 'download-request':{const url=URL.createObjectURL(new Blob([requestText],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=language==='en'?'forma-enquiry.txt':'richiesta-forma.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
    }
  });
  document.addEventListener('change',e=>{if(e.target.matches('[name="channel"]'))$('.reply-field',e.target.closest('form')).innerHTML=replyField(e.target.value);if(e.target.matches('#appointment-form [name="date"]'))$('#appointment-slots').innerHTML=slotMarkup(e.target.value);});
  document.addEventListener('submit',e=>{if(e.target.id==='contact-form'||e.target.id==='appointment-form'){e.preventDefault();prepareRequest(e.target,e.target.id==='appointment-form');}});
  $('.close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{dialogBody.innerHTML='';updatePlayback();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  document.addEventListener('keydown',e=>{if(dialog.open&&dialog.dataset.view==='detail'&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){if(e.key==='ArrowRight'){e.preventDefault();viewerAction('next');}if(e.key==='ArrowLeft'){e.preventDefault();viewerAction('previous');}}});
  renderShell();renderHome();route();
})();
