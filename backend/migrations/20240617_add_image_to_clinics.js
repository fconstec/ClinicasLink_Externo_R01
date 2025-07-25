exports.up = function(knex) {
  return knex.schema.table('clinics', function(table) {
    table.string('image').nullable();
  });
};
exports.down = function(knex) {
  return knex.schema.table('clinics', function(table) {
    table.dropColumn('image');
  });
};