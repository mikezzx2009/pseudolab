/* Load the built index.html in jsdom and exercise the real UI. */
var fs = require('fs');
var path = require('path');
var { JSDOM } = require('jsdom');

var html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
var jsErrors = [];
var vc = new (require('jsdom').VirtualConsole)();
vc.on('jsdomError', function (e) {
  // ignore "not implemented" for alert/confirm/prompt
  if (/Not implemented/i.test(e.message)) return;
  jsErrors.push(e.message + (e.detail ? (' :: ' + e.detail) : ''));
});

var dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'http://localhost/',
  pretendToBeVisual: true,
  virtualConsole: vc
});
var win = dom.window, doc = win.document;
win.addEventListener('error', function (e) { jsErrors.push('window.error: ' + e.message); });
// stub dialogs so confirm()==true and prompt returns ''
win.confirm = function () { return true; };
win.prompt = function () { return ''; };

function fire(el, type) { el.dispatchEvent(new win.Event(type, { bubbles: true })); }
function setEditor(textarea, value) { textarea.value = value; fire(textarea, 'input'); }

var fails = [];
function check(name, cond) { if (!cond) fails.push(name); }

setTimeout(function () {
  try {
    // ---- init / structure ----
    check('engine loaded', !!win.PseudoEngine);
    check('content loaded', !!win.PSEUDO_CONTENT);
    check('playground populated', !!doc.querySelector('#pg-editor textarea'));
    check('learn nav populated', doc.querySelectorAll('#learn-nav .nav-item').length > 0);
    check('practice nav populated', doc.querySelectorAll('#prac-nav .nav-item').length > 0);
    check('reference populated', doc.querySelectorAll('#view-reference .ref-card').length > 5);
    check('global playground editor', !!win.__playground);

    // ---- playground run ----
    var pgTa = doc.querySelector('#pg-editor textarea');
    setEditor(pgTa, 'DECLARE x : INTEGER\nx <- 6\nOUTPUT x * 7');
    doc.querySelector('#pg-run').click();
    var pgOut = doc.querySelector('#pg-console').textContent;
    check('playground produced 42', pgOut.indexOf('42') !== -1);

    // ---- interactive console: type input inline ----
    setEditor(pgTa, 'DECLARE n : INTEGER\nINPUT n\nOUTPUT n + 1');
    doc.querySelector('#pg-run').click();
    var ci = doc.querySelector('#pg-console .console-input');
    check('interactive input line appears', ci != null);
    if (ci) {
      ci.value = '99';
      ci.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      check('typed input produces 100', doc.querySelector('#pg-console').textContent.indexOf('100') !== -1);
    }

    // ---- files panel: create a file and read it ----
    var filesTab = null;
    doc.querySelectorAll('#view-editor .io-tab').forEach(function (t) { if (t.dataset.io === 'files') filesTab = t; });
    filesTab.click();
    doc.querySelector('#pg-files .btn.green').click(); // + New file
    var fName = doc.querySelector('#pg-files .file-name');
    var fBody = doc.querySelector('#pg-files .file-content');
    check('file card created', fName != null && fBody != null);
    fName.value = 'in.txt'; fire(fName, 'input');
    fBody.value = 'alpha\nbeta'; fire(fBody, 'input');
    setEditor(pgTa, 'DECLARE s : STRING\nOPENFILE "in.txt" FOR READ\nWHILE NOT EOF("in.txt")\n   READFILE "in.txt", s\n   OUTPUT UCASE(s)\nENDWHILE\nCLOSEFILE "in.txt"');
    doc.querySelector('#pg-run').click();
    var fileOut = doc.querySelector('#pg-console').textContent;
    check('reads created file -> ALPHA/BETA', fileOut.indexOf('ALPHA') !== -1 && fileOut.indexOf('BETA') !== -1);

    // ---- syntax highlight rendered ----
    check('highlight spans present', doc.querySelector('#pg-editor .hl .t-kw') != null);

    // ---- learn navigation ----
    var firstLesson = doc.querySelectorAll('#learn-nav .nav-item')[3];
    firstLesson.click();
    check('lesson content shows title', doc.querySelector('#learn-content h1') != null);
    check('lesson has example', doc.querySelector('#learn-content .example-card') != null);
    // run example inline (no-input example chosen by id)
    win.location; // noop

    // ---- practice grading: correct solution passes ----
    var q0 = win.PSEUDO_CONTENT.practice[0]; // q-ig-1 sum
    var prTa = doc.querySelector('#pr-editor textarea');
    check('practice editor exists', !!prTa);
    setEditor(prTa, q0.solution);
    doc.querySelector('#pr-check').click();
    var grade = doc.querySelector('#pr-grade').textContent;
    check('correct solution passes', /passed/i.test(grade));
    check('solved marked in nav', doc.querySelectorAll('#prac-nav .nav-item.done').length > 0);

    // ---- practice grading: wrong answer fails ----
    setEditor(prTa, 'OUTPUT "nope"');
    doc.querySelector('#pr-check').click();
    check('wrong answer fails', /failed/i.test(doc.querySelector('#pr-grade').textContent));

    // ---- practice: function question with append harness ----
    // navigate to q-as-max (Function Max) by clicking its nav item
    var navItems = doc.querySelectorAll('#prac-nav .nav-item');
    var maxItem = null;
    navItems.forEach(function (it) { if (it.dataset.id === 'q-as-max') maxItem = it; });
    if (maxItem) {
      maxItem.click();
      var maxQ = win.PSEUDO_CONTENT.practice.find(function (x) { return x.id === 'q-as-max'; });
      var prTa2 = doc.querySelector('#pr-editor textarea');
      setEditor(prTa2, maxQ.solution);
      doc.querySelector('#pr-check').click();
      check('function question (append harness) passes', /passed/i.test(doc.querySelector('#pr-grade').textContent));
    } else { fails.push('could not find q-as-max nav item'); }

    // ---- tab switching ----
    doc.querySelector('.tab[data-view="reference"]').click();
    check('reference view active', doc.querySelector('#view-reference').classList.contains('active'));

    // ---- theme toggle ----
    var before = doc.documentElement.getAttribute('data-theme');
    doc.querySelector('#themeToggle').click();
    check('theme toggled', doc.documentElement.getAttribute('data-theme') !== before);

    // ---- level filter ----
    doc.querySelector('.tab[data-view="practice"]').click();
    var chips = doc.querySelectorAll('#prac-filter .chip');
    var igChip = null; chips.forEach(function (c) { if (c.textContent === 'A2') igChip = c; });
    igChip.click();
    var lvls = {}; doc.querySelectorAll('#prac-nav .nav-item').forEach(function (it) {
      var q = win.PSEUDO_CONTENT.practice.find(function (x) { return x.id === it.dataset.id; }); lvls[q.level] = 1;
    });
    check('A2 filter shows only A2', Object.keys(lvls).length === 1 && lvls.A2);

  } catch (e) {
    fails.push('EXCEPTION: ' + e.message + '\n' + e.stack);
  }

  console.log('JS errors during load/run: ' + jsErrors.length);
  jsErrors.forEach(function (e) { console.log('  ! ' + e); });
  if (fails.length) {
    console.log('\nUI CHECK FAILURES (' + fails.length + '):');
    fails.forEach(function (f) { console.log('  ✗ ' + f); });
    process.exit(1);
  } else {
    console.log('\nAll UI checks passed ✓');
  }
}, 400);
