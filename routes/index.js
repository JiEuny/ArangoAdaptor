

var express = require('express');
var router = express.Router();

var arangojs = require("arangojs");
var db = new arangojs.Database();
const aql = arangojs.aql;

var http = require('http');
var options = {
  hostname: 'localhost',
  port: '12345'
};

// when get a json-ld data
function handleResponse(res) {
  let body = [];
  res.on('data', function (chunk) {
    body += chunk;
  });
  res.on('end', function () {
    body = JSON.parse(body);
    // console.log(body);

    // for (const key of Object.keys(body)) {
    //   console.log('ta: ', key);
    //   console.log('data: ', body[key]);
    // }

    //------------------------ store a entity at entityColl ----------------------------------
    db.query(aql`
      INSERT ${body} INTO 'entityColl'
      RETURN NEW._key
    `).then(function(cursor) {
      // cursor is a cursor for the query result
      let entityID = cursor._result;
      console.log(entityID);

      for (const key of Object.keys(body)) {
        if(body[key].type == "Property") {
          body[key].id = key;
          // console.log(body[key]);

          // --------------------------------- store properties at propertyColl ------------------------
          db.query(aql`INSERT ${body[key]} INTO 'propertyColl' RETURN NEW._key`)
              .then(function (cursor) {
                let propertyID = cursor._result;
                console.log(propertyID);
              })
        }
      }
    });
  })
}

http.request(options, function (res) {
  handleResponse(res);
})
    .end();


db.useDatabase("_system");
db.useBasicAuth("root", "0000");

const entityColl = db.collection('ngsiCollection');
const data = entityColl.list();

db.query(aql`
FOR ed IN patientEdge
        FILTER ed._from == "patientJSON/615355"
        LET edge = ed._id

        FOR rel IN patientEdge
            FILTER rel._from == edge

        RETURN rel
`).then(function(cursor) {
  // cursor is a cursor for the query result

  // console.log(cursor._result[0]);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

  //console.log(cursor[Symbol.toStringTag]._result);

});


module.exports = router;
