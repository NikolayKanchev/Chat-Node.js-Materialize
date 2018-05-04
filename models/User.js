const Model = require('objection').Model;

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            require: ['username', 'password'],

            properties: {
                id: {type: "string"},
                firstName: {type: "string"},
                lastName: {type: "string"},
                username: {type: "string"},
                email: {type: "string", minLength: 5},
                password: {type: "string", minLength: 1},
                is_active: {type: "boolean"}
            }
        }        
    }
}

module.exports = User;