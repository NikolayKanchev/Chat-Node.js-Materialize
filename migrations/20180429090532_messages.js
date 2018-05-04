
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('messages', function(table){
        table.increments('id').primary();
        table.string('user_id');
        table.string('username');
        table.string('text');
        table.string('created_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTableIfExists('messages');
};
