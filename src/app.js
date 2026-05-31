/* ===================== PseudoLab front-end ===================== */
(function () {
  'use strict';
  var E = window.PseudoEngine;
  var C = window.PSEUDO_CONTENT;
  var LS = window.localStorage;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var ce = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------------- syntax highlighter (display only) ---------------- */
  var HL_KW = ['DECLARE','CONSTANT','ARRAY','OF','IF','THEN','ELSE','ENDIF','CASE','OTHERWISE','ENDCASE',
    'FOR','TO','STEP','NEXT','WHILE','DO','ENDWHILE','REPEAT','UNTIL','PROCEDURE','ENDPROCEDURE','FUNCTION',
    'RETURNS','RETURN','ENDFUNCTION','CALL','BYREF','BYVAL','INPUT','OUTPUT','PRINT','TYPE','ENDTYPE','SET',
    'DEFINE','DIV','MOD','AND','OR','NOT','OPENFILE','READFILE','WRITEFILE','CLOSEFILE','SEEK','GETRECORD',
    'PUTRECORD','CLASS','ENDCLASS','INHERITS','PUBLIC','PRIVATE','NEW','SUPER','FOR','READ','WRITE','APPEND','RANDOM'];
  var HL_TYPE = ['INTEGER','REAL','CHAR','STRING','BOOLEAN','DATE'];
  var HL_FN = ['LENGTH','LEFT','RIGHT','MID','SUBSTRING','UCASE','LCASE','TO_UPPER','TO_LOWER','ASC','CHR',
    'INT','ROUND','RAND','RANDOM','DIV','MOD','EOF','NUM_TO_STR','STR_TO_NUM'];
  var KWset = {}, TYset = {}, FNset = {};
  HL_KW.forEach(function (k) { KWset[k] = 1; });
  HL_TYPE.forEach(function (k) { TYset[k] = 1; });
  HL_FN.forEach(function (k) { FNset[k] = 1; });

  function highlight(code) {
    var out = '', i = 0, n = code.length;
    function isW(c) { return /[A-Za-z0-9_]/.test(c); }
    while (i < n) {
      var c = code[i];
      // comment
      if (c === '/' && code[i + 1] === '/') {
        var j = i; while (j < n && code[j] !== '\n') j++;
        out += '<span class="t-com">' + esc(code.slice(i, j)) + '</span>'; i = j; continue;
      }
      // string
      if (c === '"') {
        var k = i + 1; while (k < n && code[k] !== '"' && code[k] !== '\n') k++;
        if (code[k] === '"') k++;
        out += '<span class="t-str">' + esc(code.slice(i, k)) + '</span>'; i = k; continue;
      }
      // char
      if (c === "'") {
        var m = i + 1; while (m < n && code[m] !== "'" && code[m] !== '\n') m++;
        if (code[m] === "'") m++;
        out += '<span class="t-str">' + esc(code.slice(i, m)) + '</span>'; i = m; continue;
      }
      // number
      if (c >= '0' && c <= '9') {
        var p = i; while (p < n && /[0-9.]/.test(code[p])) p++;
        out += '<span class="t-num">' + esc(code.slice(i, p)) + '</span>'; i = p; continue;
      }
      // word
      if (/[A-Za-z_]/.test(c)) {
        var q = i; while (q < n && isW(code[q])) q++;
        var w = code.slice(i, q), up = w.toUpperCase();
        // peek next non-space for '(' to detect function calls
        var r = q; while (r < n && code[r] === ' ') r++;
        var cls = '';
        if (up === 'TRUE' || up === 'FALSE') cls = 't-bool';
        else if (TYset[up]) cls = 't-type';
        else if (KWset[up]) cls = 't-kw';
        else if (FNset[up] && code[r] === '(') cls = 't-fn';
        else if (code[r] === '(') cls = 't-fn';
        out += cls ? '<span class="' + cls + '">' + esc(w) + '</span>' : esc(w);
        i = q; continue;
      }
      // assignment <- or <--
      if (c === '<' && code[i + 1] === '-') {
        var len = code[i + 2] === '-' ? 3 : 2;
        out += '<span class="t-op">' + esc(code.substr(i, len)) + '</span>'; i += len; continue;
      }
      if ('+-*/=<>&^:.,()[]'.indexOf(c) !== -1) {
        out += '<span class="t-op">' + esc(c) + '</span>'; i++; continue;
      }
      out += esc(c); i++;
    }
    return out + '\n';
  }

  /* ---------------- code editor widget ---------------- */
  function CodeEditor(host, opts) {
    opts = opts || {};
    this.host = host;
    host.classList.add('editor');
    host.innerHTML = '';
    this.gutter = ce('div', 'gutter');
    this.wrap = ce('div', 'code-wrap');
    this.pre = ce('pre', 'hl'); this.code = ce('code'); this.pre.appendChild(this.code);
    this.ta = ce('textarea'); this.ta.setAttribute('spellcheck', 'false');
    this.ta.setAttribute('wrap', 'off'); this.ta.setAttribute('autocapitalize', 'off');
    this.ta.setAttribute('autocomplete', 'off'); this.ta.setAttribute('autocorrect', 'off');
    if (opts.placeholder) this.ta.placeholder = opts.placeholder;
    this.wrap.appendChild(this.pre); this.wrap.appendChild(this.ta);
    host.appendChild(this.gutter); host.appendChild(this.wrap);
    this.onRun = opts.onRun; this.onChange = opts.onChange;
    var self = this;
    this.ta.addEventListener('input', function () { self.render(); if (self.onChange) self.onChange(self.getValue()); });
    this.ta.addEventListener('scroll', function () {
      self.pre.scrollTop = self.ta.scrollTop; self.pre.scrollLeft = self.ta.scrollLeft;
      self.gutter.scrollTop = self.ta.scrollTop;
    });
    this.ta.addEventListener('keydown', function (e) { self.onKey(e); });
    this.setValue(opts.value || '');
  }
  CodeEditor.prototype.getValue = function () { return this.ta.value; };
  CodeEditor.prototype.setValue = function (v) { this.ta.value = v; this.render(); };
  CodeEditor.prototype.focus = function () { this.ta.focus(); };
  CodeEditor.prototype.render = function () {
    var v = this.ta.value;
    this.code.innerHTML = highlight(v);
    var lines = v.split('\n').length;
    var g = ''; for (var i = 1; i <= lines; i++) g += i + '\n';
    this.gutter.textContent = g;
    this.pre.scrollTop = this.ta.scrollTop; this.pre.scrollLeft = this.ta.scrollLeft;
  };
  CodeEditor.prototype.onKey = function (e) {
    var ta = this.ta;
    // run shortcut
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); if (this.onRun) this.onRun(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      var s = ta.selectionStart, en = ta.selectionEnd, val = ta.value;
      if (s !== en && val.slice(s, en).indexOf('\n') !== -1) {
        // indent selected lines
        var ls = val.lastIndexOf('\n', s - 1) + 1;
        var block = val.slice(ls, en);
        var indented = block.replace(/^/gm, '   ');
        ta.value = val.slice(0, ls) + indented + val.slice(en);
        ta.selectionStart = s + 3; ta.selectionEnd = en + (indented.length - block.length);
      } else {
        ta.value = val.slice(0, s) + '   ' + val.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 3;
      }
      this.render(); if (this.onChange) this.onChange(this.getValue()); return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      var p = ta.selectionStart, value = ta.value;
      var lineStart = value.lastIndexOf('\n', p - 1) + 1;
      var line = value.slice(lineStart, p);
      var indent = (line.match(/^\s*/) || [''])[0];
      var trimmed = line.trim().toUpperCase();
      var extra = '';
      if (/\bTHEN$/.test(trimmed) || trimmed === 'ELSE' || /\bDO$/.test(trimmed) || trimmed === 'REPEAT' ||
          /^FOR\b/.test(trimmed) || /^WHILE\b/.test(trimmed) || /^PROCEDURE\b/.test(trimmed) ||
          /^FUNCTION\b/.test(trimmed) || /^CASE OF\b/.test(trimmed) || /^CLASS\b/.test(trimmed) ||
          /^TYPE\b/.test(trimmed) || trimmed.indexOf('OTHERWISE') === 0 || /:$/.test(trimmed)) extra = '   ';
      var ins = '\n' + indent + extra;
      ta.value = value.slice(0, p) + ins + value.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = p + ins.length;
      this.render(); if (this.onChange) this.onChange(this.getValue());
      ta.scrollTop = ta.scrollTop; this.pre.scrollTop = ta.scrollTop; return;
    }
  };

  /* ---------------- runner ---------------- */
  function parseFiles(text) {
    var files = {}, cur = null, lines = (text || '').split('\n');
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/^###\s+(.+?)\s*$/);
      if (m) { cur = m[1]; files[cur] = []; }
      else if (cur != null) files[cur].push(lines[i]);
    }
    var out = {}; for (var k in files) if (files.hasOwnProperty(k)) out[k] = files[k].join('\n');
    return out;
  }
  function inputQueue(text) {
    if (text == null || text === '') return [];
    return text.replace(/\n$/, '').split('\n');
  }
  function execute(source, stdinText, filesText) {
    var q = inputQueue(stdinText);
    var events = [];
    var r = E.run(source, {
      output: function (s) { events.push({ kind: 'out', text: s }); },
      input: function () { return q.length ? q.shift() : null; },
      files: parseFiles(filesText),
      maxSteps: 1500000
    });
    if (!r.ok && r.error) events.push({ kind: 'err', text: 'Error' + (r.error.line ? ' (line ' + r.error.line + ')' : '') + ': ' + r.error.message });
    return { ok: r.ok, events: events, error: r.error };
  }
  function renderConsole(pre, events, footer) {
    pre.innerHTML = '';
    var frag = document.createDocumentFragment();
    events.forEach(function (ev) {
      if (ev.kind === 'err') { var s = ce('span', 'ln-err'); s.textContent = ev.text; frag.appendChild(s); frag.appendChild(document.createTextNode('\n')); }
      else if (ev.kind === 'info') { var s2 = ce('span', 'ln-info'); s2.textContent = ev.text; frag.appendChild(s2); frag.appendChild(document.createTextNode('\n')); }
      else { frag.appendChild(document.createTextNode(ev.text + '\n')); }
    });
    if (footer) { var f = ce('span', 'ln-info'); f.textContent = footer; frag.appendChild(f); }
    pre.appendChild(frag);
    pre.scrollTop = pre.scrollHeight;
  }
  function gradeNormalize(text) {
    return text.split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/\n+$/, '');
  }
  function outputText(events) { return events.filter(function (e) { return e.kind === 'out'; }).map(function (e) { return e.text; }).join('\n'); }

  /* ---------------- tab switching ---------------- */
  function switchView(name) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].dataset.view === name);
    ['editor', 'learn', 'practice', 'reference'].forEach(function (v) {
      $('#view-' + v).classList.toggle('active', v === name);
    });
    if (name === 'editor' && window.__playground) window.__playground.focus();
  }

  /* ============================ PLAYGROUND ============================ */
  var DEFAULT_CODE =
    '// Welcome to PseudoLab — a CIE pseudocode editor.\n' +
    '// Press  Run ▶  (or Ctrl/Cmd + Enter) to execute.\n\n' +
    'DECLARE Name : STRING\n' +
    'OUTPUT "What is your name?"\n' +
    'INPUT Name\n' +
    'OUTPUT "Hello, ", Name, "! Let\'s learn pseudocode."\n\n' +
    'DECLARE i : INTEGER\n' +
    'FOR i <- 1 TO 5\n' +
    '   OUTPUT i, " squared is ", i * i\n' +
    'NEXT i';

  function buildPlayground() {
    var view = $('#view-editor');
    view.innerHTML =
      '<div class="split">' +
        '<div class="left">' +
          '<div class="toolbar">' +
            '<button class="btn primary" id="pg-run">▶ Run</button>' +
            '<button class="btn ghost" id="pg-clear">Clear output</button>' +
            '<select class="btn" id="pg-examples"><option value="">Load example…</option></select>' +
            '<span class="spacer"></span>' +
            '<button class="btn ghost" id="pg-reset" title="Reset to the welcome program">Reset</button>' +
          '</div>' +
          '<div class="editor-shell" style="flex:1; min-height:0;"><div id="pg-editor" style="flex:1;min-height:0;"></div></div>' +
        '</div>' +
        '<div class="right">' +
          '<div class="io-tabs">' +
            '<button class="io-tab active" data-io="out">Output</button>' +
            '<button class="io-tab" data-io="in">Input</button>' +
            '<button class="io-tab" data-io="files">Files</button>' +
          '</div>' +
          '<div class="io-panel active" data-io="out"><pre class="console" id="pg-console"></pre></div>' +
          '<div class="io-panel" data-io="in">' +
            '<div class="io-hint">One value per line. Each <code>INPUT</code> reads the next line in order.</div>' +
            '<textarea class="io-area" id="pg-input" placeholder="e.g.\nAlice\n42"></textarea>' +
          '</div>' +
          '<div class="io-panel" data-io="files">' +
            '<div class="io-hint">Define virtual files for <code>OPENFILE … FOR READ</code>. Start each file with <code>### filename</code>.</div>' +
            '<textarea class="io-area" id="pg-files" placeholder="### data.txt\nfirst line\nsecond line"></textarea>' +
          '</div>' +
        '</div>' +
      '</div>';

    var saved = LS.getItem('pg.code');
    var editor = new CodeEditor($('#pg-editor'), {
      value: saved != null ? saved : DEFAULT_CODE,
      onRun: runPg,
      onChange: function (v) { LS.setItem('pg.code', v); }
    });
    window.__playground = editor;

    var savedIn = LS.getItem('pg.input'); if (savedIn != null) $('#pg-input').value = savedIn;
    var savedFiles = LS.getItem('pg.files'); if (savedFiles != null) $('#pg-files').value = savedFiles;
    $('#pg-input').addEventListener('input', function () { LS.setItem('pg.input', this.value); });
    $('#pg-files').addEventListener('input', function () { LS.setItem('pg.files', this.value); });

    // io tab switching
    view.querySelectorAll('.io-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        view.querySelectorAll('.io-tab').forEach(function (x) { x.classList.toggle('active', x === t); });
        view.querySelectorAll('.io-panel').forEach(function (p) { p.classList.toggle('active', p.dataset.io === t.dataset.io); });
      });
    });

    // examples dropdown
    var sel = $('#pg-examples');
    ['AS', 'A2'].forEach(function (lvl) {
      var og = ce('optgroup'); og.label = lvl + ' examples';
      C.lessons.filter(function (l) { return l.level === lvl; }).forEach(function (l) {
        var o = ce('option'); o.value = l.id; o.textContent = l.topic + ' — ' + l.title; og.appendChild(o);
      });
      sel.appendChild(og);
    });
    sel.addEventListener('change', function () {
      var l = C.lessons.find(function (x) { return x.id === sel.value; });
      if (l) { editor.setValue(l.example); LS.setItem('pg.code', l.example); editor.focus(); }
      sel.value = '';
    });

    function runPg() {
      var res = execute(editor.getValue(), $('#pg-input').value, $('#pg-files').value);
      // switch to output panel
      view.querySelectorAll('.io-tab').forEach(function (x) { x.classList.toggle('active', x.dataset.io === 'out'); });
      view.querySelectorAll('.io-panel').forEach(function (p) { p.classList.toggle('active', p.dataset.io === 'out'); });
      renderConsole($('#pg-console'), res.events, res.ok ? '▸ finished' : '▸ stopped with an error');
    }
    $('#pg-run').addEventListener('click', runPg);
    $('#pg-clear').addEventListener('click', function () { $('#pg-console').innerHTML = ''; });
    $('#pg-reset').addEventListener('click', function () {
      if (confirm('Reset the editor to the welcome program?')) { editor.setValue(DEFAULT_CODE); LS.setItem('pg.code', DEFAULT_CODE); }
    });
  }

  function loadIntoPlayground(code, run) {
    window.__playground.setValue(code);
    LS.setItem('pg.code', code);
    switchView('editor');
    if (run) $('#pg-run').click();
    else window.__playground.focus();
  }

  /* ============================ LEARN ============================ */
  var learnState = { level: 'All', current: null };
  function buildLearn() {
    var view = $('#view-learn');
    view.innerHTML =
      '<div class="with-sidebar">' +
        '<div class="sidebar">' +
          '<div class="level-filter" id="learn-filter"></div>' +
          '<div id="learn-nav"></div>' +
        '</div>' +
        '<div class="content-pane"><div class="content-inner" id="learn-content"></div></div>' +
      '</div>';
    buildLevelFilter($('#learn-filter'), learnState, renderLearnNav);
    renderLearnNav();
    // open first lesson
    var first = filteredLessons()[0];
    if (first) showLesson(first.id);
  }
  function filteredLessons() {
    return C.lessons.filter(function (l) { return learnState.level === 'All' || l.level === learnState.level; });
  }
  function renderLearnNav() {
    var nav = $('#learn-nav'); nav.innerHTML = '';
    ['AS', 'A2'].forEach(function (lvl) {
      if (learnState.level !== 'All' && learnState.level !== lvl) return;
      var items = C.lessons.filter(function (l) { return l.level === lvl; });
      if (!items.length) return;
      var g = ce('div', 'lesson-group'); g.appendChild(ce('h4', null, lvl + ' Level'));
      items.forEach(function (l) {
        var it = ce('div', 'nav-item'); it.dataset.id = l.id;
        it.innerHTML = esc(l.title) + '<span class="topic">' + esc(l.topic) + '</span>';
        if (learnState.current === l.id) it.classList.add('active');
        it.addEventListener('click', function () { showLesson(l.id); });
        g.appendChild(it);
      });
      nav.appendChild(g);
    });
  }
  function showLesson(id) {
    var l = C.lessons.find(function (x) { return x.id === id; });
    if (!l) return;
    learnState.current = id;
    renderLearnNav();
    var box = $('#learn-content');
    box.innerHTML =
      '<div class="eyebrow">' + esc(l.level) + ' · ' + esc(l.topic) + '</div>' +
      '<h1>' + esc(l.title) + '</h1>' +
      '<div class="lesson-body">' + l.html + '</div>' +
      '<div class="example-card">' +
        '<div class="ec-head"><span>EXAMPLE</span><div>' +
          '<button class="btn ghost" id="ex-run">▶ Run example</button> ' +
          '<button class="btn ghost" id="ex-open">Open in Playground</button>' +
        '</div></div>' +
        '<pre class="code-block"><code>' + highlight(l.example) + '</code></pre>' +
        '<div class="io-panel active" style="display:none" id="ex-out-wrap"><pre class="console" id="ex-console" style="border-top:1px solid var(--border)"></pre></div>' +
      '</div>';
    box.scrollTop = 0;
    $('#ex-open').addEventListener('click', function () { loadIntoPlayground(l.example, false); });
    $('#ex-run').addEventListener('click', function () {
      var needsInput = l.example.indexOf('INPUT') !== -1;
      var stdin = '';
      if (needsInput) { stdin = prompt('This example uses INPUT. Enter input values separated by commas (or leave blank):', '') || ''; stdin = stdin.split(',').join('\n'); }
      var res = execute(l.example, stdin, '');
      $('#ex-out-wrap').style.display = 'flex';
      renderConsole($('#ex-console'), res.events, res.ok ? '▸ finished' : '▸ error');
    });
  }

  /* ============================ PRACTICE ============================ */
  var pracState = { level: 'All', current: null, editor: null };
  function solvedSet() { try { return JSON.parse(LS.getItem('pr.solved') || '{}'); } catch (e) { return {}; } }
  function markSolved(id) { var s = solvedSet(); s[id] = 1; LS.setItem('pr.solved', JSON.stringify(s)); }

  function buildPractice() {
    var view = $('#view-practice');
    view.innerHTML =
      '<div class="with-sidebar">' +
        '<div class="sidebar">' +
          '<div class="level-filter" id="prac-filter"></div>' +
          '<div id="prac-nav"></div>' +
        '</div>' +
        '<div class="content-pane"><div class="content-inner" id="prac-content"></div></div>' +
      '</div>';
    buildLevelFilter($('#prac-filter'), pracState, renderPracNav);
    renderPracNav();
    var first = C.practice.filter(function (q) { return pracState.level === 'All' || q.level === pracState.level; })[0];
    if (first) showQuestion(first.id);
  }
  function renderPracNav() {
    var nav = $('#prac-nav'); nav.innerHTML = '';
    var solved = solvedSet();
    ['AS', 'A2'].forEach(function (lvl) {
      if (pracState.level !== 'All' && pracState.level !== lvl) return;
      var items = C.practice.filter(function (q) { return q.level === lvl; });
      if (!items.length) return;
      var g = ce('div', 'lesson-group'); g.appendChild(ce('h4', null, lvl + ' Level'));
      items.forEach(function (q) {
        var it = ce('div', 'nav-item'); it.dataset.id = q.id;
        it.innerHTML = esc(q.title) + '<span class="topic">' + esc(q.topic) + '</span>';
        if (solved[q.id]) it.classList.add('done');
        if (pracState.current === q.id) it.classList.add('active');
        it.addEventListener('click', function () { showQuestion(q.id); });
        g.appendChild(it);
      });
      nav.appendChild(g);
    });
  }
  function saveAttempt(id, code) { var a = {}; try { a = JSON.parse(LS.getItem('pr.attempts') || '{}'); } catch (e) {} a[id] = code; LS.setItem('pr.attempts', JSON.stringify(a)); }
  function getAttempt(id) { try { return (JSON.parse(LS.getItem('pr.attempts') || '{}'))[id]; } catch (e) { return null; } }

  function showQuestion(id) {
    var q = C.practice.find(function (x) { return x.id === id; });
    if (!q) return;
    pracState.current = id;
    renderPracNav();
    var box = $('#prac-content');
    box.innerHTML =
      '<div class="q-meta"><span class="badge">' + esc(q.level) + '</span><span class="badge">' + esc(q.topic) + '</span></div>' +
      '<h1>' + esc(q.title) + '</h1>' +
      '<div class="q-prompt">' + q.prompt + '</div>' +
      '<div class="toolbar" style="background:transparent;border:none;padding:0 0 10px 0">' +
        '<button class="btn primary" id="pr-check">✓ Check answer</button>' +
        '<button class="btn" id="pr-run">▶ Run</button>' +
        '<button class="btn ghost" id="pr-hint">💡 Hint</button>' +
        '<button class="btn ghost" id="pr-sol">Show solution</button>' +
        '<button class="btn ghost" id="pr-reset">Reset</button>' +
      '</div>' +
      '<div class="practice-editor-wrap"><div id="pr-editor" style="flex:1;min-height:0;"></div></div>' +
      '<div class="io-tabs" style="margin-top:10px;border:1px solid var(--border);border-bottom:none;border-radius:8px 8px 0 0">' +
        '<button class="io-tab active" data-pio="out">Output</button>' +
        '<button class="io-tab" data-pio="in">Input (for manual Run)</button>' +
      '</div>' +
      '<div class="pio-panel" data-pio="out" style="border:1px solid var(--border);border-radius:0 0 8px 8px"><pre class="console" id="pr-console" style="max-height:200px"></pre></div>' +
      '<div class="pio-panel" data-pio="in" style="display:none;border:1px solid var(--border);border-radius:0 0 8px 8px"><textarea class="io-area" id="pr-input" style="min-height:120px" placeholder="One value per line"></textarea></div>' +
      '<div class="hint-box" id="pr-hintbox">' + esc(q.hint || 'Think about which construct fits, then build it step by step.') + '</div>' +
      '<div class="solution-box" id="pr-solbox"><strong>Model solution</strong><pre><code>' + highlight(q.solution) + '</code></pre></div>' +
      '<div class="grade-result" id="pr-grade"></div>';
    box.scrollTop = 0;

    var attempt = getAttempt(id);
    pracState.editor = new CodeEditor($('#pr-editor'), {
      value: attempt != null ? attempt : q.starter,
      onRun: doRun,
      onChange: function (v) { saveAttempt(id, v); }
    });

    box.querySelectorAll('.io-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        box.querySelectorAll('.io-tab').forEach(function (x) { x.classList.toggle('active', x === t); });
        box.querySelectorAll('.pio-panel').forEach(function (p) { p.style.display = (p.dataset.pio === t.dataset.pio) ? 'block' : 'none'; });
      });
    });

    function doRun() {
      var res = execute(pracState.editor.getValue() + (q.append || ''), $('#pr-input').value, '');
      renderConsole($('#pr-console'), res.events, res.ok ? '▸ finished' : '▸ error');
    }
    $('#pr-run').addEventListener('click', doRun);
    $('#pr-hint').addEventListener('click', function () { $('#pr-hintbox').classList.toggle('show'); });
    $('#pr-sol').addEventListener('click', function () {
      var sb = $('#pr-solbox');
      if (!sb.classList.contains('show')) { if (!confirm('Reveal the model solution?')) return; }
      sb.classList.toggle('show');
    });
    $('#pr-reset').addEventListener('click', function () {
      if (confirm('Reset your code to the starter?')) { pracState.editor.setValue(q.starter); saveAttempt(id, q.starter); }
    });
    $('#pr-check').addEventListener('click', function () { gradeQuestion(q); });
  }

  function gradeQuestion(q) {
    var userCode = pracState.editor.getValue() + (q.append || '');
    var solCode = q.solution + (q.append || '');
    var tests = q.tests || [];
    var grade = $('#pr-grade');
    if (!tests.length) {
      grade.className = 'grade-result show';
      grade.innerHTML = '<div class="grade-banner ok">This task is open-ended — compare your output with the model solution.</div>';
      return;
    }
    var rows = '', allPass = true, firstFail = null;
    for (var i = 0; i < tests.length; i++) {
      var t = tests[i];
      var exp = execute(solCode, (t.stdin || []).join('\n'), '');
      var act = execute(userCode, (t.stdin || []).join('\n'), '');
      var expOut = gradeNormalize(outputText(exp.events));
      var actOut = act.ok ? gradeNormalize(outputText(act.events)) : '__ERROR__';
      var ok = act.ok && expOut === actOut;
      if (!ok && !firstFail) firstFail = { t: t, exp: expOut, act: act.ok ? actOut : ('(error) ' + (act.error ? act.error.message : '')), inp: (t.stdin || []).join(', ') };
      if (!ok) allPass = false;
      rows += '<div class="case-row"><span class="' + (ok ? 'res-ok' : 'res-bad') + '">' + (ok ? '✓ PASS' : '✗ FAIL') + '</span>' +
        '<span style="color:var(--text-faint)">input:</span> <span>' + esc((t.stdin || []).join(', ') || '(none)') + '</span></div>';
    }
    grade.className = 'grade-result show';
    var banner = allPass
      ? '<div class="grade-banner ok">🎉 All ' + tests.length + ' test cases passed. Well done!</div>'
      : '<div class="grade-banner bad">Not yet — ' + (tests.filter ? '' : '') + 'some test cases failed.</div>';
    var diff = '';
    if (!allPass && firstFail) {
      diff = '<div class="diff-box"><div class="lbl">First failing case — input: ' + esc(firstFail.inp || '(none)') + '</div>' +
        '<div class="lbl" style="margin-top:6px">Expected output:</div>' + esc(firstFail.exp || '(empty)') +
        '<div class="lbl" style="margin-top:6px">Your output:</div>' + esc(firstFail.act || '(empty)') + '</div>';
    }
    grade.innerHTML = banner + '<div class="grade-cases">' + rows + diff + '</div>';
    if (allPass) { markSolved(q.id); renderPracNav(); }
  }

  /* ============================ REFERENCE ============================ */
  function buildReference() {
    var view = $('#view-reference');
    var cards = [
      { h: 'Data types', rows: [['INTEGER', 'whole number, e.g. 5, -3'], ['REAL', 'fractional, e.g. 4.7, -0.5'], ['CHAR', "single char 'A'"], ['STRING', 'text "hello"'], ['BOOLEAN', 'TRUE / FALSE'], ['DATE', 'dd/mm/yyyy (A Level)']] },
      { h: 'Assignment & I/O', rows: [['x <- v', 'assign (← )'], ['DECLARE x : T', 'declare variable'], ['CONSTANT k = v', 'constant'], ['INPUT x', 'read a value'], ['OUTPUT a, b', 'print values']] },
      { h: 'Operators', rows: [['+  -  *  /', 'arithmetic ( / → REAL )'], ['DIV  MOD', 'integer ÷ and remainder'], ['=  <>  <  <=  >  >=', 'comparison → BOOLEAN'], ['AND  OR  NOT', 'logic'], ['&', 'string concatenation']] },
      { h: 'Selection', rows: [['IF…THEN…ELSE…ENDIF', 'two-way choice'], ['CASE OF x … ENDCASE', 'multi-way'], ['v1 TO v2 :', 'range in CASE'], ['OTHERWISE :', 'default branch']] },
      { h: 'Iteration', rows: [['FOR i <- a TO b … NEXT i', 'count-controlled'], ['STEP n', 'increment (may be -)'], ['WHILE c [DO] … ENDWHILE', 'pre-condition'], ['REPEAT … UNTIL c', 'post-condition']] },
      { h: 'Subroutines', rows: [['PROCEDURE p(...) … ENDPROCEDURE', 'no return'], ['CALL p(...)', 'call procedure'], ['FUNCTION f(...) RETURNS T', 'returns a value'], ['RETURN v', 'return from function'], ['BYREF / BYVAL', 'parameter passing']] },
      { h: 'String functions', rows: [['LENGTH(s)', 'number of chars'], ['LEFT(s,n) / RIGHT(s,n)', 'n chars from start / end'], ['MID(s,p,n)', 'n chars from position p'], ['UCASE(x) / LCASE(x)', 'change case'], ['s[p]', 'char at position p (from 1)']] },
      { h: 'Numeric functions', rows: [['INT(x)', 'integer part (truncate)'], ['STRING_TO_NUM(s)', 'string → number'], ['ASC(c) / CHR(n)', 'char ↔ ASCII code'], ['x DIV y / x MOD y', 'integer ÷ and remainder'], ['RAND(x)', '0 ≤ r < x']] },
      { h: 'Arrays & records', rows: [['ARRAY[1:n] OF T', '1-D array'], ['ARRAY[1:r,1:c] OF T', '2-D array'], ['TYPE R … ENDTYPE', 'record'], ['x.field', 'field access'], ['TYPE C = (A,B,C)', 'enumerated']] },
      { h: 'File handling', rows: [['OPENFILE "f" FOR READ', 'text: open to read'], ['READFILE / WRITEFILE', 'read / write a line'], ['EOF("f")', 'end of file?'], ['OPENFILE "f" FOR RANDOM', 'random-access file'], ['SEEK / GETRECORD / PUTRECORD', 'direct record access']] },
      { h: 'OOP (A2)', rows: [['CLASS C … ENDCLASS', 'define class'], ['PROCEDURE NEW(...)', 'constructor'], ['o <- NEW C(...)', 'create object'], ['CLASS D INHERITS C', 'inheritance'], ['SUPER.NEW(...)', 'parent constructor']] },
      { h: 'AS vs A2 topics', rows: [['AS', 'constructs, arrays, records'], ['AS', 'text files, procedures/functions'], ['A2', 'recursion'], ['A2', 'ADTs: stack/queue/list/tree'], ['A2', 'random files, OOP']] }
    ];
    var html = '<div class="content-inner" style="max-width:1100px"><div class="eyebrow">Quick reference</div><h1>Pseudocode Cheat-Sheet</h1>' +
      '<p style="color:var(--text-dim)">Cambridge International AS &amp; A Level Computer Science (9618) pseudocode.</p><div class="ref-grid">';
    cards.forEach(function (c) {
      html += '<div class="ref-card"><h3>' + esc(c.h) + '</h3><table>';
      c.rows.forEach(function (r) { html += '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; });
      html += '</table></div>';
    });
    html += '</div></div>';
    view.innerHTML = html;
  }

  /* ---------------- shared: level filter ---------------- */
  function buildLevelFilter(host, state, onChange) {
    host.innerHTML = '';
    ['All', 'AS', 'A2'].forEach(function (lvl) {
      var c = ce('button', 'chip' + (state.level === lvl ? ' active' : '')); c.textContent = lvl;
      c.addEventListener('click', function () {
        state.level = lvl;
        host.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('active', x.textContent === lvl); });
        onChange();
      });
      host.appendChild(c);
    });
  }

  /* ---------------- theme ---------------- */
  function initTheme() {
    var t = LS.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
    $('#themeToggle').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur); LS.setItem('theme', cur);
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    initTheme();
    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () { switchView(t.dataset.view); });
    });
    buildPlayground();
    buildLearn();
    buildPractice();
    buildReference();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
