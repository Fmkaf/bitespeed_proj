const User = require('../model/User')

const userIdentity = async (email, phoneNumber) => {
    let contactDetails = await User.find({ $or: [{ email }, { phoneNumber }] }).sort({ createdAt: 1 }).lean()
    let response;
    if (contactDetails.length > 0) {
        const emailExist = contactDetails.find(((item) => (item.email === email)))
        const phoneNumberExist = contactDetails.find(((item) => (item.phoneNumber === phoneNumber)))

        if (!emailExist || !phoneNumberExist) {
            //New email or phoneNumber for existing user
            await createContact(email, phoneNumber, "secondary", contactDetails)
            contactDetails = await User.find({ $or: [{ email }, { phoneNumber }] }).sort({ createdAt: 1 }).lean()
        } else if (contactDetails.some((item, index) => { if (index !== 0) { return item.linkedId !== (contactDetails[0].linkedId || contactDetails[0].id) } return false })) {//contactDetails.some((item, index) => { if (index !== 0) { return item.linkPrecedence === "primary" } return false })
            //Update primary to secondary
            const updateDetails = contactDetails.find((item, index) => { if (index !== 0) { return item.linkedId !== (contactDetails[0].linkedId || contactDetails[0].id) } return false })
            await User.updateMany(
                { id: { $ne: contactDetails[0]?.id }, $or: [{ id: updateDetails.linkedId || updateDetails.id }, { linkedId: updateDetails.linkedId || updateDetails.id }] },
                { $set: { linkPrecedence: "secondary", linkedId: contactDetails[0].linkedId || contactDetails[0]?.id, updatedAt: new Date, } }
            )
            contactDetails = await User.find({ $or: [{ email }, { phoneNumber }] }).sort({ createdAt: 1 }).lean()
        }

    } else {
        await createContact(email, phoneNumber, "primary")
        contactDetails = await User.find({ $or: [{ email }, { phoneNumber }] }).sort({ createdAt: 1 }).lean()
    }
    response = constructResponse(contactDetails)
    return response
}

async function createContact(email, phoneNumber, linkPrecedence, contactDetails) {
    const latestRecord = await User.findOne().sort({ createdAt: -1 })
    const contact = {
        id: latestRecord?.id ? latestRecord?.id + 1 : 1,
        email,
        phoneNumber,
        linkedId: linkPrecedence === "secondary" ? (contactDetails?.[0]?.linkedId || contactDetails?.[0]?.id) : null,
        linkPrecedence,
        createdAt: new Date,
        updatedAt: null,
        deletedAt: null
    }
    await User.create(contact)
}

async function constructResponse(contactDetails) {
    let allContacts = await User.find({ $or: [{ linkedId: (contactDetails[0].linkedId || contactDetails[0].id) }, { id: contactDetails[0].linkedId || contactDetails[0].id }] }).sort({ createdAt: 1 }).lean()
    const response = {
        contact: {
            "primaryContatctId": contactDetails[0].linkedId || contactDetails[0].id,
            emails: [...new Set(allContacts.map((item) => (item.email)))],
            "phoneNumbers": [...new Set(allContacts.map((item) => (item.phoneNumber)))],
            "secondaryContactIds": contactDetails.map((item, index) => { if (item.linkPrecedence === "secondary") { return item.id } }).filter(x => x)
        }
    }

    return response
}

module.exports = { userIdentity }