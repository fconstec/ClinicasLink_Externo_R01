exports.up = async function(knex) {
  // Adiciona clinic_id à tabela professionals (nullable por compatibilidade SQLite)
  await knex.schema.alterTable('professionals', function(table) {
    table.integer('clinic_id').unsigned().references('id').inTable('clinics');
  });

  // Adiciona clinic_id à tabela clinic_settings (nullable por compatibilidade SQLite)
  await knex.schema.alterTable('clinic_settings', function(table) {
    table.integer('clinic_id').unsigned().references('id').inTable('clinics');
    // Não adicione notNullable ou unique aqui, para evitar erros com dados antigos!
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('professionals', function(table) {
    table.dropColumn('clinic_id');
  });

  await knex.schema.alterTable('clinic_settings', function(table) {
    table.dropColumn('clinic_id');
  });
};