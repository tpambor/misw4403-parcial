import newman from 'newman';
import path from 'path';
import fs from 'fs';

async function newmanRun(collection) {
  return new Promise(function (onResolve) {
    newman
      .run({
        collection: collection,
        reporters: 'cli',
        globalVar: [{ key: 'baseURL', value: 'http://localhost:3000/api/v1' }],
      })
      .on('done', function (_, summary) {
        onResolve(summary);
      });
  });
}

async function runAllTest() {
  const testFolder = path.resolve(import.meta.dirname, 'collections');
  const collections = fs.readdirSync(testFolder);

  let totalAsserts = 0;
  let totalAssertsFailed = 0;
  let totalFailures = 0;

  for (const collection of collections) {
    const testCollection = path.resolve(testFolder, collection);

    // skip if filename does not end with .postman_collection.json
    if (!collection.endsWith('.postman_collection.json')) {
      continue;
    }

    const summary = await newmanRun(testCollection);
    totalFailures += summary.run.failures.length;
    totalAsserts += summary.run.stats.assertions.total;
    totalAssertsFailed += summary.run.stats.assertions.failed;
  }

  console.log(
    `\n\n### Total\nFailures: ${totalFailures}\nAssertions: ${totalAsserts - totalAssertsFailed}/${totalAsserts} passed\n`,
  );
  return totalFailures;
}

if ((await runAllTest()) > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
