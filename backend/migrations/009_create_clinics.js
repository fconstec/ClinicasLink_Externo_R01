exports.up = function(knex) {
  return knex.schema.createTable('clinics', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.json('specialties').notNullable();
    table.json('custom_specialties');
    table.string('image').nullable(); // Adiciona o campo image na migration original (opcional, mas recomendado)
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('clinics');
};