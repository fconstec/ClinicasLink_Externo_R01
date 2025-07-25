exports.up = function(knex) {
  return knex.schema.createTable('procedure_images', function(table) {
    table.increments('id').primary();
    table.integer('procedure_id').notNullable().references('id').inTable('patient_procedures').onDelete('CASCADE');
    table.string('url').notNullable();
    table.string('fileName');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('procedure_images');
};