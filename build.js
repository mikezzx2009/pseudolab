/* Assemble the standalone single-file index.html from src/ parts. */
var fs = require('fs');
var path = require('path');
var SRC = path.join(__dirname, 'src');

function read(f) { return fs.readFileSync(path.join(SRC, f), 'utf8'); }

var tpl = read('template.html');
var styles = read('styles.css');
var engine = read('engine.js');
var content = read('content.js');
var app = read('app.js');

// inline by replacing the placeholder comments (use function replacers so $ in code is literal)
var html = tpl
  .replace('/*__STYLES__*/', function () { return styles; })
  .replace('/*__ENGINE__*/', function () { return engine; })
  .replace('/*__CONTENT__*/', function () { return content; })
  .replace('/*__APP__*/', function () { return app; });

var out = path.join(__dirname, 'index.html');
fs.writeFileSync(out, html, 'utf8');
console.log('Wrote ' + out + '  (' + (html.length / 1024).toFixed(1) + ' KB)');

// sanity checks
var checks = [
  ['has DOCTYPE', /^<!DOCTYPE html>/.test(html)],
  ['no leftover STYLES placeholder', html.indexOf('__STYLES__') === -1],
  ['no leftover ENGINE placeholder', html.indexOf('__ENGINE__') === -1],
  ['no leftover CONTENT placeholder', html.indexOf('__CONTENT__') === -1],
  ['no leftover APP placeholder', html.indexOf('__APP__') === -1],
  ['engine present', html.indexOf('PseudoEngine') !== -1],
  ['content present', html.indexOf('PSEUDO_CONTENT') !== -1],
  ['app present', html.indexOf('buildPlayground') !== -1],
  ['four views', (html.match(/id="view-/g) || []).length === 4]
];
var bad = checks.filter(function (c) { return !c[1]; });
if (bad.length) { console.error('BUILD CHECK FAILED:', bad.map(function (c) { return c[0]; })); process.exit(1); }
console.log('All build checks passed (' + checks.length + ').');
