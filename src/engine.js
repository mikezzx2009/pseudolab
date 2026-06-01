/* ============================================================================
 * PseudoLab Engine
 * A tree-walking interpreter for Cambridge (CIE) pseudocode.
 * Targets Cambridge International AS & A Level Computer Science (9618)
 * pseudocode, with a few lenient extras so most exam-style code runs.
 *
 * Works in both the browser (attaches to window.PseudoEngine) and Node
 * (module.exports) so the same source can be unit-tested.
 * ==========================================================================*/
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Errors
   * ------------------------------------------------------------------ */
  function PseudoError(message, line) {
    this.name = 'PseudoError';
    this.message = message;
    this.line = line || null;
  }
  PseudoError.prototype = Object.create(Error.prototype);

  function err(msg, line) { throw new PseudoError(msg, line); }

  /* ------------------------------------------------------------------ *
   * Character normalisation
   * Exam PDFs use typographic characters; map them to ASCII equivalents.
   * ------------------------------------------------------------------ */
  function normalizeSource(src) {
    return src
      .replace(/←/g, '<-')   // ← assignment
      .replace(/[−–—]/g, '-') // minus sign / en / em dash
      .replace(/×/g, '*')   // ×
      .replace(/÷/g, '/')   // ÷
      .replace(/≤/g, '<=')  // ≤
      .replace(/≥/g, '>=')  // ≥
      .replace(/≠/g, '<>')  // ≠
      .replace(/[“”]/g, '"')          // “ ”
      .replace(/[‘’Ꞌꞌ]/g, "'") // ‘ ’ saltillo
      .replace(/ /g, ' ')   // non-breaking space
      .replace(/\t/g, '   ');    // tabs -> 3 spaces
  }

  /* ------------------------------------------------------------------ *
   * Lexer
   * ------------------------------------------------------------------ */
  var KEYWORDS = {};
  ['DECLARE','CONSTANT','ARRAY','OF',
   'INTEGER','REAL','CHAR','STRING','BOOLEAN','DATE',
   'IF','THEN','ELSE','ENDIF',
   'CASE','OTHERWISE','ENDCASE',
   'FOR','TO','STEP','NEXT',
   'WHILE','DO','ENDWHILE',
   'REPEAT','UNTIL',
   'PROCEDURE','ENDPROCEDURE','FUNCTION','RETURNS','RETURN','ENDFUNCTION','CALL','BYREF','BYVAL',
   'INPUT','OUTPUT','PRINT',
   'TYPE','ENDTYPE','SET','DEFINE',
   'DIV','MOD','AND','OR','NOT',
   'OPENFILE','READFILE','WRITEFILE','CLOSEFILE','SEEK','GETRECORD','PUTRECORD',
   'CLASS','ENDCLASS','INHERITS','PUBLIC','PRIVATE','NEW','SUPER'
  ].forEach(function (k) { KEYWORDS[k] = true; });

  function tokenize(src) {
    var s = normalizeSource(src);
    var tokens = [];
    var i = 0, line = 1, n = s.length;
    var depth = 0; // () and [] nesting -> suppress NL so statements can wrap

    function push(type, value) { tokens.push({ type: type, value: value, line: line }); }

    while (i < n) {
      var c = s[i];

      // newline
      if (c === '\n') {
        if (depth <= 0) {
          // collapse consecutive newlines into one NL token
          if (tokens.length && tokens[tokens.length - 1].type !== 'NL') push('NL', '\n');
        }
        line++; i++; continue;
      }
      if (c === '\r') { i++; continue; }
      if (c === ' ') { i++; continue; }

      // comment //...
      if (c === '/' && s[i + 1] === '/') {
        while (i < n && s[i] !== '\n') i++;
        continue;
      }

      // string literal
      if (c === '"') {
        var str = ''; i++;
        while (i < n && s[i] !== '"' && s[i] !== '\n') { str += s[i]; i++; }
        if (s[i] !== '"') err('Unterminated string literal', line);
        i++; push('STR', str); continue;
      }

      // char literal
      if (c === "'") {
        i++;
        var ch = '';
        while (i < n && s[i] !== "'" && s[i] !== '\n') { ch += s[i]; i++; }
        if (s[i] !== "'") err('Unterminated character literal', line);
        i++;
        push('CHAR', ch); continue;
      }

      // number
      if (c >= '0' && c <= '9') {
        var num = '';
        while (i < n && s[i] >= '0' && s[i] <= '9') { num += s[i]; i++; }
        if (s[i] === '.' && s[i + 1] >= '0' && s[i + 1] <= '9') {
          num += '.'; i++;
          while (i < n && s[i] >= '0' && s[i] <= '9') { num += s[i]; i++; }
          push('REAL', parseFloat(num));
        } else {
          push('INT', parseInt(num, 10));
        }
        continue;
      }

      // identifier / keyword
      if (/[A-Za-z_]/.test(c)) {
        var word = '';
        while (i < n && /[A-Za-z0-9_]/.test(s[i])) { word += s[i]; i++; }
        var up = word.toUpperCase();
        if (up === 'TRUE') { push('BOOL', true); }
        else if (up === 'FALSE') { push('BOOL', false); }
        else if (KEYWORDS[up]) { push('KW', up); }
        else { push('IDENT', word); }
        continue;
      }

      // multi-char operators
      var two = s.substr(i, 2);
      if (two === '<-') {
        if (s[i + 2] === '-') { push('ASSIGN', '<--'); i += 3; }
        else { push('ASSIGN', '<-'); i += 2; }
        continue;
      }
      if (two === '<=') { push('<=', two); i += 2; continue; }
      if (two === '>=') { push('>=', two); i += 2; continue; }
      if (two === '<>') { push('<>', two); i += 2; continue; }

      // single-char tokens
      switch (c) {
        case '(': depth++; push('(', c); i++; continue;
        case ')': depth--; push(')', c); i++; continue;
        case '[': depth++; push('[', c); i++; continue;
        case ']': depth--; push(']', c); i++; continue;
        case '+': case '-': case '*': case '/':
          push(c, c); i++; continue;
        case '=': push('=', c); i++; continue;
        case '<': push('<', c); i++; continue;
        case '>': push('>', c); i++; continue;
        case '&': push('&', c); i++; continue;
        case '^': push('^', c); i++; continue;
        case ',': push(',', c); i++; continue;
        case ':': push(':', c); i++; continue;
        case '.': push('.', c); i++; continue;
      }
      err("Unexpected character '" + c + "'", line);
    }
    push('NL', '\n');
    push('EOF', null);
    return tokens;
  }

  /* ------------------------------------------------------------------ *
   * Parser  (recursive descent -> AST of plain objects)
   * ------------------------------------------------------------------ */
  function Parser(tokens) {
    this.toks = tokens;
    this.p = 0;
  }
  Parser.prototype.peek = function (k) { return this.toks[this.p + (k || 0)]; };
  Parser.prototype.next = function () { return this.toks[this.p++]; };
  Parser.prototype.atEnd = function () { return this.peek().type === 'EOF'; };
  Parser.prototype.is = function (type) { return this.peek().type === type; };
  Parser.prototype.isKw = function (w) { var t = this.peek(); return t.type === 'KW' && t.value === w; };
  Parser.prototype.line = function () { return this.peek().line; };
  Parser.prototype.eat = function (type) {
    if (this.peek().type !== type) err("Expected '" + type + "' but found '" + this.describe(this.peek()) + "'", this.line());
    return this.next();
  };
  Parser.prototype.eatKw = function (w) {
    if (!this.isKw(w)) err("Expected '" + w + "' but found '" + this.describe(this.peek()) + "'", this.line());
    return this.next();
  };
  Parser.prototype.describe = function (t) {
    if (!t) return 'EOF';
    if (t.type === 'KW') return t.value;
    if (t.type === 'NL') return 'end of line';
    if (t.type === 'EOF') return 'end of program';
    return String(t.value);
  };
  Parser.prototype.skipNL = function () { while (this.is('NL')) this.next(); };
  Parser.prototype.endStmt = function () {
    // a simple statement ends at NL or EOF
    if (this.is('NL')) this.next();
    else if (!this.is('EOF')) {
      // allow trailing on same constructs handled by callers; otherwise error
    }
  };

  Parser.prototype.parseProgram = function () {
    var stmts = [];
    this.skipNL();
    while (!this.atEnd()) {
      stmts.push(this.parseStatement());
      this.skipNL();
    }
    return { type: 'Program', body: stmts };
  };

  // Parse a block of statements until one of the terminator keywords is seen.
  Parser.prototype.parseBlock = function (terminators) {
    var stmts = [];
    this.skipNL();
    while (!this.atEnd()) {
      var t = this.peek();
      if (t.type === 'KW' && terminators.indexOf(t.value) !== -1) break;
      stmts.push(this.parseStatement());
      this.skipNL();
    }
    return stmts;
  };

  Parser.prototype.parseStatement = function () {
    var t = this.peek();
    if (t.type === 'KW') {
      switch (t.value) {
        case 'DECLARE': return this.parseDeclare();
        case 'CONSTANT': return this.parseConstant();
        case 'IF': return this.parseIf();
        case 'CASE': return this.parseCase();
        case 'FOR': return this.parseFor();
        case 'WHILE': return this.parseWhile();
        case 'REPEAT': return this.parseRepeat();
        case 'PROCEDURE': return this.parseProcedure(null);
        case 'FUNCTION': return this.parseFunction(null);
        case 'CALL': return this.parseCall();
        case 'RETURN': return this.parseReturn();
        case 'INPUT': return this.parseInput();
        case 'OUTPUT': case 'PRINT': return this.parseOutput();
        case 'TYPE': return this.parseType();
        case 'DEFINE': return this.parseDefine();
        case 'CLASS': return this.parseClass();
        case 'OPENFILE': return this.parseOpenFile();
        case 'READFILE': return this.parseReadFile();
        case 'WRITEFILE': return this.parseWriteFile();
        case 'CLOSEFILE': return this.parseCloseFile();
        case 'SEEK': return this.parseSeek();
        case 'GETRECORD': return this.parseGetRecord();
        case 'PUTRECORD': return this.parsePutRecord();
        case 'PUBLIC': case 'PRIVATE': {
          // access-modified member at top level (rare) e.g. inside class handled separately
          var acc = this.next().value;
          if (this.isKw('PROCEDURE')) return this.parseProcedure(acc);
          if (this.isKw('FUNCTION')) return this.parseFunction(acc);
          // declaration with access modifier
          return this.parseDeclare(acc);
        }
      }
    }
    // assignment or expression-statement
    return this.parseAssignmentOrExpr();
  };

  Parser.prototype.parseTypeSpec = function () {
    if (this.isKw('ARRAY')) {
      var line = this.line();
      this.next();
      this.eat('[');
      var dims = [];
      do {
        var lo = this.parseExpr();
        this.eat(':');
        var hi = this.parseExpr();
        dims.push({ low: lo, high: hi });
      } while (this.is(',') && this.next());
      this.eat(']');
      this.eatKw('OF');
      var of = this.parseTypeSpec();
      return { kind: 'array', dims: dims, of: of, line: line };
    }
    var tk = this.peek();
    if (tk.type === 'KW' && ['INTEGER','REAL','CHAR','STRING','BOOLEAN','DATE'].indexOf(tk.value) !== -1) {
      this.next();
      return { kind: 'primitive', name: tk.value };
    }
    if (tk.type === 'IDENT') {
      this.next();
      return { kind: 'named', name: tk.value };
    }
    err("Expected a data type but found '" + this.describe(tk) + "'", this.line());
  };

  Parser.prototype.parseDeclare = function (access) {
    var line = this.line();
    this.eatKw('DECLARE');
    var names = [this.eat('IDENT').value];
    while (this.is(',')) { this.next(); names.push(this.eat('IDENT').value); }
    this.eat(':');
    var typeSpec = this.parseTypeSpec();
    this.endStmt();
    return { type: 'Declare', names: names, typeSpec: typeSpec, access: access || null, line: line };
  };

  Parser.prototype.parseConstant = function () {
    var line = this.line();
    this.eatKw('CONSTANT');
    var name = this.eat('IDENT').value;
    if (this.is('=')) this.next();
    else if (this.is('ASSIGN')) this.next();
    else err("Expected '=' in CONSTANT declaration", this.line());
    var expr = this.parseExpr();
    this.endStmt();
    return { type: 'Constant', name: name, expr: expr, line: line };
  };

  Parser.prototype.parseIf = function () {
    var line = this.line();
    this.eatKw('IF');
    var cond = this.parseExpr();
    this.skipNL();
    this.eatKw('THEN');
    var thenB = this.parseBlock(['ELSE', 'ENDIF']);
    var elseB = null;
    if (this.isKw('ELSE')) { this.next(); elseB = this.parseBlock(['ENDIF']); }
    this.eatKw('ENDIF');
    this.endStmt();
    return { type: 'If', cond: cond, then: thenB, else: elseB, line: line };
  };

  Parser.prototype.parseCase = function () {
    var line = this.line();
    this.eatKw('CASE');
    this.eatKw('OF');
    var selector = this.parseExpr();
    this.skipNL();
    var clauses = [];
    var otherwise = null;
    while (!this.atEnd() && !this.isKw('ENDCASE')) {
      this.skipNL();
      if (this.isKw('ENDCASE')) break;
      if (this.isKw('OTHERWISE')) {
        this.next();
        if (this.is(':')) this.next();
        otherwise = this.parseCaseBody();
        continue;
      }
      // parse a value, possibly a range  v1 TO v2
      var v1 = this.parseExpr();
      var v2 = null;
      if (this.isKw('TO')) { this.next(); v2 = this.parseExpr(); }
      this.eat(':');
      var body = this.parseCaseBody();
      clauses.push({ value: v1, to: v2, body: body });
    }
    this.eatKw('ENDCASE');
    this.endStmt();
    return { type: 'Case', selector: selector, clauses: clauses, otherwise: otherwise, line: line };
  };

  // statements of a case clause: any statements until next label / OTHERWISE / ENDCASE
  Parser.prototype.parseCaseBody = function () {
    var stmts = [];
    this.skipNL();
    while (!this.is('EOF') && !this.isKw('ENDCASE') && !this.isKw('OTHERWISE') && !this.looksLikeCaseLabel()) {
      stmts.push(this.parseStatement());
      this.skipNL();
    }
    return stmts;
  };

  // Heuristic: a case label line has a top-level ':' before any NL,
  // does not start with a statement keyword and contains no ASSIGN before ':'.
  Parser.prototype.looksLikeCaseLabel = function () {
    var t = this.peek();
    if (t.type === 'KW') {
      // values may be enum identifiers (IDENT) or literals only; keywords starting a stmt => not a label
      if (['IF','CASE','FOR','WHILE','REPEAT','PROCEDURE','FUNCTION','CALL','RETURN',
           'INPUT','OUTPUT','PRINT','DECLARE','CONSTANT','TYPE','DEFINE','CLASS',
           'OPENFILE','READFILE','WRITEFILE','CLOSEFILE','SEEK','GETRECORD','PUTRECORD',
           'PUBLIC','PRIVATE','NOT','ENDCASE','OTHERWISE'].indexOf(t.value) !== -1) return false;
    }
    var j = this.p;
    while (this.toks[j] && this.toks[j].type !== 'NL' && this.toks[j].type !== 'EOF') {
      var tt = this.toks[j].type;
      if (tt === 'ASSIGN') return false;
      if (tt === ':') return true;
      j++;
    }
    return false;
  };

  Parser.prototype.parseFor = function () {
    var line = this.line();
    this.eatKw('FOR');
    var varName = this.eat('IDENT').value;
    this.eat('ASSIGN');
    var start = this.parseExpr();
    this.eatKw('TO');
    var end = this.parseExpr();
    var step = null;
    if (this.isKw('STEP')) { this.next(); step = this.parseExpr(); }
    var body = this.parseBlock(['NEXT', 'ENDFOR']);
    if (this.isKw('NEXT')) {
      this.next();
      if (this.is('IDENT')) this.next(); // optional identifier
    } else if (this.peek().type === 'KW' && this.peek().value === 'ENDFOR') {
      this.next();
    } else err("Expected NEXT to close FOR loop", this.line());
    this.endStmt();
    return { type: 'For', varName: varName, start: start, end: end, step: step, body: body, line: line };
  };

  Parser.prototype.parseWhile = function () {
    var line = this.line();
    this.eatKw('WHILE');
    var cond = this.parseExpr();
    if (this.isKw('DO')) this.next();       // tolerate an optional DO after the condition
    var body = this.parseBlock(['ENDWHILE']);
    this.eatKw('ENDWHILE');
    this.endStmt();
    return { type: 'While', cond: cond, body: body, line: line };
  };

  Parser.prototype.parseRepeat = function () {
    var line = this.line();
    this.eatKw('REPEAT');
    var body = this.parseBlock(['UNTIL']);
    this.eatKw('UNTIL');
    var cond = this.parseExpr();
    this.endStmt();
    return { type: 'Repeat', body: body, cond: cond, line: line };
  };

  Parser.prototype.parseParams = function () {
    var params = [];
    this.eat('(');
    var mode = 'BYVAL';
    if (!this.is(')')) {
      do {
        if (this.isKw('BYREF')) { mode = 'BYREF'; this.next(); }
        else if (this.isKw('BYVAL')) { mode = 'BYVAL'; this.next(); }
        var pname = this.eat('IDENT').value;
        this.eat(':');
        var ptype = this.parseTypeSpec();
        params.push({ name: pname, typeSpec: ptype, mode: mode });
      } while (this.is(',') && this.next());
    }
    this.eat(')');
    return params;
  };

  // a definition name may be an identifier or the keyword NEW (constructor)
  Parser.prototype.parseDefName = function () {
    if (this.isKw('NEW')) { this.next(); return 'NEW'; }
    return this.eat('IDENT').value;
  };

  Parser.prototype.parseProcedure = function (access) {
    var line = this.line();
    this.eatKw('PROCEDURE');
    var name = this.parseDefName();
    var params = this.is('(') ? this.parseParams() : [];
    var body = this.parseBlock(['ENDPROCEDURE']);
    this.eatKw('ENDPROCEDURE');
    this.endStmt();
    return { type: 'ProcDef', name: name, params: params, body: body, access: access || 'PUBLIC', line: line };
  };

  Parser.prototype.parseFunction = function (access) {
    var line = this.line();
    this.eatKw('FUNCTION');
    var name = this.parseDefName();
    var params = this.is('(') ? this.parseParams() : [];
    this.eatKw('RETURNS');
    var ret = this.parseTypeSpec();
    var body = this.parseBlock(['ENDFUNCTION']);
    this.eatKw('ENDFUNCTION');
    this.endStmt();
    return { type: 'FuncDef', name: name, params: params, returns: ret, body: body, access: access || 'PUBLIC', line: line };
  };

  Parser.prototype.parseCall = function () {
    var line = this.line();
    this.eatKw('CALL');
    var name = this.eat('IDENT').value;
    var args = [];
    if (this.is('(')) { this.next(); args = this.parseArgs(); this.eat(')'); }
    this.endStmt();
    return { type: 'CallStmt', name: name, args: args, line: line };
  };

  Parser.prototype.parseReturn = function () {
    var line = this.line();
    this.eatKw('RETURN');
    var val = null;
    if (!this.is('NL') && !this.is('EOF')) val = this.parseExpr();
    this.endStmt();
    return { type: 'Return', value: val, line: line };
  };

  Parser.prototype.parseInput = function () {
    var line = this.line();
    this.eatKw('INPUT');
    // optional prompt string then comma (some styles); CIE just INPUT var
    var target = this.parsePostfix();
    this.endStmt();
    return { type: 'Input', target: target, line: line };
  };

  Parser.prototype.parseOutput = function () {
    var line = this.line();
    this.next(); // OUTPUT or PRINT
    var args = [];
    if (!this.is('NL') && !this.is('EOF')) {
      args.push(this.parseExpr());
      while (this.is(',')) { this.next(); args.push(this.parseExpr()); }
    }
    this.endStmt();
    return { type: 'Output', args: args, line: line };
  };

  Parser.prototype.parseType = function () {
    var line = this.line();
    this.eatKw('TYPE');
    var name = this.eat('IDENT').value;
    if (this.is('=')) {
      this.next();
      if (this.is('^')) {           // pointer
        this.next();
        var base = this.parseTypeSpec();
        this.endStmt();
        return { type: 'TypeDef', kind: 'pointer', name: name, of: base, line: line };
      }
      if (this.isKw('SET')) {       // set
        this.next(); this.eatKw('OF');
        var et = this.parseTypeSpec();
        this.endStmt();
        return { type: 'TypeDef', kind: 'set', name: name, of: et, line: line };
      }
      if (this.is('(')) {           // enumerated
        this.next();
        var members = [this.eat('IDENT').value];
        while (this.is(',')) { this.next(); members.push(this.eat('IDENT').value); }
        this.eat(')');
        this.endStmt();
        return { type: 'TypeDef', kind: 'enum', name: name, members: members, line: line };
      }
      err('Unsupported TYPE definition', line);
    }
    // record
    this.skipNL();
    var fields = [];
    while (!this.atEnd() && !this.isKw('ENDTYPE')) {
      this.skipNL();
      if (this.isKw('ENDTYPE')) break;
      this.eatKw('DECLARE');
      var fnames = [this.eat('IDENT').value];
      while (this.is(',')) { this.next(); fnames.push(this.eat('IDENT').value); }
      this.eat(':');
      var ft = this.parseTypeSpec();
      for (var k = 0; k < fnames.length; k++) fields.push({ name: fnames[k], typeSpec: ft });
      this.skipNL();
    }
    this.eatKw('ENDTYPE');
    this.endStmt();
    return { type: 'TypeDef', kind: 'record', name: name, fields: fields, line: line };
  };

  Parser.prototype.parseDefine = function () {
    var line = this.line();
    this.eatKw('DEFINE');
    var name = this.eat('IDENT').value;
    this.eat('(');
    var values = [];
    if (!this.is(')')) {
      values.push(this.parseExpr());
      while (this.is(',')) { this.next(); values.push(this.parseExpr()); }
    }
    this.eat(')');
    this.eat(':');
    var setType = this.eat('IDENT').value;
    this.endStmt();
    return { type: 'Define', name: name, values: values, setType: setType, line: line };
  };

  Parser.prototype.parseClass = function () {
    var line = this.line();
    this.eatKw('CLASS');
    var name = this.eat('IDENT').value;
    var parent = null;
    if (this.isKw('INHERITS')) { this.next(); parent = this.eat('IDENT').value; }
    this.skipNL();
    var fields = [], methods = [];
    while (!this.atEnd() && !this.isKw('ENDCLASS')) {
      this.skipNL();
      if (this.isKw('ENDCLASS')) break;
      var access = 'PUBLIC';
      if (this.isKw('PUBLIC') || this.isKw('PRIVATE')) access = this.next().value;
      if (this.isKw('PROCEDURE')) { methods.push(this.parseProcedure(access)); }
      else if (this.isKw('FUNCTION')) { methods.push(this.parseFunction(access)); }
      else if (this.isKw('DECLARE')) { fields.push(this.parseDeclare(access)); }
      else if (this.is('IDENT')) {
        // field declared without DECLARE keyword:  PRIVATE Name : STRING
        var fname = this.next().value;
        this.eat(':');
        var ftype = this.parseTypeSpec();
        this.endStmt();
        fields.push({ type: 'Declare', names: [fname], typeSpec: ftype, access: access });
      } else err('Unexpected token in CLASS body: ' + this.describe(this.peek()), this.line());
      this.skipNL();
    }
    this.eatKw('ENDCLASS');
    this.endStmt();
    return { type: 'ClassDef', name: name, parent: parent, fields: fields, methods: methods, line: line };
  };

  Parser.prototype.parseOpenFile = function () {
    var line = this.line(); this.eatKw('OPENFILE');
    var file = this.parseExpr();
    this.eatKw('FOR');
    var modeTok = this.peek();
    var mode = (modeTok.type === 'KW' || modeTok.type === 'IDENT') ? modeTok.value.toUpperCase() : null;
    if (['READ','WRITE','APPEND','RANDOM'].indexOf(mode) === -1) err('Invalid file mode', line);
    this.next();
    this.endStmt();
    return { type: 'OpenFile', file: file, mode: mode, line: line };
  };
  Parser.prototype.parseReadFile = function () {
    var line = this.line(); this.eatKw('READFILE');
    var file = this.parseExpr(); this.eat(',');
    var target = this.parsePostfix();
    this.endStmt();
    return { type: 'ReadFile', file: file, target: target, line: line };
  };
  Parser.prototype.parseWriteFile = function () {
    var line = this.line(); this.eatKw('WRITEFILE');
    var file = this.parseExpr(); this.eat(',');
    var value = this.parseExpr();
    this.endStmt();
    return { type: 'WriteFile', file: file, value: value, line: line };
  };
  Parser.prototype.parseCloseFile = function () {
    var line = this.line(); this.eatKw('CLOSEFILE');
    var file = this.parseExpr();
    this.endStmt();
    return { type: 'CloseFile', file: file, line: line };
  };
  Parser.prototype.parseSeek = function () {
    var line = this.line(); this.eatKw('SEEK');
    var file = this.parseExpr(); this.eat(',');
    var addr = this.parseExpr();
    this.endStmt();
    return { type: 'Seek', file: file, addr: addr, line: line };
  };
  Parser.prototype.parseGetRecord = function () {
    var line = this.line(); this.eatKw('GETRECORD');
    var file = this.parseExpr(); this.eat(',');
    var target = this.parsePostfix();
    this.endStmt();
    return { type: 'GetRecord', file: file, target: target, line: line };
  };
  Parser.prototype.parsePutRecord = function () {
    var line = this.line(); this.eatKw('PUTRECORD');
    var file = this.parseExpr(); this.eat(',');
    var value = this.parseExpr();
    this.endStmt();
    return { type: 'PutRecord', file: file, value: value, line: line };
  };

  Parser.prototype.parseAssignmentOrExpr = function () {
    var line = this.line();
    var lhs = this.parseExpr();
    if (this.is('ASSIGN')) {
      this.next();
      var rhs = this.parseExpr();
      this.endStmt();
      if (['Var', 'Index', 'Field', 'Deref'].indexOf(lhs.type) === -1)
        err('Invalid assignment target', line);
      return { type: 'Assign', target: lhs, value: rhs, line: line };
    }
    this.endStmt();
    if (lhs.type === 'Call' || lhs.type === 'MethodCall' || lhs.type === 'SuperCall') {
      return { type: 'ExprStmt', expr: lhs, line: line };
    }
    err("Expected a statement (did you mean to use '<-' to assign?)", line);
  };

  Parser.prototype.parseArgs = function () {
    var args = [];
    if (!this.is(')')) {
      args.push(this.parseExpr());
      while (this.is(',')) { this.next(); args.push(this.parseExpr()); }
    }
    return args;
  };

  /* ---- expression precedence ---- */
  Parser.prototype.parseExpr = function () { return this.parseOr(); };
  Parser.prototype.parseOr = function () {
    var left = this.parseAnd();
    while (this.isKw('OR')) { var line = this.line(); this.next(); left = { type: 'BinOp', op: 'OR', left: left, right: this.parseAnd(), line: line }; }
    return left;
  };
  Parser.prototype.parseAnd = function () {
    var left = this.parseRel();
    while (this.isKw('AND')) { var line = this.line(); this.next(); left = { type: 'BinOp', op: 'AND', left: left, right: this.parseRel(), line: line }; }
    return left;
  };
  Parser.prototype.parseRel = function () {
    var left = this.parseConcat();
    var rel = ['=', '<>', '<', '<=', '>', '>='];
    while (rel.indexOf(this.peek().type) !== -1) {
      var op = this.next().type; var line = this.line();
      left = { type: 'BinOp', op: op, left: left, right: this.parseConcat(), line: line };
    }
    return left;
  };
  Parser.prototype.parseConcat = function () {
    var left = this.parseAdd();
    while (this.is('&')) { var line = this.line(); this.next(); left = { type: 'BinOp', op: '&', left: left, right: this.parseAdd(), line: line }; }
    return left;
  };
  Parser.prototype.parseAdd = function () {
    var left = this.parseMul();
    while (this.is('+') || this.is('-')) { var op = this.next().type; var line = this.line(); left = { type: 'BinOp', op: op, left: left, right: this.parseMul(), line: line }; }
    return left;
  };
  Parser.prototype.parseMul = function () {
    var left = this.parseUnary();
    while (this.is('*') || this.is('/') || this.isKw('DIV') || this.isKw('MOD')) {
      var t = this.next(); var op = t.type === 'KW' ? t.value : t.type; var line = this.line();
      left = { type: 'BinOp', op: op, left: left, right: this.parseUnary(), line: line };
    }
    return left;
  };
  Parser.prototype.parseUnary = function () {
    var line = this.line();
    if (this.is('-') || this.is('+')) { var op = this.next().type; return { type: 'Unary', op: op, operand: this.parseUnary(), line: line }; }
    if (this.isKw('NOT')) { this.next(); return { type: 'Unary', op: 'NOT', operand: this.parseUnary(), line: line }; }
    if (this.is('^')) { this.next(); return { type: 'AddrOf', operand: this.parseUnary(), line: line }; }
    return this.parsePostfix();
  };
  Parser.prototype.parsePostfix = function () {
    var node = this.parsePrimary();
    while (true) {
      if (this.is('[')) {
        var line = this.line(); this.next();
        var idx = [this.parseExpr()];
        while (this.is(',')) { this.next(); idx.push(this.parseExpr()); }
        this.eat(']');
        node = { type: 'Index', target: node, indices: idx, line: line };
      } else if (this.is('(')) {
        var l2 = this.line(); this.next();
        var args = this.parseArgs();
        this.eat(')');
        if (node.type === 'Field') node = { type: 'MethodCall', object: node.target, method: node.name, args: args, line: l2 };
        else if (node.type === 'Var') node = { type: 'Call', name: node.name, args: args, line: l2 };
        else err('Cannot call this expression', l2);
      } else if (this.is('.')) {
        var l3 = this.line(); this.next();
        var fld = this.peek().type === 'KW' ? this.next().value : this.eat('IDENT').value;
        node = { type: 'Field', target: node, name: fld, line: l3 };
      } else if (this.is('^')) {
        var l4 = this.line(); this.next();
        node = { type: 'Deref', target: node, line: l4 };
      } else break;
    }
    return node;
  };
  Parser.prototype.parsePrimary = function () {
    var t = this.peek();
    var line = t.line;
    switch (t.type) {
      case 'INT': this.next(); return { type: 'Lit', valueType: 'INTEGER', value: t.value, line: line };
      case 'REAL': this.next(); return { type: 'Lit', valueType: 'REAL', value: t.value, line: line };
      case 'STR': this.next(); return { type: 'Lit', valueType: 'STRING', value: t.value, line: line };
      case 'CHAR': this.next(); return { type: 'Lit', valueType: 'CHAR', value: t.value, line: line };
      case 'BOOL': this.next(); return { type: 'Lit', valueType: 'BOOLEAN', value: t.value, line: line };
      case 'IDENT': this.next(); return { type: 'Var', name: t.value, line: line };
      case '(': { this.next(); var e = this.parseExpr(); this.eat(')'); return e; }
      case '[': {
        this.next();
        var items = [];
        if (!this.is(']')) { items.push(this.parseExpr()); while (this.is(',')) { this.next(); items.push(this.parseExpr()); } }
        this.eat(']');
        return { type: 'ArrayLit', items: items, line: line };
      }
      case 'KW':
        if (t.value === 'NEW') {
          this.next();
          var cname = this.eat('IDENT').value;
          var args = [];
          if (this.is('(')) { this.next(); args = this.parseArgs(); this.eat(')'); }
          return { type: 'New', className: cname, args: args, line: line };
        }
        if (t.value === 'SUPER') {
          this.next(); this.eat('.');
          var m = this.peek().type === 'KW' ? this.next().value : this.eat('IDENT').value;
          var sargs = [];
          if (this.is('(')) { this.next(); sargs = this.parseArgs(); this.eat(')'); }
          return { type: 'SuperCall', method: m, args: sargs, line: line };
        }
        break;
    }
    err("Unexpected '" + this.describe(t) + "' in expression", line);
  };

  /* ------------------------------------------------------------------ *
   * Runtime values
   * ------------------------------------------------------------------ */
  function V(type, value) { return { type: type, value: value }; }
  function mkInt(n) { return V('INTEGER', Math.trunc(n)); }
  function mkReal(n) { return V('REAL', n); }
  function mkBool(b) { return V('BOOLEAN', !!b); }
  function mkChar(c) { return V('CHAR', c == null ? '' : String(c).charAt(0)); }
  function mkStr(s) { return V('STRING', s == null ? '' : String(s)); }

  function isNum(v) { return v.type === 'INTEGER' || v.type === 'REAL'; }

  function deepCopy(v) {
    if (v == null) return v;
    if (v.type === 'ARRAY') {
      var data = {};
      for (var k in v.value.data) if (v.value.data.hasOwnProperty(k)) data[k] = deepCopy(v.value.data[k]);
      return { type: 'ARRAY', value: { dims: v.value.dims, of: v.value.of, data: data } };
    }
    if (v.type === 'RECORD') {
      var f = {};
      for (var fn in v.value.fields) if (v.value.fields.hasOwnProperty(fn)) f[fn] = deepCopy(v.value.fields[fn]);
      return { type: 'RECORD', value: { typeName: v.value.typeName, fields: f } };
    }
    return { type: v.type, value: v.value };
  }

  /* ------------------------------------------------------------------ *
   * Scope
   * ------------------------------------------------------------------ */
  function Scope(parent) { this.vars = {}; this.parent = parent || null; }
  Scope.prototype.findCell = function (name) {
    var key = name.toLowerCase();
    var s = this;
    while (s) { if (s.vars.hasOwnProperty(key)) return s.vars[key]; s = s.parent; }
    return null;
  };
  Scope.prototype.declare = function (name, cell) { this.vars[name.toLowerCase()] = cell; };

  /* ------------------------------------------------------------------ *
   * Interpreter
   * ------------------------------------------------------------------ */
  function Interpreter(opts) {
    opts = opts || {};
    this.output = opts.output || function () {};
    this.inputFn = opts.input || function () { return null; };
    this.maxSteps = opts.maxSteps || 3000000;
    this.steps = 0;
    this.global = new Scope(null);
    this.types = {};     // user types: record/enum/pointer/set
    this.classes = {};   // class defs
    this.procs = {};     // procedures
    this.funcs = {};     // functions
    this.files = {};     // virtual file system
    this.seedFiles = opts.files || {};
    this.callDepth = 0;
    this.maxDepth = opts.maxDepth || 2500;
  }

  Interpreter.prototype.tick = function (line) {
    if (++this.steps > this.maxSteps)
      err('Execution stopped: too many steps (possible infinite loop)', line);
  };

  Interpreter.prototype.run = function (ast) {
    var body = ast.body;
    // hoist definitions
    for (var i = 0; i < body.length; i++) {
      var s = body[i];
      if (s.type === 'ProcDef') this.procs[s.name.toLowerCase()] = s;
      else if (s.type === 'FuncDef') this.funcs[s.name.toLowerCase()] = s;
      else if (s.type === 'TypeDef') this.registerType(s);
      else if (s.type === 'ClassDef') this.classes[s.name.toLowerCase()] = s;
    }
    // execute the rest in order
    for (var j = 0; j < body.length; j++) {
      var st = body[j];
      if (st.type === 'ProcDef' || st.type === 'FuncDef' || st.type === 'ClassDef') continue;
      if (st.type === 'TypeDef') continue;
      this.exec(st, this.global);
    }
  };

  Interpreter.prototype.registerType = function (s) {
    this.types[s.name.toLowerCase()] = s;
    if (s.kind === 'enum') {
      for (var i = 0; i < s.members.length; i++) {
        var m = s.members[i];
        this.global.declare(m, { value: { type: 'ENUM', value: { enumName: s.name, name: m, index: i } }, isConst: true, declType: { kind: 'named', name: s.name } });
      }
    }
  };

  /* ---- statement execution ---- */
  Interpreter.prototype.execBlock = function (stmts, scope) {
    for (var i = 0; i < stmts.length; i++) this.exec(stmts[i], scope);
  };

  Interpreter.prototype.exec = function (node, scope) {
    this.tick(node.line);
    switch (node.type) {
      case 'Declare': return this.execDeclare(node, scope);
      case 'Constant': {
        var val = this.eval(node.expr, scope);
        scope.declare(node.name, { value: val, isConst: true, declType: { kind: 'primitive', name: val.type } });
        return;
      }
      case 'Assign': return this.execAssign(node, scope);
      case 'Output': {
        var out = '';
        for (var i = 0; i < node.args.length; i++) out += this.toDisplay(this.eval(node.args[i], scope));
        this.output(out);
        return;
      }
      case 'Input': return this.execInput(node, scope);
      case 'If': {
        if (this.asBool(this.eval(node.cond, scope), node.line)) this.execBlock(node.then, scope);
        else if (node.else) this.execBlock(node.else, scope);
        return;
      }
      case 'Case': return this.execCase(node, scope);
      case 'For': return this.execFor(node, scope);
      case 'While': {
        while (this.asBool(this.eval(node.cond, scope), node.line)) { this.tick(node.line); this.execBlock(node.body, scope); }
        return;
      }
      case 'Repeat': {
        do { this.tick(node.line); this.execBlock(node.body, scope); } while (!this.asBool(this.eval(node.cond, scope), node.line));
        return;
      }
      case 'CallStmt': return this.execCall(node, scope);
      case 'ExprStmt': this.eval(node.expr, scope); return;
      case 'Return': {
        var rv = node.value ? this.eval(node.value, scope) : null;
        throw { __return: true, value: rv };
      }
      case 'Define': return this.execDefine(node, scope);
      case 'OpenFile': return this.execOpenFile(node, scope);
      case 'ReadFile': return this.execReadFile(node, scope);
      case 'WriteFile': return this.execWriteFile(node, scope);
      case 'CloseFile': return this.execCloseFile(node, scope);
      case 'Seek': return this.execSeek(node, scope);
      case 'GetRecord': return this.execGetRecord(node, scope);
      case 'PutRecord': return this.execPutRecord(node, scope);
      case 'ProcDef': this.procs[node.name.toLowerCase()] = node; return;
      case 'FuncDef': this.funcs[node.name.toLowerCase()] = node; return;
      case 'TypeDef': this.registerType(node); return;
      case 'ClassDef': this.classes[node.name.toLowerCase()] = node; return;
      default: err('Cannot execute statement of type ' + node.type, node.line);
    }
  };

  Interpreter.prototype.execDeclare = function (node, scope) {
    for (var i = 0; i < node.names.length; i++) {
      var def = this.defaultValue(node.typeSpec, scope, node.line);
      scope.declare(node.names[i], { value: def, isConst: false, declType: node.typeSpec });
    }
  };

  Interpreter.prototype.defaultValue = function (typeSpec, scope, line) {
    if (typeSpec.kind === 'primitive') {
      switch (typeSpec.name) {
        case 'INTEGER': return mkInt(0);
        case 'REAL': return mkReal(0);
        case 'BOOLEAN': return mkBool(false);
        case 'CHAR': return mkChar('');
        case 'STRING': return mkStr('');
        case 'DATE': return V('DATE', null);
      }
    }
    if (typeSpec.kind === 'array') {
      var dims = [];
      for (var d = 0; d < typeSpec.dims.length; d++) {
        var lo = this.toInt(this.eval(typeSpec.dims[d].low, scope), line);
        var hi = this.toInt(this.eval(typeSpec.dims[d].high, scope), line);
        dims.push({ low: lo, high: hi });
      }
      var data = {};
      var self = this;
      function fill(prefix, dimIndex) {
        if (dimIndex === dims.length) { data[prefix.join(',')] = self.defaultValue(typeSpec.of, scope, line); return; }
        for (var x = dims[dimIndex].low; x <= dims[dimIndex].high; x++) fill(prefix.concat(x), dimIndex + 1);
      }
      fill([], 0);
      return { type: 'ARRAY', value: { dims: dims, of: typeSpec.of, data: data } };
    }
    if (typeSpec.kind === 'named') {
      var td = this.types[typeSpec.name.toLowerCase()];
      if (td) {
        if (td.kind === 'record') {
          var fields = {};
          for (var f = 0; f < td.fields.length; f++) fields[td.fields[f].name.toLowerCase()] = this.defaultValue(td.fields[f].typeSpec, scope, line);
          return { type: 'RECORD', value: { typeName: td.name, fields: fields, schema: td.fields } };
        }
        if (td.kind === 'enum') return { type: 'ENUM', value: null };
        if (td.kind === 'pointer') return { type: 'POINTER', value: null };
        if (td.kind === 'set') return { type: 'SET', value: { elemType: td.of, items: [] } };
      }
      if (this.classes[typeSpec.name.toLowerCase()]) return { type: 'OBJECT', value: null };
      err('Unknown type: ' + typeSpec.name, line);
    }
    return mkInt(0);
  };

  Interpreter.prototype.execAssign = function (node, scope) {
    var val = this.eval(node.value, scope);
    var ref = this.resolveRef(node.target, scope, true);
    ref.set(this.coerceTo(val, ref.declType, node.line));
  };

  // returns {get, set, declType}
  Interpreter.prototype.resolveRef = function (node, scope, createIfMissing) {
    var self = this;
    if (node.type === 'Var') {
      var cell = scope.findCell(node.name);
      if (!cell) {
        // inside a method, a bare name may refer to an object field
        var to = scope.thisObj;
        if (to && to.value.fields.hasOwnProperty(node.name.toLowerCase())) {
          var fkey = node.name.toLowerCase();
          return {
            get: function () { return to.value.fields[fkey]; },
            set: function (v) { to.value.fields[fkey] = v; },
            declType: null
          };
        }
        if (createIfMissing) {
          cell = { value: mkInt(0), isConst: false, declType: null };
          // auto-declare in the *current* scope
          scope.declare(node.name, cell);
        } else err("Variable '" + node.name + "' is not declared", node.line);
      }
      if (cell.isConst && createIfMissing) err("Cannot assign to constant '" + node.name + "'", node.line);
      return {
        get: function () { return cell.value; },
        set: function (v) { cell.value = v; },
        get declType() { return cell.declType; }
      };
    }
    if (node.type === 'Index') {
      var arrRef = this.resolveRef(node.target, scope, false);
      var arr = arrRef.get();
      if (!arr || arr.type !== 'ARRAY') err('Cannot index a non-array value', node.line);
      var idx = [];
      for (var i = 0; i < node.indices.length; i++) idx.push(this.toInt(this.eval(node.indices[i], scope), node.line));
      this.checkBounds(arr, idx, node.line);
      var key = idx.join(',');
      return {
        get: function () { return arr.value.data[key]; },
        set: function (v) { arr.value.data[key] = v; },
        declType: arr.value.of
      };
    }
    if (node.type === 'Field') {
      var objRef = this.resolveRef(node.target, scope, false);
      var obj = objRef.get();
      if (obj && obj.type === 'RECORD') {
        var fk = node.name.toLowerCase();
        if (!obj.value.fields.hasOwnProperty(fk)) err("Record has no field '" + node.name + "'", node.line);
        var dt = null;
        if (obj.value.schema) for (var s = 0; s < obj.value.schema.length; s++) if (obj.value.schema[s].name.toLowerCase() === fk) dt = obj.value.schema[s].typeSpec;
        return {
          get: function () { return obj.value.fields[fk]; },
          set: function (v) { obj.value.fields[fk] = v; },
          declType: dt
        };
      }
      if (obj && obj.type === 'OBJECT') {
        var ok = node.name.toLowerCase();
        return {
          get: function () { return obj.value.fields[ok]; },
          set: function (v) { obj.value.fields[ok] = v; },
          declType: null
        };
      }
      err('Cannot access field of this value', node.line);
    }
    if (node.type === 'Deref') {
      var pRef = this.resolveRef(node.target, scope, false);
      var ptr = pRef.get();
      if (!ptr || ptr.type !== 'POINTER' || !ptr.value) err('Cannot dereference null pointer', node.line);
      var target = ptr.value; // {get,set}
      return { get: target.get, set: target.set, declType: null };
    }
    err('Invalid reference', node.line);
  };

  Interpreter.prototype.checkBounds = function (arr, idx, line) {
    var dims = arr.value.dims;
    if (idx.length !== dims.length) err('Array expects ' + dims.length + ' index value(s) but got ' + idx.length, line);
    for (var i = 0; i < dims.length; i++) {
      if (idx[i] < dims[i].low || idx[i] > dims[i].high)
        err('Array index ' + idx[i] + ' out of range [' + dims[i].low + ':' + dims[i].high + ']', line);
    }
  };

  Interpreter.prototype.coerceTo = function (val, declType, line) {
    if (!declType) return val;
    if (declType.kind === 'primitive') {
      var t = declType.name;
      if (t === 'REAL' && val.type === 'INTEGER') return mkReal(val.value);
      if (t === 'INTEGER' && val.type === 'REAL') {
        if (Number.isInteger(val.value)) return mkInt(val.value);
        err('Type error: cannot store REAL value ' + val.value + ' in an INTEGER', line);
      }
      if (t === 'STRING' && val.type === 'CHAR') return mkStr(val.value);
      if (t === 'CHAR' && val.type === 'STRING') {
        if (val.value.length <= 1) return mkChar(val.value);
        err('Type error: cannot store a multi-character STRING in a CHAR', line);
      }
      if (t === 'INTEGER' && val.type !== 'INTEGER') {
        if (val.type === 'STRING' && /^-?\d+$/.test(val.value.trim())) return mkInt(parseInt(val.value, 10));
        err('Type error: expected INTEGER but got ' + val.type, line);
      }
      if (t === 'REAL' && !isNum(val)) {
        if (val.type === 'STRING' && val.value.trim() !== '' && !isNaN(Number(val.value))) return mkReal(Number(val.value));
        err('Type error: expected REAL but got ' + val.type, line);
      }
      if (t === 'BOOLEAN' && val.type !== 'BOOLEAN') err('Type error: expected BOOLEAN but got ' + val.type, line);
    }
    return val;
  };

  Interpreter.prototype.execInput = function (node, scope) {
    var ref = this.resolveRef(node.target, scope, true);
    var raw = this.inputFn();
    if (raw == null) raw = '';
    raw = String(raw);
    var dt = ref.declType;
    var v;
    if (dt && dt.kind === 'primitive') {
      switch (dt.name) {
        case 'INTEGER': {
          var iv = parseInt(raw.trim(), 10);
          if (isNaN(iv)) err("Invalid INTEGER input: '" + raw + "'", node.line);
          v = mkInt(iv); break;
        }
        case 'REAL': {
          var rv = parseFloat(raw.trim());
          if (isNaN(rv)) err("Invalid REAL input: '" + raw + "'", node.line);
          v = mkReal(rv); break;
        }
        case 'BOOLEAN': {
          var b = raw.trim().toUpperCase();
          v = mkBool(b === 'TRUE' || b === '1' || b === 'YES'); break;
        }
        case 'CHAR': v = mkChar(raw); break;
        default: v = mkStr(raw);
      }
    } else {
      v = mkStr(raw);
    }
    ref.set(v);
  };

  Interpreter.prototype.execCase = function (node, scope) {
    var sel = this.eval(node.selector, scope);
    for (var i = 0; i < node.clauses.length; i++) {
      var cl = node.clauses[i];
      var match = false;
      if (cl.to) {
        var lo = this.eval(cl.value, scope), hi = this.eval(cl.to, scope);
        match = this.compare(sel, lo) >= 0 && this.compare(sel, hi) <= 0;
      } else {
        match = this.valueEquals(sel, this.eval(cl.value, scope));
      }
      if (match) { this.execBlock(cl.body, scope); return; }
    }
    if (node.otherwise) this.execBlock(node.otherwise, scope);
  };

  Interpreter.prototype.execFor = function (node, scope) {
    var start = this.toInt(this.eval(node.start, scope), node.line);
    var end = this.toInt(this.eval(node.end, scope), node.line);
    var step = node.step ? this.toInt(this.eval(node.step, scope), node.line) : 1;
    if (step === 0) err('FOR loop STEP cannot be 0', node.line);
    var cell = scope.findCell(node.varName);
    if (!cell) { cell = { value: mkInt(start), isConst: false, declType: { kind: 'primitive', name: 'INTEGER' } }; scope.declare(node.varName, cell); }
    for (var i = start; step > 0 ? i <= end : i >= end; i += step) {
      this.tick(node.line);
      cell.value = mkInt(i);
      this.execBlock(node.body, scope);
      i = cell.value.value; // allow body to modify the counter
    }
  };

  Interpreter.prototype.execCall = function (node, scope) {
    var proc = this.procs[node.name.toLowerCase()];
    if (!proc) {
      // maybe a function used as a statement (allowed leniently)
      if (this.funcs[node.name.toLowerCase()]) { this.callFunction(node.name, node.args, scope, node.line); return; }
      err("Procedure '" + node.name + "' is not defined", node.line);
    }
    this.invoke(proc, node.args, scope, node.line, null);
  };

  // invoke a procedure or function definition; returns value for functions
  Interpreter.prototype.invoke = function (def, argNodes, callerScope, line, thisObj) {
    if (++this.callDepth > this.maxDepth) { this.callDepth--; err('Maximum recursion depth exceeded', line); }
    var fnScope = new Scope(this.global);
    if (thisObj) fnScope.thisObj = thisObj;
    var params = def.params || [];
    if (argNodes.length !== params.length)
      { this.callDepth--; err("'" + def.name + "' expects " + params.length + ' argument(s) but got ' + argNodes.length, line); }

    var copyBacks = [];
    for (var i = 0; i < params.length; i++) {
      var p = params[i];
      if (p.mode === 'BYREF') {
        var argRef = this.resolveRef(argNodes[i], callerScope, false);
        var cell = { value: deepCopy(argRef.get()), isConst: false, declType: p.typeSpec };
        fnScope.declare(p.name, cell);
        copyBacks.push({ ref: argRef, cell: cell });
      } else {
        var val = deepCopy(this.eval(argNodes[i], callerScope));
        fnScope.declare(p.name, { value: this.coerceTo(val, p.typeSpec, line), isConst: false, declType: p.typeSpec });
      }
    }
    var result = null;
    try {
      this.execBlock(def.body, fnScope);
    } catch (e) {
      if (e && e.__return) result = e.value;
      else { this.callDepth--; throw e; }
    }
    // copy-out for BYREF
    for (var c = 0; c < copyBacks.length; c++) copyBacks[c].ref.set(copyBacks[c].cell.value);
    this.callDepth--;
    if (def.type === 'FuncDef') return result == null ? mkInt(0) : this.coerceTo(result, def.returns, line);
    return null;
  };

  Interpreter.prototype.callFunction = function (name, argNodes, scope, line) {
    var fn = this.funcs[name.toLowerCase()];
    if (!fn) return null;
    return this.invoke(fn, argNodes, scope, line, null);
  };

  /* ---- DEFINE (set) ---- */
  Interpreter.prototype.execDefine = function (node, scope) {
    var items = [];
    for (var i = 0; i < node.values.length; i++) items.push(this.eval(node.values[i], scope));
    scope.declare(node.name, { value: { type: 'SET', value: { setType: node.setType, items: items } }, isConst: true, declType: { kind: 'named', name: node.setType } });
  };

  /* ---- File handling (in-memory) ---- */
  Interpreter.prototype.fileKey = function (node, scope) { return this.toStr(this.eval(node, scope)); };

  Interpreter.prototype.execOpenFile = function (node, scope) {
    var name = this.fileKey(node.file, scope);
    if (this.files[name] && this.files[name].open) err("File '" + name + "' is already open", node.line);
    var existing = this.files[name];
    var lines = [];
    if (node.mode === 'READ' || node.mode === 'APPEND' || node.mode === 'RANDOM') {
      if (existing) lines = existing.lines.slice();
      else if (this.seedFiles[name] != null) lines = String(this.seedFiles[name]).split('\n');
    }
    if (node.mode === 'WRITE') lines = [];
    this.files[name] = { open: true, mode: node.mode, lines: lines, pos: 0, records: (existing && existing.records) || [] };
  };
  Interpreter.prototype.getOpenFile = function (name, line, mode) {
    var f = this.files[name];
    if (!f || !f.open) err("File '" + name + "' is not open", line);
    if (mode && f.mode !== mode && !(mode === 'WRITE' && f.mode === 'APPEND')) {
      // allow WRITEFILE in APPEND too
    }
    return f;
  };
  Interpreter.prototype.execReadFile = function (node, scope) {
    var name = this.fileKey(node.file, scope);
    var f = this.getOpenFile(name, node.line);
    if (f.mode !== 'READ') err("File '" + name + "' is not open for READ", node.line);
    if (f.pos >= f.lines.length) err("Attempt to read past end of file '" + name + "'", node.line);
    var ref = this.resolveRef(node.target, scope, true);
    ref.set(mkStr(f.lines[f.pos++]));
  };
  Interpreter.prototype.execWriteFile = function (node, scope) {
    var name = this.fileKey(node.file, scope);
    var f = this.getOpenFile(name, node.line);
    if (f.mode !== 'WRITE' && f.mode !== 'APPEND') err("File '" + name + "' is not open for WRITE/APPEND", node.line);
    f.lines.push(this.toStr(this.eval(node.value, scope)));
  };
  Interpreter.prototype.execCloseFile = function (node, scope) {
    var name = this.fileKey(node.file, scope);
    var f = this.files[name];
    if (!f || !f.open) err("File '" + name + "' is not open", node.line);
    f.open = false; f.pos = 0;
  };
  Interpreter.prototype.execSeek = function (node, scope) {
    var name = this.fileKey(node.file, scope);
    var f = this.getOpenFile(name, node.line);
    f.pos = this.toInt(this.eval(node.addr, scope), node.line);
  };
  Interpreter.prototype.execGetRecord = function (node, scope) {
    var name = this.fileKey(node.file, scope);
    var f = this.getOpenFile(name, node.line);
    var ref = this.resolveRef(node.target, scope, true);
    var rec = f.records[f.pos];
    if (rec != null) ref.set(deepCopy(rec));
  };
  Interpreter.prototype.execPutRecord = function (node, scope) {
    var name = this.fileKey(node.file, scope);
    var f = this.getOpenFile(name, node.line);
    f.records[f.pos] = deepCopy(this.eval(node.value, scope));
  };

  /* ------------------------------------------------------------------ *
   * Expression evaluation
   * ------------------------------------------------------------------ */
  Interpreter.prototype.eval = function (node, scope) {
    switch (node.type) {
      case 'Lit':
        if (node.valueType === 'INTEGER') return mkInt(node.value);
        if (node.valueType === 'REAL') return mkReal(node.value);
        if (node.valueType === 'STRING') return mkStr(node.value);
        if (node.valueType === 'CHAR') return mkChar(node.value);
        if (node.valueType === 'BOOLEAN') return mkBool(node.value);
        break;
      case 'Var': {
        var cell = scope.findCell(node.name);
        if (cell) return cell.value;
        // implicit "this" field access inside a method
        if (scope.thisObj && scope.thisObj.value.fields.hasOwnProperty(node.name.toLowerCase()))
          return scope.thisObj.value.fields[node.name.toLowerCase()];
        // maybe an enum member or zero-arg call? treat as undeclared
        err("Variable '" + node.name + "' is used before it is declared/assigned", node.line);
        break;
      }
      case 'BinOp': return this.evalBinOp(node, scope);
      case 'Unary': return this.evalUnary(node, scope);
      case 'Index': {
        var tval = this.eval(node.target, scope);
        if (tval && tval.type === 'STRING') {
          if (node.indices.length !== 1) err('A string is indexed with a single position', node.line);
          var p = this.toInt(this.eval(node.indices[0], scope), node.line);
          if (p < 1 || p > tval.value.length) err('String position ' + p + ' is out of range (1:' + tval.value.length + ')', node.line);
          return mkChar(tval.value.charAt(p - 1));
        }
        if (tval && tval.type === 'ARRAY') {
          var idx = [];
          for (var ii = 0; ii < node.indices.length; ii++) idx.push(this.toInt(this.eval(node.indices[ii], scope), node.line));
          this.checkBounds(tval, idx, node.line);
          return tval.value.data[idx.join(',')];
        }
        err('Cannot index a non-array value', node.line);
        break;
      }
      case 'Field': {
        var t = this.eval(node.target, scope);
        if (t && t.type === 'RECORD') {
          var fk = node.name.toLowerCase();
          if (!t.value.fields.hasOwnProperty(fk)) err("Record has no field '" + node.name + "'", node.line);
          return t.value.fields[fk];
        }
        if (t && t.type === 'OBJECT') return t.value.fields[node.name.toLowerCase()];
        err('Cannot access field of this value', node.line);
        break;
      }
      case 'Call': return this.evalCall(node, scope);
      case 'MethodCall': return this.evalMethodCall(node, scope);
      case 'New': return this.evalNew(node, scope);
      case 'SuperCall': return this.evalSuper(node, scope);
      case 'ArrayLit': {
        // represented loosely; only used when assigned to an array variable
        var items = [];
        for (var i = 0; i < node.items.length; i++) items.push(this.eval(node.items[i], scope));
        return { type: 'ARRAYLIT', value: items };
      }
      case 'AddrOf': {
        var r = this.resolveRef(node.operand, scope, false);
        return { type: 'POINTER', value: { get: r.get, set: r.set } };
      }
      case 'Deref': {
        var ref2 = this.resolveRef(node, scope, false);
        return ref2.get();
      }
    }
    err('Cannot evaluate expression', node.line);
  };

  Interpreter.prototype.evalUnary = function (node, scope) {
    var v = this.eval(node.operand, scope);
    if (node.op === 'NOT') return mkBool(!this.asBool(v, node.line));
    if (node.op === '-') { if (!isNum(v)) err('Unary minus needs a number', node.line); return v.type === 'INTEGER' ? mkInt(-v.value) : mkReal(-v.value); }
    if (node.op === '+') { if (!isNum(v)) err('Unary plus needs a number', node.line); return v; }
    err('Bad unary operator', node.line);
  };

  Interpreter.prototype.evalBinOp = function (node, scope) {
    var op = node.op;
    if (op === 'AND') return mkBool(this.asBool(this.eval(node.left, scope), node.line) && this.asBool(this.eval(node.right, scope), node.line));
    if (op === 'OR') return mkBool(this.asBool(this.eval(node.left, scope), node.line) || this.asBool(this.eval(node.right, scope), node.line));
    var l = this.eval(node.left, scope), r = this.eval(node.right, scope);
    switch (op) {
      case '&': return mkStr(this.toStr(l) + this.toStr(r));
      case '+': case '-': case '*': {
        this.numCheck(l, r, op, node.line);
        var a = l.value, b = r.value, res = op === '+' ? a + b : op === '-' ? a - b : a * b;
        return (l.type === 'INTEGER' && r.type === 'INTEGER') ? mkInt(res) : mkReal(res);
      }
      case '/': {
        this.numCheck(l, r, op, node.line);
        if (r.value === 0) err('Division by zero', node.line);
        return mkReal(l.value / r.value);
      }
      case 'DIV': {
        this.numCheck(l, r, op, node.line);
        if (r.value === 0) err('Division by zero (DIV)', node.line);
        return mkInt(Math.trunc(l.value / r.value));
      }
      case 'MOD': {
        this.numCheck(l, r, op, node.line);
        if (r.value === 0) err('Division by zero (MOD)', node.line);
        return mkInt(l.value % r.value);
      }
      case '=': return mkBool(this.valueEquals(l, r));
      case '<>': return mkBool(!this.valueEquals(l, r));
      case '<': return mkBool(this.compare(l, r) < 0);
      case '<=': return mkBool(this.compare(l, r) <= 0);
      case '>': return mkBool(this.compare(l, r) > 0);
      case '>=': return mkBool(this.compare(l, r) >= 0);
    }
    err('Unknown operator ' + op, node.line);
  };

  Interpreter.prototype.numCheck = function (l, r, op, line) {
    if (!isNum(l) || !isNum(r)) {
      // lenient: numeric strings
      if (l.type === 'STRING' && !isNaN(Number(l.value)) && l.value.trim() !== '') l.value = Number(l.value), l.type = (Number.isInteger(l.value) ? 'INTEGER' : 'REAL');
      if (r.type === 'STRING' && !isNaN(Number(r.value)) && r.value.trim() !== '') r.value = Number(r.value), r.type = (Number.isInteger(r.value) ? 'INTEGER' : 'REAL');
      if (!isNum(l) || !isNum(r)) err("Operator '" + op + "' needs numbers", line);
    }
  };

  Interpreter.prototype.valueEquals = function (a, b) {
    if (isNum(a) && isNum(b)) return a.value === b.value;
    if (a.type === 'ENUM' && b.type === 'ENUM') return a.value && b.value && a.value.name === b.value.name;
    if ((a.type === 'CHAR' || a.type === 'STRING') && (b.type === 'CHAR' || b.type === 'STRING')) return this.toStr(a) === this.toStr(b);
    if (a.type === 'BOOLEAN' && b.type === 'BOOLEAN') return a.value === b.value;
    return this.toStr(a) === this.toStr(b);
  };

  Interpreter.prototype.compare = function (a, b) {
    if (isNum(a) && isNum(b)) return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
    if (a.type === 'ENUM' && b.type === 'ENUM') return a.value.index - b.value.index;
    var sa = this.toStr(a), sb = this.toStr(b);
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  };

  /* ---- calls / builtins ---- */
  Interpreter.prototype.evalCall = function (node, scope) {
    var lname = node.name.toLowerCase();
    if (this.funcs[lname]) return this.invoke(this.funcs[lname], node.args, scope, node.line, null);
    // builtins
    var b = this.builtin(node.name, node.args, scope, node.line);
    if (b !== undefined) return b;
    // method self-call inside a method body
    if (scope.thisObj) {
      var cls = this.classes[scope.thisObj.value.className.toLowerCase()];
      var m = this.findMethod(cls, node.name);
      if (m) return this.invokeMethod(m.def, m.cls, node.args, scope, node.line, scope.thisObj);
    }
    // a procedure called like a function? not allowed to return value
    if (this.procs[lname]) { this.invoke(this.procs[lname], node.args, scope, node.line, null); return mkInt(0); }
    err("Function '" + node.name + "' is not defined", node.line);
  };

  Interpreter.prototype.builtin = function (name, argNodes, scope, line) {
    var up = name.toUpperCase();
    var self = this;
    function arg(i) { return self.eval(argNodes[i], scope); }
    function need(k) { if (argNodes.length !== k) err(up + ' expects ' + k + ' argument(s)', line); }
    switch (up) {
      case 'LENGTH': need(1); return mkInt(self.toStr(arg(0)).length);
      case 'LEFT': need(2); return mkStr(self.toStr(arg(0)).substring(0, self.toInt(arg(1), line)));
      case 'RIGHT': { need(2); var s = self.toStr(arg(0)); var x = self.toInt(arg(1), line); return mkStr(s.substring(s.length - x)); }
      case 'MID': { need(3); var st = self.toStr(arg(0)); var start = self.toInt(arg(1), line); var len = self.toInt(arg(2), line); return mkStr(st.substr(start - 1, len)); }
      case 'SUBSTRING': { need(3); var st2 = self.toStr(arg(0)); var start2 = self.toInt(arg(1), line); var len2 = self.toInt(arg(2), line); return mkStr(st2.substr(start2 - 1, len2)); }
      case 'LCASE': { need(1); var v = arg(0); return v.type === 'CHAR' ? mkChar(self.toStr(v).toLowerCase()) : mkStr(self.toStr(v).toLowerCase()); }
      case 'UCASE': { need(1); var v2 = arg(0); return v2.type === 'CHAR' ? mkChar(self.toStr(v2).toUpperCase()) : mkStr(self.toStr(v2).toUpperCase()); }
      case 'TO_UPPER': { need(1); var v2b = arg(0); return v2b.type === 'CHAR' ? mkChar(self.toStr(v2b).toUpperCase()) : mkStr(self.toStr(v2b).toUpperCase()); }
      case 'TO_LOWER': { need(1); var v2c = arg(0); return v2c.type === 'CHAR' ? mkChar(self.toStr(v2c).toLowerCase()) : mkStr(self.toStr(v2c).toLowerCase()); }
      case 'ASC': { need(1); return mkInt(self.toStr(arg(0)).charCodeAt(0) || 0); }
      case 'CHR': { need(1); return mkChar(String.fromCharCode(self.toInt(arg(0), line))); }
      case 'INT': { need(1); return mkInt(Math.trunc(self.toNum(arg(0), line))); }
      case 'INTEGER': { need(1); return mkInt(Math.trunc(self.toNum(arg(0), line))); }
      case 'ROUND': { need(2); var num = self.toNum(arg(0), line); var dp = self.toInt(arg(1), line); var f = Math.pow(10, dp); return mkReal(Math.round(num * f) / f); }
      case 'RAND': { need(1); return mkReal(Math.random() * self.toNum(arg(0), line)); }
      case 'RANDOM': { if (argNodes.length === 0) return mkReal(Math.random()); return mkReal(Math.random() * self.toNum(arg(0), line)); }
      case 'RANDOMBETWEEN': { need(2); var lo = self.toInt(arg(0), line), hi = self.toInt(arg(1), line); return mkInt(lo + Math.floor(Math.random() * (hi - lo + 1))); }
      case 'DIV': { need(2); return mkInt(Math.trunc(self.toNum(arg(0), line) / self.toNum(arg(1), line))); }
      case 'MOD': { need(2); return mkInt(self.toNum(arg(0), line) % self.toNum(arg(1), line)); }
      case 'NUM_TO_STR': case 'NUM_TO_STRING': case 'INT_TO_STRING': case 'REAL_TO_STRING': { need(1); return mkStr(self.toDisplay(arg(0))); }
      case 'STR_TO_NUM': case 'STRING_TO_NUM': case 'STRING_TO_INT': { need(1); var nn = Number(self.toStr(arg(0))); return Number.isInteger(nn) ? mkInt(nn) : mkReal(nn); }
      case 'EOF': { need(1); var fn = self.toStr(arg(0)); var f = self.files[fn]; if (!f) err("File '" + fn + "' is not open", line); return mkBool(f.pos >= f.lines.length); }
    }
    return undefined;
  };

  /* ---- OOP ---- */
  Interpreter.prototype.evalNew = function (node, scope) {
    var cls = this.classes[node.className.toLowerCase()];
    if (!cls) err("Class '" + node.className + "' is not defined", node.line);
    var obj = { type: 'OBJECT', value: { className: cls.name, fields: {} } };
    this.initClassFields(cls, obj, scope, node.line);
    var ctor = this.findMethod(cls, 'NEW');
    if (ctor) this.invokeMethod(ctor.def, ctor.cls, node.args, scope, node.line, obj);
    return obj;
  };
  Interpreter.prototype.initClassFields = function (cls, obj, scope, line) {
    if (cls.parent) { var p = this.classes[cls.parent.toLowerCase()]; if (p) this.initClassFields(p, obj, scope, line); }
    for (var i = 0; i < cls.fields.length; i++) {
      var f = cls.fields[i];
      obj.value.fields[f.names[0].toLowerCase()] = this.defaultValue(f.typeSpec, scope, line);
    }
  };
  Interpreter.prototype.findMethod = function (cls, name) {
    var c = cls;
    while (c) {
      for (var i = 0; i < c.methods.length; i++) if (c.methods[i].name.toLowerCase() === name.toLowerCase()) return { def: c.methods[i], cls: c };
      c = c.parent ? this.classes[c.parent.toLowerCase()] : null;
    }
    return null;
  };
  Interpreter.prototype.evalMethodCall = function (node, scope) {
    var obj = this.eval(node.object, scope);
    if (!obj || obj.type !== 'OBJECT') err('Cannot call method on a non-object', node.line);
    var cls = this.classes[obj.value.className.toLowerCase()];
    var m = this.findMethod(cls, node.method);
    if (!m) err("Method '" + node.method + "' not found on class " + obj.value.className, node.line);
    return this.invokeMethod(m.def, m.cls, node.args, scope, node.line, obj);
  };
  Interpreter.prototype.invokeMethod = function (def, cls, argNodes, callerScope, line, obj) {
    if (++this.callDepth > this.maxDepth) { this.callDepth--; err('Maximum recursion depth exceeded', line); }
    var fnScope = new Scope(this.global);
    fnScope.thisObj = obj;
    fnScope.currentClass = cls;
    var params = def.params || [];
    if (argNodes.length !== params.length) { this.callDepth--; err("Method '" + def.name + "' expects " + params.length + ' argument(s)', line); }
    for (var i = 0; i < params.length; i++) {
      var val = deepCopy(this.eval(argNodes[i], callerScope));
      fnScope.declare(params[i].name, { value: this.coerceTo(val, params[i].typeSpec, line), isConst: false, declType: params[i].typeSpec });
    }
    // field names resolve via thisObj (handled in eval/resolveRef)
    var result = null;
    try { this.execBlock(def.body, fnScope); }
    catch (e) { if (e && e.__return) result = e.value; else { this.callDepth--; throw e; } }
    this.callDepth--;
    if (def.type === 'FuncDef') return result == null ? mkInt(0) : result;
    return null;
  };
  Interpreter.prototype.evalSuper = function (node, scope) {
    var obj = scope.thisObj;
    var cls = scope.currentClass;
    if (!obj || !cls || !cls.parent) err('SUPER can only be used inside a subclass method', node.line);
    var parent = this.classes[cls.parent.toLowerCase()];
    var m = this.findMethod(parent, node.method);
    if (!m) err("SUPER has no method '" + node.method + "'", node.line);
    return this.invokeMethod(m.def, m.cls, node.args, scope, node.line, obj);
  };

  /* ---- conversions ---- */
  Interpreter.prototype.asBool = function (v, line) {
    if (v.type === 'BOOLEAN') return v.value;
    err('Expected a BOOLEAN value (TRUE/FALSE)', line);
  };
  Interpreter.prototype.toInt = function (v, line) {
    if (v.type === 'INTEGER') return v.value;
    if (v.type === 'REAL') { if (Number.isInteger(v.value)) return v.value; return Math.trunc(v.value); }
    if (v.type === 'STRING' && /^-?\d+$/.test(v.value.trim())) return parseInt(v.value, 10);
    err('Expected an INTEGER value', line);
  };
  Interpreter.prototype.toNum = function (v, line) {
    if (isNum(v)) return v.value;
    if (v.type === 'STRING' && v.value.trim() !== '' && !isNaN(Number(v.value))) return Number(v.value);
    err('Expected a numeric value', line);
  };
  Interpreter.prototype.toStr = function (v) {
    if (v == null) return '';
    switch (v.type) {
      case 'STRING': case 'CHAR': return v.value;
      case 'INTEGER': return String(v.value);
      case 'REAL': return fmtReal(v.value);
      case 'BOOLEAN': return v.value ? 'TRUE' : 'FALSE';
      case 'ENUM': return v.value ? v.value.name : 'NULL';
      case 'DATE': return v.value || '';
      case 'POINTER': return v.value ? '<pointer>' : 'NULL';
      case 'OBJECT': return v.value ? '<' + v.value.className + '>' : 'NULL';
      case 'RECORD': return '<record ' + v.value.typeName + '>';
      default: return String(v.value);
    }
  };
  Interpreter.prototype.toDisplay = function (v) { return this.toStr(v); };

  function fmtReal(n) {
    if (!isFinite(n)) return String(n);
    if (Number.isInteger(n)) return String(n);
    var r = parseFloat(n.toFixed(10));
    return String(r);
  }

  /* ------------------------------------------------------------------ *
   * Public API
   * ------------------------------------------------------------------ */
  function run(source, options) {
    options = options || {};
    var outBuf = [];
    var collect = function (s) { outBuf.push(s); };
    var interp = new Interpreter({
      output: options.output || collect,
      input: options.input,
      files: options.files,
      maxSteps: options.maxSteps,
      maxDepth: options.maxDepth
    });
    var result = { ok: true, output: '', error: null, files: null, needInput: false };
    try {
      var tokens = tokenize(source);
      var ast = new Parser(tokens).parseProgram();
      interp.run(ast);
      result.files = interp.files;
    } catch (e) {
      if (e && e.__needInput) { result.ok = false; result.needInput = true; }
      else if (e && e.__return) { /* top-level RETURN */ }
      else {
        result.ok = false;
        if (e instanceof PseudoError) result.error = { message: e.message, line: e.line };
        else result.error = { message: (e && e.message) || String(e), line: null };
      }
    }
    if (!options.output) result.output = outBuf.join('\n') + (outBuf.length ? '\n' : '');
    return result;
  }

  var API = { run: run, tokenize: tokenize, Parser: Parser, Interpreter: Interpreter, PseudoError: PseudoError, fmtReal: fmtReal };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  global.PseudoEngine = API;

})(typeof window !== 'undefined' ? window : globalThis);
