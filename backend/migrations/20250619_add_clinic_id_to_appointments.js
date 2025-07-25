// Em sua pasta de migrations, crie este arquivo para adicionar clinic_id a appointments

exports.up = function(knex) {
  return knex.schema.table('appointments', function(table) {
    // Adiciona coluna clinic_id, opcional (permitindo NULL inicialmente)
    table
      .integer('clinic_id')
      .unsigned()
      .references('id')
      .inTable('clinics')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.table('appointments', function(table) {
    table.dropColumn('clinic_id');
  });
};
