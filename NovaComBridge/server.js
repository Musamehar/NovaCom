const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CONFIGURATION
const BACKEND_DIR = path.join(__dirname, '../backend'); 
const EXECUTABLE = path.join(BACKEND_DIR, 'backend.exe'); 
const DATA_DIR = path.join(BACKEND_DIR, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.post('/api', (req, res) => {
    let { action, params } = req.body;
    let tempFilePath = null;

    // We now check for BOTH 'send_dm' AND 'send_message'
    // In both cases, the Image URL is at index 4 of the params array.
    if ((action === 'send_dm' || action === 'send_message') && params && params.length >= 5) {
        const mediaUrl = params[4];
        
        // If data is large (Base64 image), save to file
        if (mediaUrl && mediaUrl.length > 1000) {
            const fileName = `temp_img_${Date.now()}.txt`;
            // Use Absolute Path
            tempFilePath = path.join(DATA_DIR, fileName);
            
            try {
                fs.writeFileSync(tempFilePath, mediaUrl);
                // Replace huge string with file pointer
                params[4] = `FILE:${tempFilePath}`;
                console.log(`[Bridge] Large image buffered for ${action}: ${fileName}`);
            } catch (err) {
                console.error("Failed to write temp file:", err);
                return res.status(500).json({ error: "Failed to process image upload." });
            }
        }
    }

    const args = [action, ...params.map(String)];

    execFile(EXECUTABLE, args, { cwd: BACKEND_DIR, maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
        
        // Cleanup
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch(e) {}
        }

        if (error) {
            console.error("Execution Error:", stderr);
            return res.status(500).json({ error: "Backend failed", details: stderr });
        }

        try {
            if (!stdout.trim()) {
                return res.json({ status: "success" });
            }
            const jsonResponse = JSON.parse(stdout.trim());
            res.json(jsonResponse);
        } catch (e) {
            console.error("JSON Parse Error. Raw Output:", stdout);
            res.send(stdout); 
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`NovaCom Bridge running on http://localhost:${PORT}`);
});