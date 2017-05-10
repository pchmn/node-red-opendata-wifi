const csv = require("csvtojson"),
      cassandra = require('cassandra-driver');

    var client = new cassandra.Client({
            contactPoints: ["127.0.0.1"],
            keyspace: "donnees_urbaines"
        });

    var query = 'INSERT INTO opendata_wifi (id, language, start_time, output_octets, input_octets, site, duration, device, os, browser) VALUES (:id, :language, :start_time, :output_octets, :input_octets, :site, :duration, :device, :os, :browser)';

    var id = 0;

    csv()
      .fromFile("../csv/utilisations_mensuelles_des_hotspots_paris_wi-fi.csv")
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
              console.log(results.rows);
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
      })
