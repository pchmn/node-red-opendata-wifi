global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const csv = require("csvtojson"),
      cassandra = require('cassandra-driver'),
      Rx = require('rxjs'),
      request = require('request'),
      fs = require("fs");

function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);

  request
    .get(url)
    .on('error', function(err) {
      console.log(err);
      return;
    })
    .on('response', function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(saveToCassandra());  // close() is async, call cb after close completes.
      });
    })
}

function saveToCassandra() {
  const records = require('../csv/data.json');

  var client = new cassandra.Client({
            contactPoints: ["127.0.0.1"],
            keyspace: "donnees_urbaines"
        });

  var query = 'INSERT INTO opendata_wifi (id, language, start_time, output_octets, input_octets, site, duration, device, os, browser) VALUES (:id, :language, :start_time, :output_octets, :input_octets, :site, :duration, :device, :os, :browser)';

  var id = 0;

  records.forEach(function(record) {
    var params = {
      id: record.recordid,
      language: record.fields.langue,
      start_time: record.fields.start_time,
      output_octets: record.fields.output_octets,
      input_octets: record.fields.input_octets,
      site: record.fields.site,
      duration: record.fields.duration,
      device: record.fields.device,
      os: record.fields.os,
      browser: record.fields.browser,
    };

    client.execute(query, params, { prepare: true })
      .then(result => {
          msg.payload = result.rows;
          node.send(msg);
      })
      .catch(err => {
        node.error(err, msg);
      })
  })
}

saveToCassandra();

/*download(
  "https://opendata.paris.fr/explore/dataset/utilisations_mensuelles_des_hotspots_paris_wi-fi/download/?format=json&timezone=Europe/Berlin", 
  "csv/data.json", 
  function() {
    console.log("donwloaded");
});*/



/*    var client = new cassandra.Client({
            contactPoints: ["127.0.0.1"],
            keyspace: "donnees_urbaines"
        });

    var query = 'INSERT INTO opendata_wifi (id, language, start_time, output_octets, input_octets, site, duration, device, os, browser) VALUES (:id, :language, :start_time, :output_octets, :input_octets, :site, :duration, :device, :os, :browser)';

    var id = 0;

    csv({delimiter: ";"})
      .fromFile("csv/utilisations_mensuelles_des_hotspots_paris_wi-fi.csv")
      .on('json', (record) => {
          // combine csv header row and csv line to a json object
          // jsonObj.a ==> 1 or 4

          var params = {
            id: id,
            language: record.langue,
            start_time: record.start_time,
            output_octets: record.output_octets,
            input_octets: record.input_octets,
            site: record.site,
            duration: record.duration,
            device: record.device,
            os: record.os,
            browser: record.browser,
          };

          client.execute(query, params, { prepare: true })
            .then(result => {
              console.log(result.rows);
              id++;
            })
            .catch(err => {
              console.log(err);
              id++;
            })
      })
      .on('done', (error) =>{
        if(error)
          console.log(error)
        else
          console.log('end')
      })*/
