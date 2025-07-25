exports.up = function(knex) {
  return knex.schema.createTable('stock', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('category').notNullable();
    table.integer('quantity').notNullable().defaultTo(0);
    table.integer('minQuantity').notNullable().defaultTo(0);
    table.string('unit').notNullable();
    table.date('validity');
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.integer('clinic_id').notNullable().references('id').inTable('clinics');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('stock');
};