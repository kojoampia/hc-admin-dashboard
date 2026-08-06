#!/usr/bin/env node
/**
 * Fail the build if the *generated* index.html contains anything the production CSP will block.
 *
 * This checks target/classes/static/index.html, not src/main/webapp/index.html, and that
 * distinction is the entire point. On 2026-08-06 production rendered as unstyled HTML because
 * Angular's `optimization.styles.inlineCritical` rewrote
 *
 *     <link rel="stylesheet" href="styles.<hash>.css">
 *
 * into
 *
 *     <link rel="stylesheet" href="styles.<hash>.css" media="print" onload="this.media='all'">
 *
 * and deploy/prod-server/hc-admin.conf serves `script-src 'self'` with no 'unsafe-inline' and no
 * 'unsafe-hashes'. The onload never ran, the sheet stayed print-only, and Tailwind plus the whole
 * Material theme silently did not apply. The source file was clean the whole time — the handler
 * only exists after a production build, so nothing that reads src/ could have seen it.
 *
 * Run against a build:  npm run webapp:build:prod && node scripts/check-index-csp.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const indexPath = path.join(process.cwd(), 'target/classes/static/index.html');

if (!fs.existsSync(indexPath)) {
  console.error(`No build to check at ${indexPath} — run \`npm run webapp:build:prod\` first.`);
  process.exit(1);
}

const raw = fs.readFileSync(indexPath, 'utf8');

// Blank out HTML comments before scanning: nothing inside one executes, so a commented-out
// <script> is not a CSP problem. Newlines are preserved so reported line numbers still match the
// real file. Without this the check fires on its own explanatory comment, and on the commented-out
// Google Analytics block that JHipster ships.
const html = raw.replace(/<!--[\s\S]*?-->/g, comment => comment.replace(/[^\n]/g, ' '));

const lineOf = index => html.slice(0, index).split('\n').length;
const problems = [];

// Inline <script> — a <script> with no src attribute. The module bundles Angular emits all carry
// src and are served from this origin, so they are fine.
for (const match of html.matchAll(/<script\b([^>]*)>/gi)) {
  if (!/\bsrc\s*=/i.test(match[1])) {
    problems.push({
      line: lineOf(match.index),
      what: 'inline <script>',
      detail: match[0].slice(0, 120),
      fix: "move it to a real .ts/.js file, or delete it if it's dead",
    });
  }
}

// Inline event handlers. `on` followed by letters, as an attribute with a value. Restricted to
// attribute position (preceded by whitespace) so that content="..." and similar do not match.
for (const match of html.matchAll(/\son([a-z]+)\s*=\s*["'][^"']*["']/gi)) {
  problems.push({
    line: lineOf(match.index),
    what: `inline handler on${match[1]}`,
    detail: match[0].trim().slice(0, 120),
    fix: match[1].toLowerCase() === 'load' ? 'likely inlineCritical — see angular.json production optimization' : 'bind it in a component instead',
  });
}

if (problems.length > 0) {
  console.error(`\n${indexPath}\n`);
  console.error('The production CSP is script-src \'self\'. These would be blocked in the browser:\n');
  for (const p of problems) {
    console.error(`  line ${p.line}: ${p.what}`);
    console.error(`    ${p.detail}`);
    console.error(`    fix: ${p.fix}\n`);
  }
  process.exit(1);
}

console.log(`${path.relative(process.cwd(), indexPath)}: no inline scripts or event handlers.`);
