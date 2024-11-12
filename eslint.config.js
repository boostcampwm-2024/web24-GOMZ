import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...(await import('./client/eslint.config.js').then((m) => m.default)),
  },
);
