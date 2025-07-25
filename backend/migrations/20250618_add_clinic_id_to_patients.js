// 20250618_add_clinic_id_to_patients.js
exports.up = function(knex) {
  return knex.schema.table('patients', function(table) {
    table.integer('clinic_id').unsigned().references('id').inTable('clinics');
  });
};

exports.down = function(knex) {
  return knex.schema.table('patients', function(table) {
    table.dropColumn('clinic_id');
  });
};
