import { Component, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { LANGUAGES } from 'app/config/language.constants';

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  pt: '🇵🇹',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
  ru: '🇷🇺',
  it: '🇮🇹',
  nl: '🇳🇱',
  pl: '🇵🇱',
  tr: '🇹🇷',
};

const LANG_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  ru: 'Русский',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
};

@Component({
  selector: 'hpd-language-menu',
  standalone: true,
  imports: [UpperCasePipe, MatButtonModule, MatMenuModule],
  templateUrl: './language-menu.component.html',
  styleUrl: './language-menu.component.scss',
})
export class LanguageMenuComponent {
  readonly languages = LANGUAGES;
  readonly currentLang = signal(inject(TranslateService).currentLang || 'en');

  private readonly translateService = inject(TranslateService);
  private readonly stateStorageService = inject(StateStorageService);

  flagOf(lang: string): string {
    return LANG_FLAGS[lang] ?? '🌐';
  }

  nameOf(lang: string): string {
    return LANG_NAMES[lang] ?? lang.toUpperCase();
  }

  changeLanguage(lang: string): void {
    this.stateStorageService.storeLocale(lang);
    this.translateService.use(lang);
    this.currentLang.set(lang);
  }
}
