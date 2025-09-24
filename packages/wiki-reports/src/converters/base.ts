import type { ConversionResult, ReportFormat } from '../types';

export abstract class ReportConverter {
  abstract readonly format: ReportFormat;

  abstract convert(data: unknown): Promise<ConversionResult>;

  protected createHtmlTemplate(title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .passed { color: #28a745; }
    .failed { color: #dc3545; }
    .skipped { color: #ffc107; }
    .error { color: #dc3545; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .test-row.passed { background: rgba(40, 167, 69, 0.1); }
    .test-row.failed { background: rgba(220, 53, 69, 0.1); }
    .test-row.skipped { background: rgba(255, 193, 7, 0.1); }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 10px 0;
    }
    .collapsible {
      cursor: pointer;
      user-select: none;
    }
    .collapsible:before {
      content: '▶';
      display: inline-block;
      margin-right: 6px;
      transition: transform 0.3s;
    }
    .collapsible.active:before {
      transform: rotate(90deg);
    }
    .collapsible-content {
      display: none;
      margin-top: 10px;
    }
    .collapsible-content.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
  <script>
    document.querySelectorAll('.collapsible').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('active');
        const content = item.nextElementSibling;
        if (content) {
          content.classList.toggle('show');
        }
      });
    });
  </script>
</body>
</html>`;
  }

  protected escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}