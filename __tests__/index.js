'use strict';

const postcss = require('postcss');
const plugin = require('../index.js');

async function run(input, output, opts) {
  const result = await postcss([plugin(opts)]).process(input);
  expect(result.css.trim()).toEqual(output.trim());
  expect(result.warnings().length).toBe(0);
}

it(`Should honor black list`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; }', {
    defs: [{ blacklist: 'background-color' }],
  });
});

it(`Should honor black list with regular expression`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; }', {
    defs: [{ blacklist: /^background/ }],
  });
});

it(`Should honor black list in array`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { }', {
    defs: [{ blacklist: ['color', /^background/] }],
  });
});

it(`Should honor white list`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { background-color: white; }', {
    defs: [{ whitelist: 'background-color' }],
  });
});

it(`Should honor white list with regular expression`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { background-color: white; }', {
    defs: [{ whitelist: /^background/ }],
  });
});

it(`Should honor white list in array`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; background-color: white; }', {
    defs: [{ whitelist: ['color', /^background/] }],
  });
});

it(`Should put white list bigger priority than black list`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; }', {
    defs: [{
      blacklist: ['color', /^background/],
      whitelist: /^color$/,
    }],
  });
});

it(`Should process if the selector is in the include list`, async () => {
  await run('.foo, .bar { background-color: white; }', '.foo, .bar { }', {
    defs: [{
      includes: '.foo',
      blacklist: 'background-color',
    }],
  });
});

it(`Shouldn't process if the selector isn't in the include list`, async () => {
  await run('.foo, .bar { background-color: white; }', '.foo, .bar { background-color: white; }', {
    defs: [{
      includes: '.class',
      blacklist: 'background-color',
    }],
  });
});

it(`Shouldn't process if the selector is in the exclude list`, async () => {
  await run('.foo, .bar { background-color: white; }', '.foo, .bar { background-color: white; }', {
    defs: [{
      excludes: '.foo',
      blacklist: 'background-color',
    }],
  });
});

it(`Should process if the selector isn't in the exclude list`, async () => {
  await run('.foo, .bar { background-color: white; }', '.foo, .bar { }', {
    defs: [{
      excludes: '.class',
      blacklist: 'background-color',
    }],
  });
});

it(`Should put exclude list bigger priority than include list`, async () => {
  await run('.foo, .bar { background-color: white; }', '.foo, .bar { background-color: white; }', {
    defs: [{
      includes: ['.foo', '.bar'],
      excludes: '.foo',
      blacklist: 'background-color',
    }],
  });
});

it(`Should process only the rules matching selectors`, async () => {
  await run('.foo, .bar { background-color: white; } .foo { background-color: white; }',
    '.foo, .bar { background-color: white; } .foo { }',
    {
      defs: [
        {
          includes: '.foo',
          excludes: '.bar',
          blacklist: 'background-color',
        },
      ],
    });
});

it(`Should bail at the first match of the rule`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; }', {
    defs: [
      {
        includes: /^\.c/i,
        blacklist: 'background-color',
      },
      {
        includes: '.class',
        blacklist: 'color',
      },
    ],
  });
});
