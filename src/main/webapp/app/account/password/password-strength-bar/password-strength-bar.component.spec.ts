import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import PasswordStrengthBarComponent from './password-strength-bar.component';

describe('PasswordStrengthBarComponent', () => {
  let comp: PasswordStrengthBarComponent;
  let fixture: ComponentFixture<PasswordStrengthBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PasswordStrengthBarComponent],
    })
      .overrideTemplate(PasswordStrengthBarComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordStrengthBarComponent);
    comp = fixture.componentInstance;
  });

  describe('PasswordStrengthBarComponents', () => {
    it('should initialize with default values', () => {
      expect(comp.measureStrength('')).toBe(0);
      // Five steps, weakest first, and getColor() clamps into that range — see the assertions
      // below. The literal palette used to be repeated here; it is the BridgeCare status ramp now,
      // and pinning the hexes in two places only meant the test had to be edited alongside a
      // purely visual change it could not otherwise detect.
      expect(comp.colors).toHaveLength(5);
      expect(comp.colors.every(color => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
      expect(comp.getColor(0).idx).toBe(1);
      expect(comp.getColor(0).color).toBe(comp.colors[0]);
    });

    it('should increase strength upon password value change', () => {
      expect(comp.measureStrength('')).toBe(0);
      expect(comp.measureStrength('aa')).toBeGreaterThanOrEqual(comp.measureStrength(''));
      expect(comp.measureStrength('aa^6')).toBeGreaterThanOrEqual(comp.measureStrength('aa'));
      expect(comp.measureStrength('Aa090(**)')).toBeGreaterThanOrEqual(comp.measureStrength('aa^6'));
      expect(comp.measureStrength('Aa090(**)+-07365')).toBeGreaterThanOrEqual(comp.measureStrength('Aa090(**)'));
    });

    it('should change the color based on strength', () => {
      expect(comp.getColor(0).color).toBe(comp.colors[0]);
      expect(comp.getColor(11).color).toBe(comp.colors[1]);
      expect(comp.getColor(22).color).toBe(comp.colors[2]);
      expect(comp.getColor(33).color).toBe(comp.colors[3]);
      expect(comp.getColor(44).color).toBe(comp.colors[4]);
    });
  });
});
