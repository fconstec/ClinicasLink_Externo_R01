exports.up = function(knex) {
  return knex.schema.createTable('appointments', function(table) {
    table.increments('id').primary();
    table.integer('patientId').unsigned().nullable()
      .references('id').inTable('patients').onDelete('SET NULL');
    table.string('patientName').notNullable();
    table.string('patientPhone');
    table.string('service').notNullable();
    table.integer('professionalId').unsigned().notNullable()
      .references('id').inTable('professionals').onDelete('CASCADE');
    table.date('date').notNullable();
    table.string('time').notNullable();
    table.string('status').defaultTo('pending');
    table.timestamps(true, true); // created_at, updated_at automáticos
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('appointments');
};