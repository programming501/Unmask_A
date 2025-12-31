-- Migration: Add curriculum_link column to requests table
-- Run this in your Supabase SQL Editor if you already have the requests table

ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS curriculum_link TEXT;

