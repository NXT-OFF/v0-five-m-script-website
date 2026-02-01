-- FiveM Hub Database Schema
-- Run this script in your MySQL/phpMyAdmin to create the required tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  thumbnail_url VARCHAR(500),
  download_url VARCHAR(500) NOT NULL,
  file_size VARCHAR(50),
  version VARCHAR(20),
  author_id INT NOT NULL,
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  is_new BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (resource_id, user_id),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Downloads tracking table
CREATE TABLE IF NOT EXISTS download_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resource_id INT NOT NULL,
  user_id INT,
  ip_address VARCHAR(45),
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resource_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, resource_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_author ON resources(author_id);
CREATE INDEX idx_comments_resource ON comments(resource_id);
CREATE INDEX idx_reviews_resource ON reviews(resource_id);

-- Insert demo admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@fivemhub.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4EQfbqJFmqBqKmHi', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Insert demo resources
INSERT INTO resources (title, description, category, thumbnail_url, download_url, file_size, version, author_id, views, downloads, status) VALUES 
('Cayo Perico MLO', 'Custom Cayo Perico interior with high quality textures and optimized performance.', 'mlo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop', '#', '45 MB', '1.0', 1, 213, 70, 'approved'),
('Weapon Pack V1', 'Contains 20+ pistols, 10 rifles, 5 SMGs and custom animations.', 'weapons', 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=400&h=250&fit=crop', '#', '120 MB', '2.1', 1, 162, 32, 'approved'),
('Sandy Shores Mapping', 'Complete Sandy Shores overhaul with new buildings and interiors.', 'maps', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop', '#', '89 MB', '1.5', 1, 286, 94, 'approved'),
('Police EUP Pack', 'High quality police uniforms with multiple departments.', 'eup', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=250&fit=crop', '#', '67 MB', '3.0', 1, 445, 156, 'approved'),
('Advanced HUD System', 'Modern HUD with customizable elements and smooth animations.', 'hud', 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=250&fit=crop', '#', '12 MB', '1.2', 1, 891, 342, 'approved'),
('Database Dump Tool', 'Easy to use database backup and restore tool for FiveM servers.', 'dumps', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop', '#', '5 MB', '1.0', 1, 567, 234, 'approved')
ON DUPLICATE KEY UPDATE title = title;
