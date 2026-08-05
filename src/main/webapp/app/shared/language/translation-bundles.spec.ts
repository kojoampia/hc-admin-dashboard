import fs from 'fs';
import path from 'path';

/**
 * Structural checks over the i18n bundles.
 *
 * <p>Nothing else catches these. A key present in English and missing in French does not fail a
 * build, fail a lint, or throw at runtime — ngx-translate renders the key itself, so
 * `adminDashboard.alerts.title` appears on screen where a title should be, and only a French-reading
 * user ever finds out.
 *
 * <p>The 2026-08 audit found exactly that class of drift: `hcAdminServiceHCService.json` existed in
 * `fr` and `de`, had no English counterpart, and was referenced by no template at all — the fossil
 * of a screen that was started and dropped.
 */
describe('i18n bundles', () => {
  const i18nRoot = path.join(__dirname, '../../../i18n');
  const locales = fs
    .readdirSync(i18nRoot)
    .filter(entry => fs.statSync(path.join(i18nRoot, entry)).isDirectory())
    .sort();

  /** `en` is the source of truth: it is the language the templates are written in. */
  const reference = 'en';

  const flatten = (value: unknown, prefix = ''): string[] => {
    if (value === null || typeof value !== 'object') {
      return [prefix];
    }
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
      flatten(nested, prefix ? `${prefix}.${key}` : key),
    );
  };

  const keysOf = (locale: string, file: string): string[] =>
    flatten(JSON.parse(fs.readFileSync(path.join(i18nRoot, locale, file), 'utf8'))).sort();

  const filesOf = (locale: string): string[] =>
    fs
      .readdirSync(path.join(i18nRoot, locale))
      .filter(name => name.endsWith('.json'))
      .sort();

  it('ships more than one locale, or this suite is meaningless', () => {
    expect(locales.length).toBeGreaterThan(1);
    expect(locales).toContain(reference);
  });

  describe.each(locales.filter(locale => locale !== reference))('%s', locale => {
    it('has exactly the same bundle files as en', () => {
      expect(filesOf(locale)).toEqual(filesOf(reference));
    });

    it.each(filesOf(reference))('%s has exactly the same keys as en', file => {
      // Both directions matter: a missing key renders as the raw key, and an extra one is dead
      // weight a translator will keep maintaining.
      expect(keysOf(locale, file)).toEqual(keysOf(reference, file));
    });
  });

  /**
   * The `null` key in every enum bundle is a JHipster convention — it is the label for "no value
   * selected" and is empty on purpose, in all three locales. Anything else empty is a translator
   * having started a bundle and not finished it, which renders as a blank where a word should be.
   */
  it('has no empty translations', () => {
    const empties: string[] = [];
    for (const locale of locales) {
      for (const file of filesOf(locale)) {
        const bundle = JSON.parse(fs.readFileSync(path.join(i18nRoot, locale, file), 'utf8'));
        const walk = (value: unknown, trail: string): void => {
          if (typeof value === 'string') {
            if (value.trim() === '' && !trail.endsWith('.null')) {
              empties.push(`${locale}/${file}:${trail}`);
            }
          } else if (value && typeof value === 'object') {
            for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
              walk(nested, trail ? `${trail}.${key}` : key);
            }
          }
        };
        walk(bundle, '');
      }
    }
    expect(empties).toEqual([]);
  });
});
