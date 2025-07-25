exports.up = function(knex) {
  return knex.schema.createTable('patients', function(table) {
    table.increments('id').primary();
    table.string('name');
    table.date('birthDate');
    table.string('phone');
    table.string('email');
    table.string('address');
    table.string('photo');
    table.text('images');      // Pode armazenar um array JSON serializado
    table.text('anamnesis');
    table.text('tcle');
    table.text('procedures');  // Pode armazenar um array JSON serializado
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('patients');
};