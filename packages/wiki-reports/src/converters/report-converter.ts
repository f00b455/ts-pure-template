export interface ConvertOptions {
  inputPath: string;
  outputPath: string;
  format: 'junit' | 'jest' | 'vitest' | 'cucumber' | 'playwright' | 'auto';
  metadata?: Record<string, any>;
}

export interface ConvertResult {
  success: boolean;
  outputPath: string;
  format: string;
  summary?: TestSummary;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration?: number;
  coverage?: CoverageSummary;
}

export interface CoverageSummary {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export abstract class ReportConverter {
  abstract canConvert(filePath: string): Promise<boolean>;
  abstract convert(options: ConvertOptions): Promise<ConvertResult>;
  abstract getSummary(filePath: string): Promise<TestSummary>;

  protected createHtmlTemplate(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        :root {
            --color-pass: #28a745;
            --color-fail: #dc3545;
            --color-skip: #ffc107;
            --color-border: #dee2e6;
            --color-bg: #f8f9fa;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: var(--color-bg);
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .summary {
            display: flex;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .summary-card {
            flex: 1;
            min-width: 120px;
            padding: 15px;
            background: white;
            border-radius: 6px;
            text-align: center;
            border: 2px solid var(--color-border);
        }
        .summary-card.pass {
            border-color: var(--color-pass);
            color: var(--color-pass);
        }
        .summary-card.fail {
            border-color: var(--color-fail);
            color: var(--color-fail);
        }
        .summary-card.skip {
            border-color: var(--color-skip);
            color: var(--color-skip);
        }
        .summary-value {
            font-size: 28px;
            font-weight: bold;
        }
        .summary-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-suite {
            margin-bottom: 20px;
            border: 1px solid var(--color-border);
            border-radius: 6px;
            overflow: hidden;
        }
        .suite-header {
            padding: 15px;
            background: var(--color-bg);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .suite-header:hover {
            background: #e9ecef;
        }
        .suite-tests {
            padding: 0;
            display: none;
        }
        .suite-tests.expanded {
            display: block;
        }
        .test-case {
            padding: 10px 15px;
            border-top: 1px solid var(--color-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-case.pass {
            background: rgba(40, 167, 69, 0.05);
        }
        .test-case.fail {
            background: rgba(220, 53, 69, 0.05);
        }
        .test-case.skip {
            background: rgba(255, 193, 7, 0.05);
        }
        .test-name {
            flex: 1;
        }
        .test-status {
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .test-status.pass {
            background: var(--color-pass);
            color: white;
        }
        .test-status.fail {
            background: var(--color-fail);
            color: white;
        }
        .test-status.skip {
            background: var(--color-skip);
            color: #333;
        }
        .error-details {
            margin-top: 10px;
            padding: 10px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
        }
        .coverage-section {
            margin-top: 30px;
            padding: 20px;
            background: var(--color-bg);
            border-radius: 8px;
        }
        .coverage-bar {
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 10px 0;
        }
        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--color-fail), var(--color-skip), var(--color-pass));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.3s ease;
        }
        @media (max-width: 768px) {
            .summary {
                flex-direction: column;
            }
            .summary-card {
                min-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
    <script>
        // Toggle test suite expansion
        document.querySelectorAll('.suite-header').forEach(header => {
            header.addEventListener('click', () => {
                const tests = header.nextElementSibling;
                if (tests) {
                    tests.classList.toggle('expanded');
                }
            });
        });
    </script>
</body>
</html>`;
  }

  protected formatDuration(ms?: number): string {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }
}