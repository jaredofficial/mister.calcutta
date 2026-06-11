const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 8080;
const ADMIN_PASSWORD = 'ifte'; // Simple password for testing

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer storage configuration for gallery uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'gallery images'));
    },
    filename: function (req, file, cb) {
        // Keep original filename or sanitize it
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_~()]/g, '_');
        cb(null, safeName);
    }
});
const upload = multer({ storage: storage });

// Security helper: Check password from Authorization header
function isAuthorized(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return false;
    const password = authHeader.replace('Bearer ', '').trim();
    return password === ADMIN_PASSWORD;
}

// Security middleware for write endpoints
function authMiddleware(req, res, next) {
    if (!isAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }
    next();
}

// Serve static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// API Route: Get content.json
app.get('/api/content', (req, res) => {
    const contentPath = path.join(__dirname, 'content.json');
    fs.readFile(contentPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read content file' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// API Route: Save content.json
app.post('/api/content', authMiddleware, (req, res) => {
    const contentPath = path.join(__dirname, 'content.json');
    const newContent = req.body;
    
    fs.writeFile(contentPath, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write content file' });
        }
        res.json({ success: true, message: 'Content updated successfully' });
    });
});

// API Route: Get list of gallery images
app.get('/api/gallery', (req, res) => {
    const galleryDir = path.join(__dirname, 'gallery images');
    fs.readdir(galleryDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to list gallery directory' });
        }
        // Filter out non-image files
        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.webp', '.jpg', '.jpeg', '.png'].includes(ext);
        });
        res.json(images);
    });
});

// API Route: Upload gallery image
app.post('/api/gallery/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }
    res.json({ success: true, filename: req.file.filename });
});

// API Route: Delete gallery image
app.post('/api/gallery/delete', authMiddleware, (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
    }
    
    // Prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(__dirname, 'gallery images', safeFilename);
    
    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'File not found' });
            }
            return res.status(500).json({ error: 'Failed to delete file' });
        }
        res.json({ success: true, message: `Deleted ${safeFilename} successfully` });
    });
});

// Serve Admin Panel at /admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Catch-all route to serve the index.html homepage
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`CMS Development Server running at http://localhost:${PORT}`);
    console.log(`Admin Dashboard available at http://localhost:${PORT}/admin`);
});
