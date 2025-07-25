// 20250618_add_clinic_id_to_services.js
exports.up = async function(knex) {
  // 1) adiciona clinic_id como NULLABLE
  await knex.schema.table('services', table => {
    table
      .integer('clinic_id')
      .unsigned()
      .references('id')
      .inTable('clinics');
    // 2) cria índice para performance
    table.index('clinic_id');
  });

  // 3) se você quiser definir um clinic_id padrão para registros existentes,
  //    descomente e ajuste a linha abaixo (por ex: todas as services da clínica 1):
  // await knex('services').update({ clinic_id: 1 });
};

exports.down = async function(knex) {
  await knex.schema.table('services', table => {
    table.dropIndex('clinic_id');
    table.dropColumn('clinic_id');
  });
};
