import { Router } from 'express';
import multer from 'multer';
import pool from '../db.js';
import supabase from '../supabase.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    const reports = result.rows.map(row => ({
      id: row.id,
      line: row.line,
      station: row.station,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      locationDescription: row.location_description,
      issueDescription: row.issue_description,
      imageUrls: row.image_urls,
      createdAt: row.created_at,
    }));
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    const { line, station, lat, lng, locationDescription, issueDescription } = req.body;
    const files = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;
      const { error } = await supabase.storage
        .from('report-images')
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath);
      imageUrls.push(publicUrl);
    }

    const query = `
      INSERT INTO reports (line, station, lat, lng, location_description, issue_description, image_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [line, station, lat, lng, locationDescription, issueDescription, imageUrls];
    const result = await pool.query(query, values);
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      line: row.line,
      station: row.station,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      locationDescription: row.location_description,
      issueDescription: row.issue_description,
      imageUrls: row.image_urls,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

export default router;
