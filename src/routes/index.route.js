const router = require('express').Router();
const { userIdentity } = require('../controller/user.controller')

router.post('/identify', userIdentity)

module.exports = router