/**
 * @param knex The Knex instance.
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('patients', function(table) {
    // Adiciona as colunas como DATETIME. Elas serão nuláveis por padrão.
    // O preenchimento será feito pela aplicação.
    table.datetime('created_at');
    table.datetime('updated_at');
  });
};

/**
 * @param knex The Knex instance.
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('patients', function(table) {
    table.dropColumn('updated_at');
    table.dropColumn('created_at');
  });
};