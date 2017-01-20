'use strict';

const postcss = require('postcss');
const parser = require('postcss-selector-parser');

function toArray(src) {
  return !src || Array.isArray(src) ? src : [src];
}

function test(rule, str) {
  return rule && typeof rule.test === 'function' ? rule.test(str) : rule === str;
}

// eslint-disable-next-line prefer-arrow-callback
module.exports = postcss.plugin('clean-decls', function postCssPluginCleanDecls(options) {
  if (!options.defs) {
    throw new TypeError('Missing rules.');
  }
  return function cleanDecls(css) {
    css.walkRules((rule) => {
      options.defs.some((def) => {
        const includes = toArray(def.includes);
        const excludes = toArray(def.excludes);
        const blacklist = toArray(def.blacklist);
        const whitelist = toArray(def.whitelist);

        let matches;
        parser((selectors) => {
          matches = (!includes || selectors.some(item => includes.some(include => test(include, item.toString().trim()))))
            && (!excludes || selectors.every(item => excludes.every(exclude => !test(exclude, item.toString().trim()))));
        }).process(rule.selector);

        if (matches) {
          if (blacklist) {
            blacklist.forEach((blacklistItem) => {
              rule.walkDecls(blacklistItem, (decl) => {
                if (!whitelist || !whitelist.some(whitelistItem => test(whitelistItem, decl.prop))) {
                  decl.remove();
                }
              });
            });
          }
          rule.walkDecls((decl) => {
            if (whitelist && !whitelist.some(whitelistItem => test(whitelistItem, decl.prop))) {
              decl.remove();
            }
          });
        }

        return matches;
      });
    });
  };
});
