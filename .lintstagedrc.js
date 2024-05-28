const path = require("path");

const buildAppsEslintCommand = (package) => (filenames) =>
  `npm run lint -w ${package} -- --fix --file ${filenames.map((f) => path.relative(`packages/${package}`, f)).join(" --file ")}`;

module.exports = {
  "packages/xtoken-home/src/**/*.{js,jsx,ts,tsx}": [buildAppsEslintCommand("xtoken-home")],
  "packages/xtoken-home/**/*.{js,jsx,ts,tsx,json}": "prettier --write",
  "packages/xtoken-ui/src/**/*.{js,jsx,ts,tsx}": "npm run lint:files -w xtoken-ui",
  "packages/xtoken-ui/**/*.{js,jsx,ts,tsx,html,json}": "prettier --write",
};
