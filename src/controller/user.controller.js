const userIdentityService = require('../service/user.service')

const userIdentity = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        const response = await userIdentityService.userIdentity(email, phoneNumber)
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
}

const contactForm = async (req, res) => {
    try {
        const response = await userIdentityService.contactForm()
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
}

module.exports = { userIdentity, contactForm }