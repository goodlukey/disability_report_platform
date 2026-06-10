-- SQL to create the database and table
-- Run this in your PostgreSQL tool (like pgAdmin or psql)

-- 1. Create the database (run this first)
-- CREATE DATABASE disability_reports;

-- 2. Connect to the database and run this:
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line TEXT NOT NULL,
    station TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    location_description TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    image_urls TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
