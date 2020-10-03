const createReporter = require('istanbul-api').createReporter;
const istanbulCoverage = require('istanbul-lib-coverage');
const glob = require('glob');

const map = istanbulCoverage.createCoverageMap();
const reporter = createReporter();
const jsons = glob.sync('./coverage/stlmpp/**/coverage-final.json').map(require);

for (const json of jsons) {
  for (const file of Object.values(json)) {
    map.addFileCoverage(file);
  }
}

reporter.addAll(['html', 'lcovonly', 'text-summary']);
reporter.write(map);
