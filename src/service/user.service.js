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

const contactForm = async () => {
    const formDetails = `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .form-container {
          background-color: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .form-container h2 {
          margin-bottom: 20px;
          font-size: 24px;
          color: #333;
        }
        .form-container label {
          display: block;
          margin-bottom: 5px;
          color: #555;
        }
        .form-container input[type="email"],
        .form-container input[type="text"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .form-container input[type="submit"] {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .form-container input[type="submit"]:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Contact Information</h2>
        <form action="/identify" method="post">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required><br>
          <label for="phoneNumber">Phone Number:</label>
          <input type="text" id="phoneNumber" name="phoneNumber" required><br>
          <input type="submit" value="Submit">
        </form>
      </div>
    </body>
    </html>
  `
    return formDetails
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

module.exports = { userIdentity, contactForm }