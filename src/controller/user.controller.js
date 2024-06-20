const userIdentityService = require('../service/user.service')

const userIdentity = async (req, res) => {
    try {
        const { input } = req.body;
        const response = await userIdentityService.userIdentity(input)
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
}

module.exports = { userIdentity }