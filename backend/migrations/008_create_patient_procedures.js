exports.up = function(knex) {
  return knex.schema.createTable('patient_procedures', function(table) {
    table.increments('id').primary();
    table.integer('patient_id').unsigned().notNullable()
      .references('id').inTable('patients').onDelete('CASCADE');
    table.string('description').notNullable();
    table.string('professional').notNullable();
    table.string('value');
    table.date('date').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('patient_procedures');
};