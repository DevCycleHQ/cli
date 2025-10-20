import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            'no-param-reassign': 'error',
            'no-case-declarations': 'off',
            '@typescript-eslint/no-this-alias': [
                'error',
                {
                    allowDestructuring: true,
                    allowedNames: ['engine'],
                },
            ],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-unused-expressions': 'error',
        },
    },
    {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
        },
    },
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            globals: {
                require: 'readonly',
                process: 'readonly',
                global: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                Buffer: 'readonly',
            },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '.yarn/**',
            'oclif.manifest.json',
            'test-utils/fixtures/**/*.js',
            'bin/**',
        ],
    },
)
