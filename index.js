'use strict';

const postcss = require('postcss');

function test(rule, str) {
  return rule && typeof rule.test === 'function' ? rule.test(str) : rule === str;
}

// eslint-disable-next-line prefer-arrow-callback
module.exports = postcss.plugin('clean-decls', function postCssPluginCleanDecls(options) {
  const blacklist = !options.blacklist || Array.isArray(options.blacklist) ? options.blacklist : [options.blacklist];
  const whitelist = !options.whitelist || Array.isArray(options.whitelist) ? options.whitelist : [options.whitelist];
  return function cleanDecls(css) {
    if (blacklist) {
      blacklist.forEach((blacklistItem) => {
        css.walkDecls(blacklistItem, (decl) => {
          if (!whitelist || !whitelist.some(whitelistItem => test(whitelistItem, decl.prop))) {
            decl.remove();
          }
        });
      });
    }
    css.walkDecls((decl) => {
      if (whitelist && !whitelist.some(whitelistItem => test(whitelistItem, decl.prop))) {
        decl.remove();
      }
    });
  };
});
