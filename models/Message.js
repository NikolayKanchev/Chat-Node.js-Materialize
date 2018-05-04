const Model = require('objection').Model;

class Message extends Model {
    static get tableName() {
        return 'messages';
    }

    static get jsonSchema() {
        return {
            type: 'object',

            properties: {
                id: {type: "string"},
                userId: {type: "string"},
                username: {type: "string"},
                text: {type: "string"},
                created_at: {type: "string"},
            }
        }        
    }
}

module.exports = Message;