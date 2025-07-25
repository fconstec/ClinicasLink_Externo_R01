exports.up = function(knex) {
  return knex.schema.createTable('clinic_settings', function(table) {
    table.increments('id').primary();
    table.integer('clinic_id').notNullable().unique();
    table.string('name', 255).notNullable();
    table.string('email', 255).nullable();
    table.string('phone', 50).nullable();
    table.string('street', 255).nullable();
    table.string('number', 50).nullable();
    table.string('neighborhood', 100).nullable();
    table.string('city', 100).nullable();
    table.string('state', 50).nullable();
    table.string('cep', 30).nullable();
    table.decimal('latitude', 10, 7).nullable();
    table.decimal('longitude', 10, 7).nullable();
    table.text('description').nullable();
    table.string('website', 255).nullable();
    table.text('opening_hours').nullable();
    table.string('cover_image_url', 255).nullable();
    table.text('gallery_image_urls').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('clinic_settings');
};