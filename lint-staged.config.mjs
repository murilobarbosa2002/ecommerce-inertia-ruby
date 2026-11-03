export default {
  "*.{js,jsx,mjs,cjs,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,yml,yaml}": ["prettier --write"],
  "*.rb": ["bundle exec rubocop -a"],
};
