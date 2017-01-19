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
    blacklist: 'background-color',
  });
});

it(`Should honor black list with regular expression`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; }', {
    blacklist: /^background/,
  });
});

it(`Should honor black list in array`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { }', {
    blacklist: ['color', /^background/],
  });
});

it(`Should honor white list`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { background-color: white; }', {
    whitelist: 'background-color',
  });
});

it(`Should honor white list with regular expression`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { background-color: white; }', {
    whitelist: /^background/,
  });
});

it(`Should honor white list in array`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; background-color: white; }', {
    whitelist: ['color', /^background/],
  });
});

it(`Should put white list bigger priority than black list`, async () => {
  await run('.class { color: black; background-color: white; }', '.class { color: black; }', {
    blacklist: ['color', /^background/],
    whitelist: /^color$/,
  });
});
