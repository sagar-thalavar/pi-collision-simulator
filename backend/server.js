const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/simulate', (req, res) => {
  const { massA, massB } = req.body;
  
  if (massA === undefined || massB === undefined) {
    return res.status(400).json({ error: 'massA and massB are required' });
  }

  const pythonScript = path.join(__dirname, '../physics/collision_engine.py');
  
  // Spawn Python process
  const pythonProcess = spawn('python', [pythonScript, massA, massB]);

  let resultData = '';
  let errorData = '';

  pythonProcess.stdout.on('data', (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}: ${errorData}`);
      return res.status(500).json({ error: 'Simulation failed' });
    }
    
    // Parse the output integer
    const collisions = parseInt(resultData.trim(), 10);
    
    if (isNaN(collisions)) {
      return res.status(500).json({ error: 'Invalid output from physics engine' });
    }
    
    res.json({ collisions });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
