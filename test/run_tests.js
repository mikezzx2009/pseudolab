/* Node test harness for the PseudoLab engine */
var E = require('../src/engine.js');

var pass = 0, fail = 0;
var failures = [];

function runWith(src, inputs, files) {
  var q = (inputs || []).slice();
  var out = [];
  var r = E.run(src, {
    output: function (s) { out.push(s); },
    input: function () { return q.length ? q.shift() : null; },
    files: files || {}
  });
  return { r: r, out: out };
}

function test(name, src, expected, inputs, files) {
  var res;
  try { res = runWith(src, inputs, files); }
  catch (e) { fail++; failures.push(name + '  -> THREW: ' + e.message); return; }
  if (!res.r.ok) { fail++; failures.push(name + '  -> ERROR: ' + (res.r.error && res.r.error.message) + ' (line ' + (res.r.error && res.r.error.line) + ')'); return; }
  var got = res.out.join('\n');
  if (got === expected) { pass++; }
  else { fail++; failures.push(name + '\n   expected: ' + JSON.stringify(expected) + '\n   got:      ' + JSON.stringify(got)); }
}

function testErr(name, src, inputs) {
  var res = runWith(src, inputs);
  if (res.r.ok) { fail++; failures.push(name + '  -> expected an error but ran OK'); }
  else pass++;
}

/* ---------------- basics ---------------- */
test('output string', 'OUTPUT "Hello, World!"', 'Hello, World!');
test('arithmetic +-*', 'OUTPUT 2 + 3 * 4', '14');
test('parentheses', 'OUTPUT (2 + 3) * 4', '20');
test('division is real', 'OUTPUT 10 / 4', '2.5');
test('division whole', 'OUTPUT 10 / 2', '5');
test('DIV', 'OUTPUT 17 DIV 5', '3');
test('MOD', 'OUTPUT 17 MOD 5', '2');
test('negative DIV', 'OUTPUT -7 DIV 2', '-3');
test('unary minus', 'DECLARE x : INTEGER\nx <- 5\nOUTPUT -x', '-5');
test('concatenation', 'OUTPUT "Summer" & " " & "Pudding"', 'Summer Pudding');
test('output list concatenates', 'DECLARE L : INTEGER\nL <- 3\nOUTPUT "You have ", L, " lives left"', 'You have 3 lives left');
test('boolean output', 'OUTPUT 5 > 3', 'TRUE');
test('real literal', 'OUTPUT 4.0', '4');
test('real keeps decimals', 'OUTPUT 3.14', '3.14');

/* ---------------- variables / assignment ---------------- */
test('declare + assign', 'DECLARE Counter : INTEGER\nCounter <- 0\nCounter <- Counter + 1\nOUTPUT Counter', '1');
test('arrow unicode', 'DECLARE x : INTEGER\nx ← 42\nOUTPUT x', '42');
test('constant', 'CONSTANT Pi = 3.14\nOUTPUT Pi', '3.14');
test('real coercion int->real', 'DECLARE r : REAL\nr <- 5\nOUTPUT r', '5');
testErr('type error real->int', 'DECLARE i : INTEGER\ni <- 3.5\nOUTPUT i');
test('multi declare', 'DECLARE a, b : INTEGER\na <- 1\nb <- 2\nOUTPUT a + b', '3');

/* ---------------- selection ---------------- */
test('if else', 'DECLARE n : INTEGER\nn <- 7\nIF n > 5 THEN\n OUTPUT "big"\nELSE\n OUTPUT "small"\nENDIF', 'big');
test('nested if', [
  'DECLARE c : INTEGER',
  'c <- 10',
  'IF c > 5 THEN',
  ' IF c > 8 THEN',
  '  OUTPUT "huge"',
  ' ELSE',
  '  OUTPUT "med"',
  ' ENDIF',
  'ENDIF'].join('\n'), 'huge');
test('case basic', [
  'DECLARE Move : CHAR',
  "Move <- 'W'",
  'CASE OF Move',
  "  'W' : OUTPUT \"up\"",
  "  'S' : OUTPUT \"down\"",
  '  OTHERWISE : OUTPUT "?"',
  'ENDCASE'].join('\n'), 'up');
test('case range', [
  'DECLARE g : INTEGER',
  'g <- 75',
  'CASE OF g',
  '  0 TO 49 : OUTPUT "fail"',
  '  50 TO 100 : OUTPUT "pass"',
  'ENDCASE'].join('\n'), 'pass');
test('case otherwise', [
  'DECLARE x : INTEGER',
  'x <- 99',
  'CASE OF x',
  '  1 : OUTPUT "one"',
  '  OTHERWISE : OUTPUT "other"',
  'ENDCASE'].join('\n'), 'other');
test('case multiline body', [
  'DECLARE x : INTEGER',
  'x <- 1',
  'CASE OF x',
  '  1 :',
  '     OUTPUT "a"',
  '     OUTPUT "b"',
  '  2 : OUTPUT "c"',
  'ENDCASE'].join('\n'), 'a\nb');

/* ---------------- iteration ---------------- */
test('for loop', 'DECLARE i : INTEGER\nDECLARE t : INTEGER\nt <- 0\nFOR i <- 1 TO 5\n t <- t + i\nNEXT i\nOUTPUT t', '15');
test('for step', 'DECLARE i : INTEGER\nFOR i <- 10 TO 1 STEP -1\n OUTPUT i\nNEXT i', '10\n9\n8\n7\n6\n5\n4\n3\n2\n1');
test('for no exec', 'DECLARE i : INTEGER\nFOR i <- 5 TO 1\n OUTPUT i\nNEXT i\nOUTPUT "done"', 'done');
test('while', 'DECLARE n : INTEGER\nn <- 27\nWHILE n > 9\n n <- n - 9\nENDWHILE\nOUTPUT n', '9');
test('while do (igcse)', 'DECLARE n : INTEGER\nn <- 3\nWHILE n > 0 DO\n OUTPUT n\n n <- n - 1\nENDWHILE', '3\n2\n1');
test('repeat', 'DECLARE n : INTEGER\nn <- 0\nREPEAT\n n <- n + 1\n OUTPUT n\nUNTIL n >= 3', '1\n2\n3');
test('nested for sum', [
  'DECLARE r : INTEGER',
  'DECLARE c : INTEGER',
  'DECLARE t : INTEGER',
  't <- 0',
  'FOR r <- 1 TO 3',
  '  FOR c <- 1 TO 3',
  '    t <- t + 1',
  '  NEXT c',
  'NEXT r',
  'OUTPUT t'].join('\n'), '9');

/* ---------------- arrays ---------------- */
test('1d array', [
  'DECLARE A : ARRAY[1:5] OF INTEGER',
  'DECLARE i : INTEGER',
  'FOR i <- 1 TO 5',
  '  A[i] <- i * i',
  'NEXT i',
  'OUTPUT A[3], " ", A[5]'].join('\n'), '9 25');
test('2d array', [
  'DECLARE M : ARRAY[1:2,1:2] OF INTEGER',
  'M[1,1] <- 1',
  'M[2,2] <- 4',
  'OUTPUT M[1,1] + M[2,2]'].join('\n'), '5');
testErr('array oob', 'DECLARE A : ARRAY[1:3] OF INTEGER\nA[4] <- 1');
test('string array', [
  'DECLARE names : ARRAY[1:3] OF STRING',
  'names[1] <- "Ali"',
  'names[2] <- "Bo"',
  'OUTPUT names[1] & " & " & names[2]'].join('\n'), 'Ali & Bo');

/* ---------------- string / numeric builtins ---------------- */
test('LENGTH', 'OUTPUT LENGTH("Happy Days")', '10');
test('RIGHT', 'OUTPUT RIGHT("ABCDEFGH", 3)', 'FGH');
test('LEFT', 'OUTPUT LEFT("ABCDEFGH", 3)', 'ABC');
test('MID', 'OUTPUT MID("ABCDEFGH", 2, 3)', 'BCD');
test('SUBSTRING', 'OUTPUT SUBSTRING("ABCDEFGH", 2, 3)', 'BCD');
test('UCASE char', "OUTPUT UCASE('h')", 'H');
test('LCASE string', 'OUTPUT LCASE("WORLD")', 'world');
test('INT', 'OUTPUT INT(27.9)', '27');
test('ROUND', 'OUTPUT ROUND(3.14159, 2)', '3.14');
test('ASC CHR', "OUTPUT ASC('A'), \" \", CHR(66)", '65 B');
test('string index 1-based', 'DECLARE s : STRING\ns <- "ABCDEF"\nOUTPUT s[1], s[3], s[6]', 'ACF');
test('string index loop', 'DECLARE s : STRING\nDECLARE i : INTEGER\ns <- "cat"\nFOR i <- LENGTH(s) TO 1 STEP -1\n   OUTPUT s[i]\nNEXT i', 't\na\nc');
test('TO_UPPER string', 'OUTPUT TO_UPPER("hello")', 'HELLO');
test('STRING_TO_NUM', 'DECLARE n : INTEGER\nn <- STRING_TO_NUM("42") + 1\nOUTPUT n', '43');

/* ---------------- input ---------------- */
test('input int', 'DECLARE n : INTEGER\nINPUT n\nOUTPUT n * 2', '20', ['10']);
test('input string', 'DECLARE s : STRING\nINPUT s\nOUTPUT "Hi " & s', 'Hi Sam', ['Sam']);
test('password repeat', [
  'DECLARE p : STRING',
  'REPEAT',
  '  OUTPUT "Enter password"',
  '  INPUT p',
  'UNTIL p = "Secret"',
  'OUTPUT "OK"'].join('\n'), 'Enter password\nEnter password\nOK', ['wrong', 'Secret']);

/* ---------------- procedures / functions ---------------- */
test('procedure', [
  'PROCEDURE Greet(name : STRING)',
  '  OUTPUT "Hello " & name',
  'ENDPROCEDURE',
  'CALL Greet("World")'].join('\n'), 'Hello World');
test('function', [
  'FUNCTION Max(a : INTEGER, b : INTEGER) RETURNS INTEGER',
  '  IF a > b THEN',
  '    RETURN a',
  '  ELSE',
  '    RETURN b',
  '  ENDIF',
  'ENDFUNCTION',
  'OUTPUT Max(10, 25)'].join('\n'), '25');
test('byref swap', [
  'PROCEDURE Swap(BYREF x : INTEGER, y : INTEGER)',
  '  DECLARE t : INTEGER',
  '  t <- x',
  '  x <- y',
  '  y <- t',
  'ENDPROCEDURE',
  'DECLARE a : INTEGER',
  'DECLARE b : INTEGER',
  'a <- 1',
  'b <- 2',
  'CALL Swap(a, b)',
  'OUTPUT a, ",", b'].join('\n'), '2,1');
test('byval no change', [
  'PROCEDURE Inc(BYVAL x : INTEGER)',
  '  x <- x + 100',
  'ENDPROCEDURE',
  'DECLARE a : INTEGER',
  'a <- 5',
  'CALL Inc(a)',
  'OUTPUT a'].join('\n'), '5');
test('recursion factorial', [
  'FUNCTION Fact(n : INTEGER) RETURNS INTEGER',
  '  IF n <= 1 THEN',
  '    RETURN 1',
  '  ELSE',
  '    RETURN n * Fact(n - 1)',
  '  ENDIF',
  'ENDFUNCTION',
  'OUTPUT Fact(5)'].join('\n'), '120');
test('function in expression', [
  'FUNCTION Double(n : INTEGER) RETURNS INTEGER',
  '  RETURN n * 2',
  'ENDFUNCTION',
  'OUTPUT "Result = ", Double(8) + 1'].join('\n'), 'Result = 17');

/* ---------------- records ---------------- */
test('record', [
  'TYPE Student',
  '  DECLARE Name : STRING',
  '  DECLARE Age : INTEGER',
  'ENDTYPE',
  'DECLARE p : Student',
  'p.Name <- "Leroy"',
  'p.Age <- 16',
  'OUTPUT p.Name & " is ", p.Age'].join('\n'), 'Leroy is 16');
test('array of records', [
  'TYPE Pt',
  '  DECLARE x : INTEGER',
  '  DECLARE y : INTEGER',
  'ENDTYPE',
  'DECLARE pts : ARRAY[1:3] OF Pt',
  'DECLARE i : INTEGER',
  'FOR i <- 1 TO 3',
  '  pts[i].x <- i',
  '  pts[i].y <- i * 10',
  'NEXT i',
  'OUTPUT pts[2].x, ",", pts[2].y'].join('\n'), '2,20');

/* ---------------- enumerated ---------------- */
test('enum', [
  'TYPE Season = (Spring, Summer, Autumn, Winter)',
  'DECLARE s : Season',
  's <- Summer',
  'IF s = Summer THEN',
  '  OUTPUT "sunny"',
  'ENDIF'].join('\n'), 'sunny');

/* ---------------- files ---------------- */
test('file write then read', [
  'DECLARE line : STRING',
  'OPENFILE "data.txt" FOR WRITE',
  'WRITEFILE "data.txt", "alpha"',
  'WRITEFILE "data.txt", "beta"',
  'CLOSEFILE "data.txt"',
  'OPENFILE "data.txt" FOR READ',
  'WHILE NOT EOF("data.txt")',
  '  READFILE "data.txt", line',
  '  OUTPUT line',
  'ENDWHILE',
  'CLOSEFILE "data.txt"'].join('\n'), 'alpha\nbeta');

/* ---------------- OOP ---------------- */
test('class + method', [
  'CLASS Pet',
  '  PRIVATE Name : STRING',
  '  PUBLIC PROCEDURE NEW(GivenName : STRING)',
  '    Name <- GivenName',
  '  ENDPROCEDURE',
  '  PUBLIC FUNCTION GetName() RETURNS STRING',
  '    RETURN Name',
  '  ENDFUNCTION',
  'ENDCLASS',
  'DECLARE p : Pet',
  'p <- NEW Pet("Rex")',
  'OUTPUT p.GetName()'].join('\n'), 'Rex');
test('inheritance super', [
  'CLASS Pet',
  '  PRIVATE Name : STRING',
  '  PUBLIC PROCEDURE NEW(GivenName : STRING)',
  '    Name <- GivenName',
  '  ENDPROCEDURE',
  '  PUBLIC FUNCTION Describe() RETURNS STRING',
  '    RETURN Name',
  '  ENDFUNCTION',
  'ENDCLASS',
  'CLASS Cat INHERITS Pet',
  '  PRIVATE Breed : STRING',
  '  PUBLIC PROCEDURE NEW(GivenName : STRING, GivenBreed : STRING)',
  '    SUPER.NEW(GivenName)',
  '    Breed <- GivenBreed',
  '  ENDPROCEDURE',
  '  PUBLIC FUNCTION Info() RETURNS STRING',
  '    RETURN Describe() & " the " & Breed',
  '  ENDFUNCTION',
  'ENDCLASS',
  'DECLARE c : Cat',
  'c <- NEW Cat("Kitty", "Shorthair")',
  'OUTPUT c.Info()'].join('\n'), 'Kitty the Shorthair');

/* ---------------- safety ---------------- */
testErr('infinite loop capped', 'DECLARE x : INTEGER\nx <- 0\nWHILE x = 0\n x <- 0\nENDWHILE');
testErr('div by zero', 'OUTPUT 5 / 0');
testErr('undeclared read', 'OUTPUT y + 1');

/* ---------------- comments / case-insensitive kw ---------------- */
test('comments', '// a comment\nOUTPUT "hi" // trailing\n// another', 'hi');
test('mixed case keywords', 'declare x : integer\nx <- 5\noutput x', '5');

/* ---------------- bigger program ---------------- */
test('bubble sort', [
  'DECLARE A : ARRAY[1:5] OF INTEGER',
  'DECLARE i : INTEGER',
  'DECLARE j : INTEGER',
  'DECLARE temp : INTEGER',
  'A[1] <- 5',
  'A[2] <- 2',
  'A[3] <- 8',
  'A[4] <- 1',
  'A[5] <- 3',
  'FOR i <- 1 TO 4',
  '  FOR j <- 1 TO 5 - i',
  '    IF A[j] > A[j+1] THEN',
  '      temp <- A[j]',
  '      A[j] <- A[j+1]',
  '      A[j+1] <- temp',
  '    ENDIF',
  '  NEXT j',
  'NEXT i',
  'FOR i <- 1 TO 5',
  '  OUTPUT A[i]',
  'NEXT i'].join('\n'), '1\n2\n3\n5\n8');

/* ---------------- more edge cases ---------------- */
test('and or not', 'OUTPUT (5 > 3) AND (2 < 1)\nOUTPUT (5 > 3) OR (2 < 1)\nOUTPUT NOT (1 = 1)', 'FALSE\nTRUE\nFALSE');
test('early return', [
  'FUNCTION FindFirst(n : INTEGER) RETURNS STRING',
  '  IF n > 0 THEN',
  '    RETURN "positive"',
  '  ENDIF',
  '  RETURN "non-positive"',
  'ENDFUNCTION',
  'OUTPUT FindFirst(5)'].join('\n'), 'positive');
test('string equality case', [
  'DECLARE day : STRING',
  'day <- "MON"',
  'CASE OF day',
  '  "MON" : OUTPUT "start"',
  '  "FRI" : OUTPUT "end"',
  'ENDCASE'].join('\n'), 'start');
test('seeded file', [
  'DECLARE line : STRING',
  'OPENFILE "in.txt" FOR READ',
  'WHILE NOT EOF("in.txt")',
  '  READFILE "in.txt", line',
  '  OUTPUT UCASE(line)',
  'ENDWHILE',
  'CLOSEFILE "in.txt"'].join('\n'), 'ONE\nTWO', null, { 'in.txt': 'one\ntwo' });
test('procedure calls procedure', [
  'PROCEDURE Inner()',
  '  OUTPUT "inner"',
  'ENDPROCEDURE',
  'PROCEDURE Outer()',
  '  OUTPUT "outer"',
  '  CALL Inner()',
  'ENDPROCEDURE',
  'CALL Outer()'].join('\n'), 'outer\ninner');
test('guide swap exact', [
  'PROCEDURE SWAP(BYREF X : INTEGER, Y : INTEGER)',
  '   Temp <- X',
  '   X <- Y',
  '   Y <- Temp',
  'ENDPROCEDURE',
  'DECLARE A : INTEGER',
  'DECLARE B : INTEGER',
  'A <- 10',
  'B <- 20',
  'CALL SWAP(A, B)',
  'OUTPUT A, " ", B'].join('\n'), '20 10');
test('real avg', [
  'DECLARE total : INTEGER',
  'total <- 7',
  'OUTPUT total / 2'].join('\n'), '3.5');

/* ---------------- summary ---------------- */
console.log('\nPASS: ' + pass + '   FAIL: ' + fail);
if (failures.length) {
  console.log('\n--- FAILURES ---');
  failures.forEach(function (f) { console.log('✗ ' + f + '\n'); });
  process.exit(1);
}
