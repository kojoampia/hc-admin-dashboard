import { Component, ElementRef, Input, Renderer2, inject } from '@angular/core';

import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'hpd-password-strength-bar',
  imports: [SharedModule],
  templateUrl: './password-strength-bar.component.html',
  styleUrl: './password-strength-bar.component.scss',
})
export default class PasswordStrengthBarComponent {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);

  /**
   * Weakest to strongest, on the BridgeCare status tokens rather than the pure-RGB ramp
   * (#F00 → #0F0) this shipped with. Two of those were unusable as a signal: #FF0 and #9F0 are
   * 1.07:1 and 1.6:1 against white, so the middle of the scale was effectively invisible.
   * Kept as literals because the bar is painted through Renderer2.setStyle, not a class.
   */
  colors = ['#b3402f', '#c2503f', '#b4741a', '#2e7d5b', '#2a7554'];

  measureStrength(p: string): number {
    let force = 0;
    const regex = /[$-/:-?{-~!"^_`[\]]/g; // "
    const lowerLetters = /[a-z]+/.test(p);
    const upperLetters = /[A-Z]+/.test(p);
    const numbers = /\d+/.test(p);
    const symbols = regex.test(p);

    const flags = [lowerLetters, upperLetters, numbers, symbols];
    const passedMatches = flags.filter((isMatchedFlag: boolean) => isMatchedFlag === true).length;

    force += 2 * p.length + (p.length >= 10 ? 1 : 0);
    force += passedMatches * 10;

    // penalty (short password)
    force = p.length <= 6 ? Math.min(force, 10) : force;

    // penalty (poor variety of characters)
    force = passedMatches === 1 ? Math.min(force, 10) : force;
    force = passedMatches === 2 ? Math.min(force, 20) : force;
    force = passedMatches === 3 ? Math.min(force, 40) : force;

    return force;
  }

  getColor(s: number): { idx: number; color: string } {
    let idx = 0;
    if (s > 10) {
      if (s <= 20) {
        idx = 1;
      } else if (s <= 30) {
        idx = 2;
      } else if (s <= 40) {
        idx = 3;
      } else {
        idx = 4;
      }
    }
    // idx is clamped to 0..4 above and `colors` has exactly five entries, so this cannot be
    // undefined — asserted rather than guarded so a real out-of-range idx would surface, not hide.
    return { idx: idx + 1, color: this.colors[idx]! };
  }

  @Input()
  set passwordToCheck(password: string) {
    if (password) {
      const c = this.getColor(this.measureStrength(password));
      const element = this.elementRef.nativeElement;
      if (element.className) {
        this.renderer.removeClass(element, element.className);
      }
      const lis = element.getElementsByTagName('li');
      for (let i = 0; i < lis.length; i++) {
        if (i < c.idx) {
          this.renderer.setStyle(lis[i], 'backgroundColor', c.color);
        } else {
          this.renderer.setStyle(lis[i], 'backgroundColor', 'var(--hpd-color-border)');
        }
      }
    }
  }
}
