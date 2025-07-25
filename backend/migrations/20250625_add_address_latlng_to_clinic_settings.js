exports.up = function(knex) {
  return knex.schema.alterTable('clinic_settings', function(table) {
    table.string('street').nullable();
    table.string('number').nullable();
    table.string('neighborhood').nullable();
    table.string('city').nullable();
    table.string('state').nullable();
    table.string('cep').nullable();
    table.decimal('latitude', 10, 7).nullable();
    table.decimal('longitude', 10, 7).nullable();
    // Remova ou adicione outros campos conforme sua model
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('clinic_settings', function(table) {
    table.dropColumn('street');
    table.dropColumn('number');
    table.dropColumn('neighborhood');
    table.dropColumn('city');
    table.dropColumn('state');
    table.dropColumn('cep');
    table.dropColumn('latitude');
    table.dropColumn('longitude');
  });
};