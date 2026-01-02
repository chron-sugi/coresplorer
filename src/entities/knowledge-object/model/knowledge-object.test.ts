import { describe, it, expect } from 'vitest';
import {
  KO_TYPE_CONFIG,
  SPLUNK_KO_TYPES,
  getKoConfig,
  getKoLabel,
  getKoIcon,
  getKoBadgeClasses,
  getKoColor,
  isValidKoType,
  type SplunkKoType,
} from './knowledge-object';
import { HelpCircle, LayoutDashboard } from 'lucide-react';

describe('knowledge-object model', () => {
  describe('KO_TYPE_CONFIG', () => {
    it('should expose all known KO types', () => {
      const knownTypes = Object.values(SPLUNK_KO_TYPES);
      knownTypes.forEach(type => {
        expect(KO_TYPE_CONFIG).toHaveProperty(type);
      });
    });

    it('should map dashboard type to correct label and icon', () => {
      const cfg = KO_TYPE_CONFIG[SPLUNK_KO_TYPES.DASHBOARD];
      expect(cfg.label).toBe('Dashboard');
      expect(cfg.icon).toBe(LayoutDashboard);
      expect(cfg.badgeClasses).toContain('bg-blue-500');
    });
  });

  describe('getKoConfig', () => {
    it('should return config for a valid type', () => {
      const cfg = getKoConfig('dashboard');
      expect(cfg.label).toBe('Dashboard');
      expect(cfg.icon).toBe(LayoutDashboard);
      expect(cfg.badgeClasses).toContain('text-blue-400');
    });

    it('should return fallback config for unknown type', () => {
      const cfg = getKoConfig('not-a-type');
      expect(cfg.label).toBe('Unknown');
      expect(cfg.icon).toBe(HelpCircle);
      expect(cfg.badgeClasses).toContain('text-slate-300');
    });
  });

  describe('getKoLabel', () => {
    it('should return label for valid type', () => {
      expect(getKoLabel('dashboard')).toBe('Dashboard');
    });

    it('should return Unknown label for invalid type', () => {
      expect(getKoLabel('bad')).toBe('Unknown');
    });
  });

  describe('getKoIcon', () => {
    it('should return icon for valid type', () => {
      expect(getKoIcon('dashboard')).toBe(LayoutDashboard);
    });

    it('should return fallback icon for invalid type', () => {
      expect(getKoIcon('bad')).toBe(HelpCircle);
    });
  });

  describe('getKoBadgeClasses', () => {
    it('should include base classes and type-specific classes', () => {
      const classes = getKoBadgeClasses('dashboard');
      expect(classes).toContain('inline-block');
      expect(classes).toContain('bg-blue-500/10');
    });

    it('should include fallback classes for unknown type', () => {
      const classes = getKoBadgeClasses('bad');
      expect(classes).toContain('inline-block');
      expect(classes).toContain('bg-slate-700');
    });
  });

  describe('isValidKoType', () => {
    it('should accept known types', () => {
      const known: SplunkKoType = SPLUNK_KO_TYPES.DASHBOARD;
      expect(isValidKoType(known)).toBe(true);
    });

    it('should reject unknown values', () => {
      expect(isValidKoType('bad')).toBe(false);
      expect(isValidKoType('')).toBe(false);
    });
  });

  describe('getKoColor', () => {
    it('should return hex color for valid type', () => {
      expect(getKoColor('dashboard')).toBe('#3b82f6');
    });

    it('should return fallback color for unknown type', () => {
      expect(getKoColor('bad')).toBe('#cbd5e1');
    });
  });
});

