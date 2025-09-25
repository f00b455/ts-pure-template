/**
 * Base ESLint configuration for enforcing Clean Code principles
 * These rules apply to all packages in the monorepo
 */
module.exports = {
  rules: {
    // Enforce function length limits - Clean Code principle
    'max-lines-per-function': [
      'warn', // Start with 'warn' for Phase 1 assessment
      {
        max: 20,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: false
      }
    ],

    // Enforce file length limits
    'max-lines': [
      'warn', // Start with 'warn' for Phase 1 assessment
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true
      }
    ],

    // Enforce maximum statements in a function
    'max-statements': [
      'warn',
      15, // Slightly lower than max-lines to encourage cleaner code
      {
        ignoreTopLevelFunctions: false
      }
    ],

    // Enforce complexity limits
    'complexity': [
      'warn',
      {
        max: 10 // Cyclomatic complexity limit
      }
    ],

    // Enforce maximum depth of nested blocks
    'max-depth': [
      'warn',
      {
        max: 3
      }
    ],

    // Enforce maximum number of parameters
    'max-params': [
      'warn',
      {
        max: 4
      }
    ]
  },

  // Override for test files and step definitions
  overrides: [
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/test/**/*.ts',
        '**/tests/**/*.ts',
        '**/__tests__/**/*.ts',
        '**/features/**/*.ts',
        '**/step_definitions/**/*.ts',
        '**/e2e/**/*.ts',
        '**/*.steps.ts'
      ],
      rules: {
        // More lenient limits for test files
        'max-lines-per-function': [
          'warn',
          {
            max: 50, // Tests can be longer
            skipBlankLines: true,
            skipComments: true,
            IIFEs: false
          }
        ],
        'max-lines': [
          'warn',
          {
            max: 500, // Test files can be longer
            skipBlankLines: true,
            skipComments: true
          }
        ],
        'max-statements': [
          'warn',
          30 // Tests often need more statements for setup
        ],
        // Disable complexity rules for tests
        'complexity': 'off',
        'max-depth': 'off',
        'max-params': 'off'
      }
    }
  ]
};