global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
module.exports = function(RED) {
  "use strict";
  const Rx = require('rxjs'),
        request = require('request'),
        cassandra = require('cassandra-driver'),
        http = require("http"),
        fs = require("fs");

    function SaveOpenDataWifi(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
        this.port = config.port;
        this.keyspace = config.keyspace;
        this.rows = config.rows;
        var node = this;

        var authProvider = null;
        if (node.credentials.user) {
            authProvider = new cassandra.auth.PlainTextAuthProvider(
                node.credentials.user,
                node.credentials.password
            );
        }

        var client = new cassandra.Client({
            contactPoints: [node.host],
            keyspace: node.keyspace,
            authProvider: authProvider
        });

        node.on('input', function(msg) {

          const API_URL = "https://opendata.paris.fr/api/records/1.0/search/?dataset=utilisations_mensuelles_des_hotspots_paris_wi-fi&sort=start_time&facet=start_time&facet=os&facet=browser&facet=device&facet=langue&facet=site&rows="+node.rows;
          const query = 'INSERT INTO opendata_wifi (id, language, start_time, output_octets, input_octets, site, duration, device, os, browser) VALUES (:id, :language, :start_time, :output_octets, :input_octets, :site, :duration, :device, :os, :browser)';

          Rx.Observable
            .ajax(API_URL)
            .map(e => e.response.records)
            .subscribe(records => {

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
            });

        });
    }
    RED.nodes.registerType("open-data-wifi", SaveOpenDataWifi);
}
