// Common types for Cucumber World contexts
export interface BaseWorldContext {
  result?: any;
  results?: any[];
  error?: Error;
}

export interface ApiWorldContext extends BaseWorldContext {
  apiResponse?: Response;
  apiData?: unknown;
  startTime?: number;
}

export interface DataOperationsContext extends BaseWorldContext {
  inputArray?: any[];
  originalArray?: any[];
  transformer?: (item: any) => any;
  predicate?: (item: any) => boolean;
}

export interface ConfigContext extends BaseWorldContext {
  config?: any;
  greetConfig?: any;
  processor?: any;
  processors?: any[];
  greeter?: any;
}