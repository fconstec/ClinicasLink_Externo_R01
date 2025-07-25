exports.up = async function(knex) {
  // patient_procedures
  await knex.schema.renameTable('patient_procedures', 'patient_procedures_old');
  await knex.schema.createTable('patient_procedures', function(table) {
    table.increments('id').primary();
    table.integer('patient_id').unsigned();
    table.string('description');
    table.string('professional');
    table.string('value');
    table.date('date');
    table.timestamps(true, true);
  });
  await knex.raw(`
    INSERT INTO patient_procedures (id, patient_id, description, professional, value, date, created_at, updated_at)
    SELECT id, patient_id, description, professional, value, date, created_at, updated_at FROM patient_procedures_old
  `);
  await knex.schema.dropTable('patient_procedures_old');

  // procedure_images
  await knex.schema.renameTable('procedure_images', 'procedure_images_old');
  await knex.schema.createTable('procedure_images', function(table) {
    table.increments('id').primary();
    table.integer('procedure_id');
    table.string('url');
    table.string('fileName');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
  await knex.raw(`
    INSERT INTO procedure_images (id, procedure_id, url, fileName, created_at)
    SELECT id, procedure_id, url, fileName, created_at FROM procedure_images_old
  `);
  await knex.schema.dropTable('procedure_images_old');
};

exports.down = async function(knex) {
  // Inverte o processo, recriando as constraints NOT NULL (igual sua migration original)
  await knex.schema.renameTable('patient_procedures', 'patient_procedures_new');
  await knex.schema.createTable('patient_procedures', function(table) {
    table.increments('id').primary();
    table.integer('patient_id').unsigned().notNullable();
    table.string('description').notNullable();
    table.string('professional').notNullable();
    table.string('value');
    table.date('date').notNullable();
    table.timestamps(true, true);
  });
  await knex.raw(`
    INSERT INTO patient_procedures (id, patient_id, description, professional, value, date, created_at, updated_at)
    SELECT id, patient_id, description, professional, value, date, created_at, updated_at FROM patient_procedures_new
  `);
  await knex.schema.dropTable('patient_procedures_new');

  await knex.schema.renameTable('procedure_images', 'procedure_images_new');
  await knex.schema.createTable('procedure_images', function(table) {
    table.increments('id').primary();
    table.integer('procedure_id').notNullable();
    table.string('url').notNullable();
    table.string('fileName');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
  await knex.raw(`
    INSERT INTO procedure_images (id, procedure_id, url, fileName, created_at)
    SELECT id, procedure_id, url, fileName, created_at FROM procedure_images_new
  `);
  await knex.schema.dropTable('procedure_images_new');
};