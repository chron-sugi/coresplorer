/**
 * SPL Parser Unicode Tests
 *
 * Tests for Unicode and special character handling in the parser.
 * Covers field names, string literals, and various Unicode edge cases.
 *
 * @module entities/spl/lib/parser/grammar/unicode.test
 */

import { describe, it, expect } from 'vitest';
import { parseSPL } from '../index';

// =============================================================================
// STRING LITERALS - UNICODE CONTENT
// =============================================================================

describe('unicode: string literals', () => {
  it('handles ASCII string', () => {
    const spl = 'index=main | eval msg="Hello World"';
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles accented characters in string', () => {
    const spl = 'index=main | eval msg="café résumé naïve"';
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles Chinese characters in string', () => {
    const spl = 'index=main | eval msg="你好世界"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Japanese characters in string', () => {
    const spl = 'index=main | eval msg="こんにちは"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Korean characters in string', () => {
    const spl = 'index=main | eval msg="안녕하세요"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Cyrillic characters in string', () => {
    const spl = 'index=main | eval msg="Привет мир"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Arabic characters in string', () => {
    const spl = 'index=main | eval msg="مرحبا بالعالم"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Hebrew characters in string', () => {
    const spl = 'index=main | eval msg="שלום עולם"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles emoji in string', () => {
    const spl = 'index=main | eval msg="Hello 🎉 World 🌍"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles multiple emoji in string', () => {
    const spl = 'index=main | eval status="🔥 🚀 ✅ ❌ ⚠️"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles mixed scripts in string', () => {
    const spl = 'index=main | eval msg="Hello 你好 こんにちは"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Greek characters in string', () => {
    const spl = 'index=main | eval msg="Γειά σου κόσμε"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Thai characters in string', () => {
    const spl = 'index=main | eval msg="สวัสดีโลก"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// SEARCH VALUES - UNICODE
// =============================================================================

describe('unicode: search values', () => {
  it('handles Unicode in search term', () => {
    const spl = 'index=main 你好';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Unicode in quoted search term', () => {
    const spl = 'index=main "café latte"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Unicode in field value', () => {
    const spl = 'index=main user="山田太郎"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles emoji in search term', () => {
    const spl = 'index=main status="🔥"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// REX PATTERNS - UNICODE
// =============================================================================

describe('unicode: rex patterns', () => {
  it('handles Unicode in rex pattern', () => {
    const spl = 'index=main | rex field=_raw "用户:(?<user>\\w+)"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Unicode capture group name (if supported)', () => {
    // Most regex engines require ASCII for group names
    // This test verifies the parser doesn't crash
    const spl = 'index=main | rex field=_raw "(?<用户>\\w+)"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// SPECIAL UNICODE CHARACTERS
// =============================================================================

describe('unicode: special characters', () => {
  it('handles non-breaking space in string', () => {
    const spl = 'index=main | eval msg="hello\u00A0world"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles zero-width space in string', () => {
    const spl = 'index=main | eval msg="hello\u200Bworld"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles zero-width non-joiner in string', () => {
    const spl = 'index=main | eval msg="test\u200Cvalue"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles zero-width joiner in string', () => {
    const spl = 'index=main | eval msg="test\u200Dvalue"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles byte order mark in string', () => {
    const spl = 'index=main | eval msg="\uFEFFhello"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles combining diacritical marks', () => {
    // e followed by combining acute accent = é
    const spl = 'index=main | eval msg="cafe\u0301"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// HOMOGLYPHS - LOOK-ALIKE CHARACTERS
// =============================================================================

describe('unicode: homoglyphs', () => {
  it('handles Cyrillic а (looks like Latin a)', () => {
    // Cyrillic а (U+0430) looks like Latin a (U+0061)
    const spl = 'index=main | eval \u0430=1'; // Cyrillic а
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Greek omicron (looks like o)', () => {
    // Greek omicron (U+03BF) looks like Latin o
    const spl = 'index=main | eval \u03BF=1';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('distinguishes between Latin and Cyrillic in strings', () => {
    const spl1 = 'index=main | eval msg="abc"'; // Latin
    const spl2 = 'index=main | eval msg="\u0430\u0432\u0441"'; // Cyrillic а, в, с
    expect(() => parseSPL(spl1)).not.toThrow();
    expect(() => parseSPL(spl2)).not.toThrow();
  });
});

// =============================================================================
// SURROGATE PAIRS - EXTENDED UNICODE
// =============================================================================

describe('unicode: surrogate pairs and extended Unicode', () => {
  it('handles emoji requiring surrogate pairs', () => {
    // 🎉 is U+1F389, requires surrogate pair in JavaScript
    const spl = 'index=main | eval status="🎉"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles multiple emoji in sequence', () => {
    const spl = 'index=main | eval icons="👨‍👩‍👧‍👦"'; // Family emoji
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles flag emoji (regional indicators)', () => {
    const spl = 'index=main | eval flag="🇺🇸"'; // US flag
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles skin tone modifiers', () => {
    const spl = 'index=main | eval hand="👋🏽"'; // Waving hand with skin tone
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles mathematical symbols', () => {
    const spl = 'index=main | eval formula="∑∏∫∂"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles ancient scripts', () => {
    const spl = 'index=main | eval script="𓂀𓃭"'; // Egyptian hieroglyphs
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// NORMALIZATION FORMS
// =============================================================================

describe('unicode: normalization', () => {
  it('handles precomposed character (NFC)', () => {
    // é as single character U+00E9
    const spl = 'index=main | eval msg="caf\u00E9"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles decomposed character (NFD)', () => {
    // e + combining acute accent
    const spl = 'index=main | eval msg="cafe\u0301"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles both forms produce valid parse', () => {
    const nfc = 'index=main | eval msg="\u00E9"'; // Precomposed é
    const nfd = 'index=main | eval msg="e\u0301"'; // e + combining accent
    expect(() => parseSPL(nfc)).not.toThrow();
    expect(() => parseSPL(nfd)).not.toThrow();
  });
});

// =============================================================================
// RTL (RIGHT-TO-LEFT) TEXT
// =============================================================================

describe('unicode: RTL text', () => {
  it('handles RTL text in string', () => {
    const spl = 'index=main | eval msg="مرحبا"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles mixed LTR and RTL in string', () => {
    const spl = 'index=main | eval msg="Hello مرحبا World"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles RTL override characters', () => {
    const spl = 'index=main | eval msg="\u202Ehello\u202C"'; // RLO and PDF
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Hebrew with punctuation', () => {
    const spl = 'index=main | eval msg="שלום!"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// VERTICAL TEXT AND CJK
// =============================================================================

describe('unicode: CJK specific', () => {
  it('handles CJK unified ideographs', () => {
    const spl = 'index=main | eval msg="漢字"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles CJK Extension B (rare characters)', () => {
    const spl = 'index=main | eval msg="𠀀"'; // CJK Extension B character
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles fullwidth characters', () => {
    const spl = 'index=main | eval msg="ＡＢＣＤ"'; // Fullwidth Latin
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles halfwidth katakana', () => {
    const spl = 'index=main | eval msg="ｱｲｳｴｵ"'; // Halfwidth katakana
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Hangul syllables', () => {
    const spl = 'index=main | eval msg="한글"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// CURRENCY AND NUMBER SYMBOLS
// =============================================================================

describe('unicode: currency and symbols', () => {
  it('handles common currency symbols', () => {
    const spl = 'index=main | eval msg="$€£¥₹"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Bitcoin symbol', () => {
    const spl = 'index=main | eval currency="₿"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles superscript numbers', () => {
    const spl = 'index=main | eval power="x²y³"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles subscript numbers', () => {
    const spl = 'index=main | eval formula="H₂O"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles fraction characters', () => {
    const spl = 'index=main | eval frac="½¼¾"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// EDGE CASES - EMPTY AND BOUNDARY
// =============================================================================

describe('unicode: edge cases', () => {
  it('handles empty string after Unicode', () => {
    const spl = 'index=main | eval msg="你好" | eval empty=""';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Unicode followed by ASCII', () => {
    const spl = 'index=main | eval msg="日本語test"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles ASCII followed by Unicode', () => {
    const spl = 'index=main | eval msg="test日本語"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles single Unicode character string', () => {
    const spl = 'index=main | eval char="中"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles very long Unicode string', () => {
    const longStr = '日本語'.repeat(100);
    const spl = `index=main | eval msg="${longStr}"`;
    expect(() => parseSPL(spl)).not.toThrow();
  });
});
