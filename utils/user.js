const users = [];

// addUser, removeUser, getUsers, getUsersInRoom

/**
 * @description - This function is used to generate a user and store it in users array.
 * @param {objet} - Takes an object as argument with following properties
 *                  id, username, room 
 * 
 * @returns {object} - returns userobject with properties id, username, room
 */
const addUser = ({ id, username, room }) => {
    
    // Trim and transforma to lowercase
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    
    // Check if valid data is provided
    if(!username || !room) return {
        success: false,
        error: "Username and room are required"
    };

    // Check if there is and existingUser
    const existingUser = users.find((user) => user.username === username && user.room === room);
    if(existingUser) return {
        success: false,
        error: "Username already in use"
    };

    const user = { id, username, room };

    users.push(user);

    return {
        success: true,
        user
    };
};

/**
 * @description - This function is used to remove and user from the users array.
 * @param {number} id - The user's unique id. 
 * @returns {object} - contains success and user properties
 */
const removeUser = id => {
    const userIndex = users.findIndex(user => user.id === id);

    if(userIndex === -1) return {
        success: false,
        error: "Cannot find user with that index"
    } 

    const user = users.splice(userIndex, 1)[0]
    
    return {
        success: true,
        user
    }
}

/**
 * @description - This function is used to find the user based on it's id.
 * 
 * @param {number} id - The unique user id 
 * @returns {object} - If user is found
 * @returns {undefined} - If user doesn't exist
 */
const getUser = id => {
    const userIndex = users.findIndex(user => user.id === id);
    return userIndex === -1 ? undefined : users[userIndex];
}

/**
 * @description - This function is used to get arrya of all the users in a room.
 * @param {string} room - The room name 
 * @returns {Array} - Array with all the users in that room
 */
const getUsersInRoom = room => {
    const usersInRoom  = users.filter(user => user.room === room);
    return usersInRoom.length > 0 ? usersInRoom : [];
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};



