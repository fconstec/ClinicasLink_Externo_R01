exports.up = function(knex) {
  return knex.schema.createTable('services', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('duration').notNullable();
    table.string('value').notNullable();
    table.text('description');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('services');
};