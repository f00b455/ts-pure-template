import { describe, it, expect } from 'vitest';
import {
  formatCucumberReport,
  parseCucumberJson,
  type CucumberReport
} from './formatter';

describe('formatCucumberReport', () => {
  it('should format a simple report', () => {
    const report: CucumberReport = {
      features: [
        {
          name: 'Test Feature',
          elements: [
            {
              name: 'Test Scenario',
              type: 'scenario',
              steps: [
                {
                  name: 'test step',
                  keyword: 'Given',
                  result: { status: 'passed' },
                  duration: 1000000
                }
              ]
            }
          ]
        }
      ]
    };

    const result = formatCucumberReport(report);

    expect(result).toContain('# Cucumber Test Report');
    expect(result).toContain('## Test Feature');
    expect(result).toContain('### Test Scenario');
    expect(result).toContain('✅ Given test step');
  });

  it('should show summary statistics', () => {
    const report: CucumberReport = {
      features: [
        {
          name: 'Feature',
          elements: [
            {
              name: 'Passed',
              type: 'scenario',
              steps: [
                {
                  name: 'step',
                  keyword: 'Given',
                  result: { status: 'passed' }
                }
              ]
            },
            {
              name: 'Failed',
              type: 'scenario',
              steps: [
                {
                  name: 'step',
                  keyword: 'When',
                  result: { status: 'failed' }
                }
              ]
            }
          ]
        }
      ]
    };

    const result = formatCucumberReport(report);

    expect(result).toContain('## Summary');
    expect(result).toContain('**Total Scenarios:** 2');
    expect(result).toContain('**Passed:** 1');
    expect(result).toContain('**Failed:** 1');
  });

  it('should format duration correctly', () => {
    const report: CucumberReport = {
      features: [
        {
          name: 'Feature',
          elements: [
            {
              name: 'Scenario',
              type: 'scenario',
              steps: [
                {
                  name: 'fast step',
                  keyword: 'Given',
                  result: { status: 'passed' },
                  duration: 500000
                },
                {
                  name: 'slow step',
                  keyword: 'When',
                  result: { status: 'passed' },
                  duration: 5000000000
                }
              ]
            }
          ]
        }
      ]
    };

    const result = formatCucumberReport(report);

    expect(result).toContain('(0.50ms)');
    expect(result).toContain('(5.00s)');
  });
});

describe('parseCucumberJson', () => {
  it('should parse valid JSON', () => {
    const json = JSON.stringify([
      {
        name: 'Feature',
        elements: []
      }
    ]);

    const result = parseCucumberJson(json);

    expect(result.features).toHaveLength(1);
    expect(result.features[0]?.name).toBe('Feature');
  });

  it('should handle object format', () => {
    const json = JSON.stringify({
      features: [
        {
          name: 'Feature',
          elements: []
        }
      ]
    });

    const result = parseCucumberJson(json);

    expect(result.features).toHaveLength(1);
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseCucumberJson('invalid')).toThrow();
  });
});