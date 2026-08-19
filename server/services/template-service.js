import { pool } from '../db.js';

function toTemplateDto(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    previewUrl: row.preview_url,
    tier: row.tier,
  };
}

export async function listActiveTemplates() {
  const { rows } = await pool.query(
    `SELECT id, name, slug, description, category, preview_url, tier
     FROM templates
     WHERE is_active = TRUE
     ORDER BY created_at ASC, name ASC`,
  );
  return rows.map(toTemplateDto);
}

export async function getTemplateById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, slug, description, category, preview_url, tier FROM templates WHERE id = $1',
    [id],
  );
  return rows[0] ? toTemplateDto(rows[0]) : null;
}
