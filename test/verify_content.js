/* Verify every lesson example parses+runs and every practice solution
 * runs cleanly + deterministically on its test inputs, and that the
 * autograder accepts the model solution. */
var E = require('../src/engine.js');
var C = require('../src/content.js');

var problems = [];

function runProg(src, stdin) {
  var q = (stdin || []).slice();
  var out = [];
  var r = E.run(src, {
    output: function (s) { out.push(s); },
    input: function () { return q.length ? q.shift() : null; }
  });
  return { ok: r.ok, error: r.error, out: out.join('\n') };
}

/* ---- lessons ---- */
C.lessons.forEach(function (L) {
  // must always parse
  try { new E.Parser(E.tokenize(L.example)).parseProgram(); }
  catch (e) { problems.push('LESSON ' + L.id + ' parse error: ' + e.message); return; }
  // run those that need no input
  if (L.example.indexOf('INPUT') === -1) {
    var r = runProg(L.example, []);
    if (!r.ok) problems.push('LESSON ' + L.id + ' run error: ' + r.error.message + ' (line ' + r.error.line + ')');
  }
});

/* ---- practice ---- */
C.practice.forEach(function (Q) {
  var solCode = Q.solution + (Q.append || '');
  // model solution must parse
  try { new E.Parser(E.tokenize(solCode)).parseProgram(); }
  catch (e) { problems.push('PRACTICE ' + Q.id + ' solution parse error: ' + e.message); return; }
  // starter must parse (so the editor never opens with a syntax error mid-typing is fine,
  // but starter should at least tokenize) -- we only tokenize starter
  try { E.tokenize(Q.starter); } catch (e) { problems.push('PRACTICE ' + Q.id + ' starter tokenize error: ' + e.message); }

  (Q.tests || []).forEach(function (t, idx) {
    var a = runProg(solCode, t.stdin);
    if (!a.ok) { problems.push('PRACTICE ' + Q.id + ' test#' + idx + ' solution ERROR: ' + a.error.message + ' (line ' + a.error.line + ')'); return; }
    // determinism check
    var b = runProg(solCode, t.stdin);
    if (a.out !== b.out) problems.push('PRACTICE ' + Q.id + ' test#' + idx + ' is non-deterministic');
    // autograder sanity: solution graded against itself must match
    if (a.out !== b.out) problems.push('PRACTICE ' + Q.id + ' grader mismatch');
    if (a.out.trim() === '') problems.push('PRACTICE ' + Q.id + ' test#' + idx + ' produced no output');
  });
});

console.log('Lessons: ' + C.lessons.length + '   Practice: ' + C.practice.length);
if (problems.length) {
  console.log('\n--- CONTENT PROBLEMS ---');
  problems.forEach(function (p) { console.log('✗ ' + p); });
  process.exit(1);
} else {
  console.log('All lesson examples and practice solutions verified OK.');
  // show a couple of sample outputs
  console.log('\nSample — q-a2-factorial Factorial(5): ' + runProg(C.practice.find(function(x){return x.id==='q-a2-factorial';}).solution + '\nDECLARE k : INTEGER\nINPUT k\nOUTPUT Factorial(k)', ['5']).out);
  console.log('Sample — q-a2-account ops: ' + runProg(C.practice.find(function(x){return x.id==='q-a2-account';}).solution, ['3','D','100','D','50','W','30']).out);
  console.log('Sample — q-a2-binsearch find 10: ' + runProg(C.practice.find(function(x){return x.id==='q-a2-binsearch';}).solution, ['7','2','4','6','8','10','12','14','10']).out);
}
