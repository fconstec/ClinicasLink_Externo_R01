exports.up = function(knex) {
  return knex.schema.alterTable('clinic_settings', function(table) {
    // Geocoding do endereço textual
    table.decimal('latitude_address', 10, 7).nullable();
    table.decimal('longitude_address', 10, 7).nullable();
    // Coordenadas ajustadas manualmente no mapa
    table.decimal('latitude_map', 10, 7).nullable();
    table.decimal('longitude_map', 10, 7).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('clinic_settings', function(table) {
    table.dropColumn('latitude_address');
    table.dropColumn('longitude_address');
    table.dropColumn('latitude_map');
    table.dropColumn('longitude_map');
  });
};