const router = require('express').Router();
const { userIdentity, contactForm } = require('../controller/user.controller')

router.post('/identify', userIdentity)
router.get('/', contactForm)

module.exports = router