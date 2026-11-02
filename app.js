(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const data = window.UNDERVIA_DATA;
  const storage = {
    read(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } },
    write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private browsing can disable storage */ } }
  };
  const state = {
    words: data?.generalEnglish || [], filtered: [], selected: null,
    saved: new Set(storage.read('undervia_saved')),
    reviewed: new Set(storage.read('undervia_reviewed')),
    savedOnly: false
  };
  const grid = $('#pathGrid'), vocabView = $('#vocabView'), wordList = $('#wordList'), detail = $('#wordDetail');
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 1900);
  }
  function updateStats() {
    $('#savedCount').textContent = state.saved.size;
    $('#learnedCount').textContent = state.reviewed.size;
    $('#savedFilterCount').textContent = state.saved.size;
    const pct = Math.round(state.reviewed.size / Math.max(state.words.length, 1) * 100);
    $('#progressPercent').textContent = pct + '%'; $('#progressBar').style.width = pct + '%';
  }
  function renderPaths() {
    if (!data?.categories) { grid.innerHTML = '<p>Learning content could not be loaded.</p>'; return; }
    grid.innerHTML = data.categories.map(c => {
      const ready = c.id === 'general-english';
      return `<article class="path-card ${ready ? 'available' : 'upcoming'}" ${ready ? 'data-open-vocab role="button" tabindex="0" aria-label="Open General English vocabulary"' : 'aria-disabled="true"'}>
        <span class="path-number">${escapeHTML(c.number)} / LEARNING PATH</span><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.description)}</p>
        <div class="path-bottom"><span class="path-target">${ready ? '150 CURATED ENTRIES' : 'STRUCTURE IN DEVELOPMENT'}</span>${ready ? '<span class="path-arrow">↗</span>' : '<span class="coming">COMING NEXT</span>'}</div></article>`;
    }).join('');
  }
  function openVocab() {
    vocabView.classList.add('active'); vocabView.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderWords();
    window.setTimeout(() => $('#searchInput').focus(), 50);
  }
  function closeVocab() {
    vocabView.classList.remove('active'); vocabView.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; state.savedOnly = false;
    $('#savedFilter').classList.remove('active');
  }
  function renderWords() {
    const query = $('#searchInput').value.trim().toLowerCase();
    const level = $('#levelFilter').value, sort = $('#sortSelect').value;
    let items = state.words.filter(w =>
      (!query || [w.word, w.meaning, w.definition, w.partOfSpeech].join(' ').toLowerCase().includes(query)) &&
      (level === 'all' || w.level === level) && (!state.savedOnly || state.saved.has(w.word))
    );
    items.sort((a, b) => a.word.localeCompare(b.word)); if (sort === 'za') items.reverse();
    state.filtered = items;
    $('#resultCount').textContent = `${items.length} ${items.length === 1 ? 'WORD' : 'WORDS'}`;
    $('#vocabCounter').textContent = `${items.length} / 150 WORDS`;
    wordList.innerHTML = items.length ? items.map(w => `<button type="button" class="word-item ${state.selected === w.word ? 'selected' : ''}" data-word="${escapeHTML(w.word)}"><span><strong>${escapeHTML(w.word)}</strong><small>${escapeHTML(w.meaning)}</small></span><span class="word-level">${escapeHTML(w.level)}</span></button>`).join('') : '<div class="detail-empty"><p>No vocabulary matches your search.</p></div>';
    if (state.selected && items.some(w => w.word === state.selected)) renderDetail(state.selected);
  }
  function renderDetail(word) {
    const w = state.words.find(item => item.word === word); if (!w) return;
    state.selected = word;
    const saved = state.saved.has(w.word);
    detail.innerHTML = `<div class="detail-top"><span class="detail-level">${escapeHTML(w.level)} · GENERAL ENGLISH</span><button type="button" class="save-word ${saved ? 'saved' : ''}" id="saveWord">${saved ? '♥ Saved' : '♡ Save word'}</button></div>
      <h2 class="detail-word">${escapeHTML(w.word)}</h2><div class="detail-pron">${w.ipa ? escapeHTML(w.ipa) + ' · ' : ''}${w.pronunciation ? escapeHTML(w.pronunciation) + ' · ' : ''}${escapeHTML(w.partOfSpeech)}</div>
      <div class="detail-section"><h4>ENGLISH DEFINITION</h4><p>${escapeHTML(w.definition)}</p><p class="translation">${escapeHTML(w.meaning)}</p></div>
      <div class="detail-section"><h4>EXAMPLE SENTENCE</h4><p>${escapeHTML(w.example)}</p><p class="translation">${escapeHTML(w.exampleTranslation)}</p></div>
      <div class="detail-section"><h4>SYNONYMS</h4><div class="detail-tags">${w.synonyms?.length ? w.synonyms.map(x => `<span>${escapeHTML(x)}</span>`).join('') : '<span>—</span>'}</div></div>
      ${w.antonyms?.length ? `<div class="detail-section"><h4>ANTONYMS</h4><div class="detail-tags">${w.antonyms.map(x => `<span>${escapeHTML(x)}</span>`).join('')}</div></div>` : ''}
      ${w.usage ? `<div class="detail-section"><h4>USAGE NOTE</h4><p class="usage-note">${escapeHTML(w.usage)}</p></div>` : ''}`;
    $$('.word-item', wordList).forEach(btn => btn.classList.toggle('selected', btn.dataset.word === word));
    $('#saveWord').addEventListener('click', () => toggleSave(w.word));
  }
  function selectWord(word) {
    if (!state.words.some(w => w.word === word)) return;
    state.reviewed.add(word); storage.write('undervia_reviewed', [...state.reviewed]); updateStats(); renderDetail(word);
  }
  function toggleSave(word) {
    if (state.saved.has(word)) { state.saved.delete(word); toast('Removed from saved vocabulary.'); }
    else { state.saved.add(word); toast('Word saved to your collection.'); }
    storage.write('undervia_saved', [...state.saved]); updateStats(); renderWords();
  }
  // One delegated handler keeps dynamically-rendered cards and word buttons clickable.
  document.addEventListener('click', event => {
    const open = event.target.closest('[data-open-vocab]');
    if (open) { event.preventDefault(); openVocab(); return; }
    const word = event.target.closest('[data-word]');
    if (word) { selectWord(word.dataset.word); return; }
  });
  document.addEventListener('keydown', event => {
    const open = event.target.closest('[data-open-vocab]');
    if (open && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openVocab(); }
    if (event.key === 'Escape' && vocabView.classList.contains('active')) closeVocab();
  });
  $('#backHome').addEventListener('click', closeVocab);
  $('#searchInput').addEventListener('input', renderWords);
  $('#levelFilter').addEventListener('change', renderWords);
  $('#sortSelect').addEventListener('change', renderWords);
  $('#savedFilter').addEventListener('click', () => {
    state.savedOnly = !state.savedOnly; $('#savedFilter').classList.toggle('active', state.savedOnly); renderWords();
  });
  $('#menuToggle').addEventListener('click', () => {
    const open = $('#mainNav').classList.toggle('open'); $('#menuToggle').setAttribute('aria-expanded', String(open));
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => $('#mainNav').classList.remove('open')));
  $('#year').textContent = new Date().getFullYear();
  if (!state.words.length) { grid.innerHTML = '<p>Vocabulary data is missing. Make sure data.js is uploaded with the website.</p>'; }
  else { renderPaths(); renderWords(); updateStats(); }
})();
