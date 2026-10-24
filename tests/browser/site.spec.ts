import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { languages, routes, url } from '../../src/routes.mjs';

for (const lang of languages) {
  for (const width of [390, 1440]) {
    test(`${lang}: all pages render at ${width}px without overflow or missing assets`, async ({page}) => {
      await page.setViewportSize({width,height:900});
      const errors: string[] = [];
      const external: string[] = [];
      page.on('pageerror',error => errors.push(error.message));
      page.on('requestfailed',request => errors.push(request.url()));
      page.on('response',response => { if(response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      page.on('request',request => { if(!request.url().startsWith('http://127.0.0.1:4322')) external.push(request.url()); });
      for (const id of Object.keys(routes[lang])) {
        const response = await page.goto(url(lang,id));
        expect(response?.status()).toBe(200);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('html')).toHaveAttribute('lang',lang);
        await expect(page.locator('h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),url(lang,id)).toBe(true);
        await page.locator('footer').scrollIntoViewIfNeeded();
        await expect.poll(() => page.locator('img').evaluateAll(images => images.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
      }
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
    });
  }
}

for(const id of ['home','care','planning','team','scribe','cockpit','factoring','contact','about','platform','privacy','event']) {
  test(`${id}: automated accessibility checks`,async ({page}) => {
    await page.goto(url('fr',id));
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  });
}

test('language switch keeps the current solution and navigation works by keyboard',async ({page}) => {
  await page.goto('/dossier-clinique/');
  await page.locator('.language-menu summary').click();
  await page.locator('.language-options a[lang="de"]').click();
  await expect(page).toHaveURL(/\/de\/klinische-akte\//);
  await expect(page.locator('h1')).toContainText('Die ganze Patientengeschichte.');
  await page.locator('.solutions-menu summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mega-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.mega-menu')).not.toBeVisible();
  await expect(page.locator('.solutions-menu summary')).toBeFocused();
});

test('mobile menu, filters and solution links work',async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#main-nav')).not.toBeVisible();
  await page.locator('.mobile-toggle').click();
  await expect(page.locator('#main-nav')).toBeVisible();
  await page.locator('.solutions-menu summary').click();
  await expect(page.locator('.mega-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.locator('[data-filter="care"]').click();
  await expect(page.locator('.solution-card:visible')).toHaveCount(2);
  await page.locator('[data-filter="management"]').click();
  await expect(page.locator('.solution-card:visible')).toHaveCount(4);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator('.solution-card:visible')).toHaveCount(6);
  await page.locator('.solution-card a[href="/factoring/"]').click();
  await expect(page.locator('h1')).toContainText('Du soin facturé');
});

for(const lang of languages) {
  test(`${lang}: demo request validates inputs and prepares an encoded email without sending data`,async ({page,context}) => {
    await context.grantPermissions(['clipboard-read','clipboard-write']);
    await page.goto(`${url(lang,'contact')}?interest=scribe#demo`);
    await expect(page.locator('select[name="interest"]')).toHaveValue('scribe');
    await page.locator('.form-submit').click();
    await expect(page.locator('.form-result')).not.toBeVisible();
    await page.locator('[name="name"]').fill('Zoë Müller & Rossi');
    await page.locator('[name="company"]').fill('Example care organisation');
    await page.locator('[name="email"]').fill('invalid-email');
    await page.locator('[name="message"]').fill('A demo for 20 people? Please discuss FR & DE.');
    await page.locator('.form-submit').click();
    await expect(page.locator('.form-result')).not.toBeVisible();
    await page.locator('[name="email"]').fill('demo@example.org');
    let posted = false;
    page.on('request',request => { if(request.method() === 'POST') posted = true; });
    await page.locator('.form-submit').click();
    await expect(page.locator('.form-result')).toBeVisible();
    const href = await page.locator('#email-link').getAttribute('href');
    expect(href).toContain('mailto:info@med-link.org?subject=');
    const body = new URL(href!).searchParams.get('body')!;
    expect(body).toContain('Zoë Müller & Rossi');
    expect(body).toContain('MedLink Scribe');
    expect(body).toContain('FR & DE.');
    await page.locator('#copy-message').click();
    expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(body);
    expect(posted).toBe(false);
    await page.locator('[name="message"]').fill('Updated message');
    await expect(page.locator('.form-result')).not.toBeVisible();
  });
}

test('content, language navigation and contact fallback work without JavaScript',async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/en/');
  await expect(page.locator('h1')).toContainText('More time for care.');
  await expect(page.locator('.solution-card')).toHaveCount(6);
  await page.locator('.language-menu summary').click();
  await page.locator('.language-options a[lang="it"]').click();
  await expect(page).toHaveURL(/\/it\//);
  await page.goto('http://127.0.0.1:4322/en/contact/');
  await expect(page.locator('noscript a')).toHaveAttribute('href','mailto:info@med-link.org');
  await expect(page.locator('#contact-form')).not.toBeVisible();
  await context.close();
});

test('404 returns an actual missing-page response and useful language links',async ({page}) => {
  const response = await page.goto('/missing-medlink-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex');
  await expect(page.locator('main a')).toHaveCount(4);
});

test('small phones and tablets fit all four homepages',async ({page}) => {
  for(const lang of languages) for(const width of [320,768,1024]) {
    await page.setViewportSize({width,height:900});
    await page.goto(url(lang));
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),`${lang} at ${width}px`).toBe(true);
  }
});
