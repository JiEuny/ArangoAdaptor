

var express = require('express');
var router = express.Router();

var arangojs = require("arangojs");
var db = new arangojs.Database();
const aql = arangojs.aql;

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

  console.log(cursor._result[0]);
});

// // Old-school JS with explicit bindVars:
// db.query(`FOR ed IN patientEdge\n        FILTER ed._from == \"patientJSON/615355\"\n        LET edge = ed._id\n\n        FOR rel IN patientEdge\n            FILTER rel._from == edge\n\n       RETURN rel`, {
//   active: true
// })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

  //console.log(cursor[Symbol.toStringTag]._result);

});


module.exports = router;
