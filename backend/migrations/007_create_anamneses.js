exports.up = function(knex) {
  return knex.schema.createTable('anamneses', function(table) {
    table.increments('id').primary();
    table.integer('patient_id').unsigned().notNullable()
      .references('id').inTable('patients').onDelete('CASCADE');
    table.integer('professional_id').unsigned();
    // Se for Postgres, prefira table.jsonb('anamnese').notNullable();
    table.text('anamnese').notNullable(); // Armazene JSON.stringify(obj) aqui
    table.text('tcle').notNullable();
    table.boolean('tcle_concordado').defaultTo(false);
    table.string('tcle_nome', 150);
    table.timestamp('tcle_data_hora');
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('anamneses');
};