exports.up = function(knex) {
  return knex.schema.table('clinics', function(table) {
    table.boolean('featured').defaultTo(false);
    table.boolean('isNew').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('clinics', function(table) {
    table.dropColumn('featured');
    table.dropColumn('isNew');
  });
};