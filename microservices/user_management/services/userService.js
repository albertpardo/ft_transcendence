exports.verifyUser = (username, password) => {
    // To get data from database!!!
    const dummyUser = {
        username: 'admin',
        password: 'password',
    };
    return username === dummyUser.username && password === dummyUser.password;
};
