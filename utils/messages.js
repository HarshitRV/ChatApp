/**
 * @description - This function generates the message object
 * @param {string} text - The message
 * @returns {object} - contains the message and the timestamp
 */
module.exports.generateMessage = (text) => {
    return {
        text,
        createdAt: new Date()
    }
}