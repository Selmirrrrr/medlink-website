import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { content } from '../src/content/index.mjs';
import { languages, productIds, routes, url } from '../src/routes.mjs';

const site = 'https://www.med-link.org';
const dist = new URL('../dist/', import.meta.url).pathname;
const pages = languages.flatMap(lang => Object.keys(routes[lang]).map(page => ({ lang, page, path: url(lang,page) })));
const shapes = (value) => Array.isArray(value) ? value.map(shapes) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shapes(child)])) : typeof value;

test('all four locales contain the complete content and matching product structures', () => {
  for (const lang of languages) {
    assert.deepEqual(shapes(content[lang]), shapes(content.fr), `Incomplete translation: ${lang}`);
    assert.deepEqual(Object.keys(routes[lang]), Object.keys(routes.fr));
    for (const id of productIds) assert.ok(content[lang].products[id].intro.length > 70);
  }
  assert.equal(new Set(pages.map(p => p.path)).size, pages.length, 'Duplicate URL');
});

test('every locale is prerendered with content, canonical and reciprocal language links', async () => {
  for (const {lang,page,path} of pages) {
    const html = await readFile(join(dist,path,'index.html'),'utf8');
    assert.ok(html.includes(`<html lang="${lang}">`), path);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `One main heading: ${path}`);
    assert.ok(html.includes(`rel="canonical" href="${site}${path}"`), path);
    for (const other of languages) assert.ok(html.includes(`hreflang="${other}" href="${site}${url(other,page)}"`), `${path} -> ${other}`);
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(html.includes('application/ld+json'));
    assert.ok(!html.includes('wp-content') && !html.includes('wp-json'), `WordPress dependency in ${path}`);
    assert.ok(!html.includes('astro-island'), `Unexpected client framework on ${path}`);
    assert.ok(!html.includes('undefined'), `Missing content on ${path}`);
    if (page === 'home') assert.ok(html.includes(content[lang].hero.title));
  }
});

test('generated links, images, scripts and styles resolve without WordPress', async () => {
  const checked = new Set();
  for (const {path} of pages) {
    const html = await readFile(join(dist,path,'index.html'),'utf8');
    const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;','&'));
    for (const reference of references) {
      if (!reference.startsWith('/') && !reference.startsWith('#')) continue;
      const target = new URL(reference,site+path);
      const diskPath = join(dist,target.pathname,target.pathname.endsWith('/') ? 'index.html' : '');
      if (!checked.has(diskPath)) { await access(diskPath); checked.add(diskPath); }
      if (target.hash && diskPath.endsWith('.html')) {
        const targetHtml = await readFile(diskPath,'utf8');
        assert.ok(targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `Broken anchor ${path} -> ${reference}`);
      }
    }
  }
  const sitemap = await readFile(join(dist,'sitemap.xml'),'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length,pages.length);
  for (const page of pages) assert.ok(sitemap.includes(`<loc>${site}${page.path}</loc>`));
  const robots = await readFile(join(dist,'robots.txt'),'utf8');
  assert.ok(robots.includes(`${site}/sitemap.xml`));
});

test('migration keeps existing corporate URLs including the archived event', () => {
  const existing = ['/', '/a-propos/', '/innovation-medlink/', '/contact/', '/planification/', '/team-planner/', '/l-ia-dans-les-soins/', '/cockpit/', '/factoring/', '/dossier-clinique/', '/inscription-evenement/', '/de/kontact/', '/de/ueber-uns/', '/de/die-planung/', '/de/ki-in-der-pflege/', '/de/das-cockpit/', '/de/klinische-akte/', '/it/contatto/', '/it/su-di-noi/', '/it/la-pianificazione/', '/it/lia-redazionale-al-servizio-della-qualita/', '/it/il-cockpit/', '/it/cartella-clinica/'];
  for (const path of existing) assert.ok(pages.some(page => page.path === path), `Missing legacy URL ${path}`);
});
