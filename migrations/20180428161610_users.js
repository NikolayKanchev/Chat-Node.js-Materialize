
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('users', function(table){
        table.increments('id').primary();
        table.string('firstName');
        table.string('lastName');
        table.string('username');
        table.string('email');
        table.string('password');
        table.boolean('is_active').defaultTo('true');
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
    .dropTableIfExists('users');
};
