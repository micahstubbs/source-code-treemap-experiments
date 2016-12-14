const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');
const jsonfile = require('jsonfile');
const csvWriter = require('csv-write-stream');

const inputFile = `h2o-3-raw.tsv`;
const data = d3.tsvParse(fs.readFileSync(inputFile, 'utf8'));

const outputData = [];

data.forEach(d => {
  if(
    // ignore build folders
    d.path.match(/h2o-3\/\.git/) === null &&
    d.path.match(/h2o-3\/.idea/) === null &&
    d.path.match(/h2o-3\/bigdata/) === null &&
    d.path.match(/h2o-3\/smalldata/) === null &&
    d.path.match(/h2o-3\/h2o-web\/node_modules/) === null &&
    d.path.match(/h2o-3\/build/) === null &&
    d.path.match(/h2o-3\/h2o-algos\/build/) === null &&
    d.path.match(/h2o-3\/h2o-bindings\/build/) === null &&
    d.path.match(/h2o-3\/h2o-core\/build/) === null &&
    d.path.match(/h2o-3\/h2o-docs\/build/) === null &&
    d.path.match(/h2o-3\/h2o-genmodel\/build/) === null &&
    d.path.match(/h2o-3\/h2o-hadoop\/h2o-mapreduce-generic\/build/) === null &&
    d.path.match(/h2o-3\/h2o-hadoop\/h2o-yarn-generic\/build/) === null &&
    d.path.match(/h2o-3\/h2o-parsers\/h2o-avro-parser\/build/) === null &&
    d.path.match(/h2o-3\/h2o-parsers\/h2o-orc-parser\/build/) === null &&
    d.path.match(/h2o-3\/h2o-parsers\/h2o-parquet-parser\/build/) === null &&
    d.path.match(/h2o-3\/h2o-persist-hdfs\/build/) === null &&
    d.path.match(/h2o-3\/h2o-persist-s3\/build/) === null &&
    d.path.match(/h2o-3\/h2o-web\/build/) === null &&
    d.path.match(/h2o-3\/h2o-web\/lib\/h2o-flow\/build/) === null && 
    d.path.match(/h2o-3\/h2o-app\/build/) === null &&
    d.path.match(/h2o-3\/h2o-py\/build/) === null &&
    d.path.match(/h2o-3\/h2o-r\/build/) === null &&
    d.path.match(/h2o-3\/h2o-scala\/build/) === null &&
    d.path.match(/h2o-3\/h2o-test-accuracy\/build/) === null &&
    d.path.match(/h2o-3\/h2o-test-integ\/build/) === null &&
    d.path.match(/h2o-3\/h2o-assembly\/build/) === null &&
    // ignore build files & folders that are not called build
    d.path.match(/h2o-web\/src\/main\/resources/) === null &&
    d.path.match(/h2o-web\/lib/) === null &&
    d.path.match(/h2o-docs\/routes.json/) === null &&
    d.path.match(/h2o-docs\/schemas.json/) === null &&
    // ignore binaries
    d.path.match(/\.jar/) === null &&
    d.path.match(/\.tar\.gz/) === null &&
    d.path.match(/\.whl/) === null &&
    d.path.match(/\.bin/) === null &&
    // ignore other large files & folders for now
    d.path.match(/h2o-3\/h2o-py\/h2o\/backend\/bin/) === null &&
    d.path.match(/h2o-3\/h2o-py\/dist/) === null &&
    d.path.match(/h2o-3\/h2o-r\/h2o-package\/inst\/java/) === null
  ) {
    outputData.push(d);
  }
})

const outputFile = 'h2o-3.csv';
// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream(outputFile));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();
