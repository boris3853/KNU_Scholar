var oracledb = require('oracledb');
var express = require('express');
var router = express.Router();

router.post('/test', function(req, res, next){

});


router.get('/', function(req, res){
	res.send('Hello World');
});

module.exports = router

