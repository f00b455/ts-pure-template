import { describe, it, expect, vi } from 'vitest';
import {
  FooProcessor,
  createFooProcessor,
  fooTransform,
  fooFilter,
} from '../src/index.js';

vi.mock('@ts-template/shared', () => ({
  greet: vi.fn((name: string) => `Hello, ${name}!`),
}));

describe('lib-foo', () => {
  describe('FooProcessor', () => {
    it('should process input with prefix', () => {
      const processor = new FooProcessor({ prefix: 'FOO: ' });
      const result = processor.process('test');
      expect(result).toBe('FOO: test');
    });

    it('should process input with prefix and suffix', () => {
      const processor = new FooProcessor({ prefix: 'FOO: ', suffix: ' :BAR' });
      const result = processor.process('test');
      expect(result).toBe('FOO: test :BAR');
    });

    it('should greet with foo processing', () => {
      const processor = new FooProcessor({ prefix: '[FOO] ' });
      const result = processor.greetWithFoo('World');
      expect(result).toBe('[FOO] Hello, World!');
    });
  });

  describe('createFooProcessor', () => {
    it('should create FooProcessor instance', () => {
      const processor = createFooProcessor({ prefix: 'TEST: ' });
      expect(processor).toBeInstanceOf(FooProcessor);
      expect(processor.process('data')).toBe('TEST: data');
    });
  });

  describe('fooTransform', () => {
    it('should transform array items', () => {
      const data = ['a', 'b', 'c'];
      const transformer = (item: string) => item.toUpperCase();
      const result = fooTransform(data, transformer);
      expect(result).toEqual(['A', 'B', 'C']);
    });
  });

  describe('fooFilter', () => {
    it('should filter array items', () => {
      const numbers = [1, 2, 3, 4, 5];
      const predicate = (n: number) => n % 2 === 0;
      const result = fooFilter(numbers, predicate);
      expect(result).toEqual([2, 4]);
    });

    it('should filter string array', () => {
      const strings = ['foo', 'bar', 'foobar'];
      const predicate = (s: string) => s.includes('foo');
      const result = fooFilter(strings, predicate);
      expect(result).toEqual(['foo', 'foobar']);
    });
  });
});
