/**
 * @description - This function generates the message object
 * @param {string} text - The message
 * @param {string} username - The user
 * @returns {object} - contains the message and the timestamp
 */
module.exports.generateMessage = (text, username) => {
    return {
        text,
        username,
        createdAt: new Date()
    }
}

/**
 * @description - This function returns location object with location
 *                and createdAt(date) properties.

 * @param {object} locationObj  - Location object with lat, and long properties

 * @returns {object} - contains url and createdAt properties
 */
module.exports.generateLocationMessage = (locationObj) => {

    const url = `https://www.google.com/maps/@${locationObj.lat},${locationObj.long}`

    return {
        url,
        username: locationObj.username,
        createdAt: new Date()
    }
}