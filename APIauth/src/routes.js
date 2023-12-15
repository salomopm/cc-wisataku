const {
    addUsersHandler, LoginUserHandler, getAllUsersHandler
} = require('./handler')


const routes = [

    {
        method: 'POST',
        path: '/register',
        handler: addUsersHandler,
        options: {
            auth: false
        }
    },

    {
        method: 'POST',
        path: '/login',
        handler: LoginUserHandler,
        options: {
            auth: false
        }
    },

    {
        method: 'GET',
        path: '/users',
        handler: getAllUsersHandler,
        config: {
            auth: 'jwt',
        }
    },
    
]

module.exports = routes;