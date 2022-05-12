const { 
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('../utils/user');


const testUserOne = {
    id: 1,
    username: 'HV',
    room: 'hrv'
}

const testUserTwo = {
    id: 2,
    username: 'HM',
    room: 'hm'
}


const testUserThree = {
    id: 3,
    username: 'GP',
    room: 'hrv'
}

const testUserFour = {
    id: 4,
    username: 'kush',
    room: 'ks'
}

const testUserFive = {
    id: 5,
    username: 'MS',
    room: 'hm'
}

beforeEach(()=>{
    addUser(testUserOne);
    addUser(testUserTwo);
    addUser(testUserThree);
    addUser(testUserFour);
    addUser(testUserFive);
});

test("Should create a user", ()=>{
    const data = addUser({
        id: 222,
        username: 'Test User',
        room: 'Test Room'
    });

    expect(data.success).toBe(true);
})

test("Should not create a user if username or room were not provided", ()=>{
    const data = addUser({
        id: 333,
        username: '',
        room: ''
    });
    expect(data.success).toBeFalsy()
});

test("Should not create the user if there is already a user with same username", ()=>{
    const data = addUser({
        id: 212,
        username: 'HM',
        room: 'hm'
    });

    expect(data.success).toBeFalsy();
})

test("Should remove a user", ()=>{
    const data = removeUser(3);
    expect(data.success).toBe(true);
    
    expect(data.user.username).toBe('gp')
})

test("Should find the user based on it's id", ()=>{
    const user = getUser(4);
    expect(user.username).toBe('kush')
});

test("Should not find the user with invalid id", ()=>{
    const user = getUser(40);
    expect(user).toBeUndefined();
});

test("Shoudld return the array of users in a given room", ()=>{
    const users = getUsersInRoom('hrv');
    expect(users.length).toBe(2)
});

test("Should return an empty array if there are no users in the room", ()=>{
    const users = getUsersInRoom('some non existing room');
    expect(users.length).toBe(0);
});