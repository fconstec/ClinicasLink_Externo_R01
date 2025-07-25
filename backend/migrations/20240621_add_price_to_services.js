exports.up = function(knex) {
  return knex.schema.table('services', function(table) {
    table.string('price').nullable(); // ou table.decimal('price').nullable(); se for valor numérico/decimal
  });
};

exports.down = function(knex) {
  return knex.schema.table('services', function(table) {
    table.dropColumn('price');
  });
};