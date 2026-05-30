import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import pool from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase Client (for Storage only)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for memory storage (we'll upload directly to Supabase)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// API Endpoints

// 1. Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    const reports = result.rows.map(row => ({
      id: row.id,
      line: row.line,
      station: row.station,
      lat: row.lat,
      lng: row.lng,
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

// 2. Submit a report (with images to Supabase Storage)
app.post('/api/reports', upload.array('images', 3), async (req, res) => {
  try {
    const { line, station, lat, lng, locationDescription, issueDescription } = req.body;
    const files = req.files as Express.Multer.File[];
    
    const imageUrls: string[] = [];

    // Upload each file to Supabase Storage
    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { data, error } = await supabase.storage
        .from('report-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath);
      
      imageUrls.push(publicUrl);
    }

    // Save to Database via SQL
    const query = `
      INSERT INTO reports (line, station, lat, lng, location_description, issue_description, image_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [line, station, lat, lng, locationDescription, issueDescription, imageUrls];

    const result = await pool.query(query, values);
    
    // Convert response to camelCase
    const newReport = result.rows[0];
    res.status(201).json({
      id: newReport.id,
      line: newReport.line,
      station: newReport.station,
      lat: newReport.lat,
      lng: newReport.lng,
      locationDescription: newReport.location_description,
      issueDescription: newReport.issue_description,
      imageUrls: newReport.image_urls,
      createdAt: newReport.created_at,
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
