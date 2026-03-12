import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/utils/slugify';

describe('slugify', () => {
  it('converts basic text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes accents', () => {
    expect(slugify('Protocolo Saúde Total')).toBe('protocolo-saude-total');
    expect(slugify('Ação Rápida')).toBe('acao-rapida');
    expect(slugify('São João')).toBe('sao-joao');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
    expect(slugify('Price: $100')).toBe('price-100');
  });

  it('replaces multiple spaces with single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('replaces underscores with hyphens', () => {
    expect(slugify('hello_world_test')).toBe('hello-world-test');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
    expect(slugify('---hello---')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('handles mixed case', () => {
    expect(slugify('Hello WORLD Test')).toBe('hello-world-test');
  });

  it('handles numbers', () => {
    expect(slugify('Módulo 1 - Introdução')).toBe('modulo-1-introducao');
  });
});
