import { greet } from '@ts-template/shared';

export interface FooConfig {
  prefix: string;
  suffix?: string;
}

export class FooProcessor {
  constructor(private config: FooConfig) {}

  process(input: string): string {
    const processed = `${this.config.prefix}${input}${this.config.suffix || ''}`;
    return processed;
  }

  greetWithFoo(name: string): string {
    const greeting = greet(name);
    return this.process(greeting);
  }
}

export const createFooProcessor = (config: FooConfig): FooProcessor => {
  return new FooProcessor(config);
};

export const fooTransform = (data: string[], transformer: (item: string) => string): string[] => {
  return data.map(transformer);
};

export const fooFilter = <T>(items: T[], predicate: (item: T) => boolean): T[] => {
  return items.filter(predicate);
};