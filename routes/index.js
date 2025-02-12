var express = require('express');
var router = express.Router();
var controller = require('../controller')

router.use('/',controller); //user-defined middleware
router.use('/admin',controller)


module.exports = router;
