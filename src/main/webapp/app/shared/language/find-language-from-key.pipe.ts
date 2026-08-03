import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'findLanguageFromKey',
})
export default class FindLanguageFromKeyPipe implements PipeTransform {
  private languages: { [key: string]: { name: string; rtl?: boolean } } = {
    en: { name: 'English' },
    fr: { name: 'Français' },
    de: { name: 'Deutsch' },
    // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object
  };

  transform(lang: string): string {
    // An unknown key is possible — the needle above is edited by the generator, and callers pass
    // whatever is in the account. Fall back to the key rather than throwing on `.name` of undefined.
    return this.languages[lang]?.name ?? lang;
  }
}
