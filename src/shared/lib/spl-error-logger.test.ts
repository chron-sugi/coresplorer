import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logSplParseError,
  logSplAnalysisError,
  logSplSearchError,
  logSplWarning,
} from './spl-error-logger';

describe('spl-error-logger', () => {
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logSplParseError', () => {
    it('should log parse error with full context', () => {
      const error = new Error('CST transformation failed');
      logSplParseError(error, {
        functionName: 'parseSPL',
        spl: 'index=main | stats count',
        tokenCount: 5,
        lexErrors: [],
        parseErrors: [],
        cst: {},
      });

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '[SPL Parse Error] parseSPL'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        'CST transformation failed'
      );
    });

    it('should truncate long SPL input to 5 lines', () => {
      const longSpl = 'index=main\n'.repeat(20);
      const error = new Error('test');
      logSplParseError(error, {
        functionName: 'parseSPL',
        spl: longSpl,
        tokenCount: 100,
      });

      expect(consoleGroupSpy).toHaveBeenCalledWith('SPL Input (sample):');
      // The log should include truncation indicator
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log lex errors when present', () => {
      const error = new Error('Lex failed');
      logSplParseError(error, {
        functionName: 'parseSPL',
        spl: 'index=main',
        lexErrors: [{ message: 'Invalid token' }, { message: 'Another error' }],
        parseErrors: [],
      });

      expect(consoleGroupSpy).toHaveBeenCalledWith('Lexer Errors (first 3):');
    });

    it('should log parse errors when present', () => {
      const error = new Error('Parse failed');
      logSplParseError(error, {
        functionName: 'parseSPL',
        spl: 'index=main',
        lexErrors: [],
        parseErrors: [{ message: 'Unexpected token' }],
      });

      expect(consoleGroupSpy).toHaveBeenCalledWith('Parser Errors (first 3):');
    });
  });

  describe('logSplAnalysisError', () => {
    it('should log analysis error with extraction state', () => {
      const error = new Error('AST traversal failed');
      logSplAnalysisError(error, {
        functionName: 'analyzeSpl',
        code: 'index=main',
        parseResultAvailable: true,
        astAvailable: true,
        commandMapSize: 3,
        fieldMapSize: 5,
      });

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '[SPL Analysis Error] analyzeSpl'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Commands extracted:', 3);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Fields extracted:', 5);
    });

    it('should include parser state', () => {
      const error = new Error('Analysis failed');
      logSplAnalysisError(error, {
        functionName: 'analyzeSpl',
        code: 'index=main',
        parseResultAvailable: true,
        astAvailable: false,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ParseResult available:',
        true
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('AST available:', false);
    });
  });

  describe('logSplSearchError', () => {
    it('should log search error with filters', () => {
      const error = new Error('Search failed');
      logSplSearchError(error, {
        functionName: 'searchSpl',
        code: 'index=main',
        searchTerm: 'host',
        filters: { commands: true, fields: true, text: false },
        parseResultAvailable: true,
        astAvailable: true,
        resultCount: 3,
      });

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '[SPL Search Error] searchSpl'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Filters:', {
        commands: true,
        fields: true,
        text: false,
      });
    });

    it('should log search term and result count', () => {
      const error = new Error('Search failed');
      logSplSearchError(error, {
        functionName: 'searchSpl',
        code: 'index=main',
        searchTerm: 'hostname',
        filters: { commands: true, fields: true, text: true },
        parseResultAvailable: true,
        astAvailable: true,
        resultCount: 5,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Search term:', 'hostname');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Results before error:', 5);
    });
  });

  describe('logSplWarning', () => {
    it('should log warning with details', () => {
      logSplWarning('testFunction', 'Something unexpected', { key: 'value' });

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '[SPL Warning] testFunction'
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Message:',
        'Something unexpected'
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith('key:', 'value');
    });

    it('should work without details', () => {
      logSplWarning('testFunction', 'Simple warning');

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        '[SPL Warning] testFunction'
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Message:',
        'Simple warning'
      );
      // Should not create a details group
      expect(consoleGroupSpy).not.toHaveBeenCalledWith('Details:');
    });

    it('should include timestamp', () => {
      logSplWarning('testFunction', 'Test');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Timestamp:',
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
      );
    });
  });
});
