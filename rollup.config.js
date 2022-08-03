import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

const externalSet = new Set(['@kubric/utils']);

export default [
  // browser-friendly UMD build
  {
    // Change input file as required(point to js file if not a typescript library)
    input: 'src/index.ts',

    output: {
      // Change output library name
      name: 'resolver',
      file: pkg.browser,
      format: 'umd',
      global: {
        '@kubric/utils': 'litedash',
      },
    },

    external: (id) => id.includes('@babel/runtime') || externalSet.has(id),

    plugins: [
      // Remove if not a typescript library
      typescript(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      babel({
        babelrc: false,
        exclude: 'node_modules/**',
        plugins: [
          require('@babel/plugin-proposal-class-properties'),
          require('@babel/plugin-proposal-function-bind'),
          require('@babel/plugin-proposal-object-rest-spread'),
        ],
        extensions: ['.js', '.ts'],
      }),
      commonjs(), // so Rollup can convert external deps to ES6
      terser(),
    ],
  },

  {
    // Change input file as required(point to js file if not a typescript library)
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    external: (id) => id.includes('@babel/runtime') || externalSet.has(id),

    plugins: [
      // Remove if not a typescript library
      typescript(),
    ],
  },
];
