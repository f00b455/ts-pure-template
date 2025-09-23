import { describe, it, expect } from 'vitest';
import type { RssHeadline } from '../src/index';

describe('RssHeadline Type', () => {
  it('should create a valid RssHeadline object', () => {
    const headline: RssHeadline = {
      title: 'Test Headline',
      link: 'https://example.com/article',
      publishedAt: '2024-09-23T12:00:00Z',
      source: 'SPIEGEL',
    };

    expect(headline.title).toBe('Test Headline');
    expect(headline.link).toBe('https://example.com/article');
    expect(headline.publishedAt).toBe('2024-09-23T12:00:00Z');
    expect(headline.source).toBe('SPIEGEL');
  });

  it('should be readonly', () => {
    const headline: RssHeadline = {
      title: 'Immutable Headline',
      link: 'https://example.com/article',
      publishedAt: '2024-09-23T12:00:00Z',
      source: 'SPIEGEL',
    };

    // TypeScript will prevent these at compile time
    // These assertions verify the type system is working
    expect(() => {
      // @ts-expect-error - title is readonly
      headline.title = 'Modified';
    }).toThrow();
  });

  it('should work with JSON serialization', () => {
    const headline: RssHeadline = {
      title: 'Serializable Headline',
      link: 'https://example.com/article',
      publishedAt: '2024-09-23T12:00:00Z',
      source: 'SPIEGEL',
    };

    const json = JSON.stringify(headline);
    const parsed = JSON.parse(json) as RssHeadline;

    expect(parsed).toEqual(headline);
    expect(parsed.title).toBe(headline.title);
    expect(parsed.link).toBe(headline.link);
    expect(parsed.publishedAt).toBe(headline.publishedAt);
    expect(parsed.source).toBe(headline.source);
  });
});