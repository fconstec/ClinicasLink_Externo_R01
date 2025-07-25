exports.up = function(knex) {
  return knex.schema.table('patients', function(table) {
    table.string('city');
    table.string('state');
    table.string('zipCode');
    
    // Adicione outros campos extras que seu backend espera aqui!
  });
};

exports.down = function(knex) {
  return knex.schema.table('patients', function(table) {
    table.dropColumn('city');
    table.dropColumn('state');
    table.dropColumn('zipCode');
    
    // Remova outros campos extras aqui!
  });
};