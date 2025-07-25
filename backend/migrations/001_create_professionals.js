exports.up = function(knex) {
  return knex.schema.createTable('professionals', function(table) {
    table.increments('id').primary();
    table.string('name');
    table.string('specialty');
    table.string('email');
    table.string('phone');
    table.string('photo');
    table.text('resume');
    // Se quiser manter o campo 'available', adicione se for usar.
    // table.boolean('available');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('professionals');
};