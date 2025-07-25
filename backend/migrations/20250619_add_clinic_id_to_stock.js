exports.up = function(knex) {
  // Só adiciona a coluna se ela ainda não existir
  return knex.schema.hasColumn('stock', 'clinic_id').then(function(exists) {
    if (!exists) {
      return knex.schema.alterTable('stock', function(table) {
        table.integer('clinic_id').notNullable().references('id').inTable('clinics');
      });
    }
    // Se já existe, não faz nada
    return null;
  });
};

exports.down = function(knex) {
  // Só remove se existir
  return knex.schema.hasColumn('stock', 'clinic_id').then(function(exists) {
    if (exists) {
      return knex.schema.alterTable('stock', function(table) {
        table.dropColumn('clinic_id');
      });
    }
    return null;
  });
};