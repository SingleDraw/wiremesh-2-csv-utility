import express from 'express';
import OpeningManager from './modules/OpeningManager/OpeningManager';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Instantiate once
const openingManager = new OpeningManager();

// Define the /csv route
app.get('/csv', async (req, res) => {
  try {
    await openingManager.main();
    const result = {
        status: 'success',
        message: 'CSV files generated successfully',
    }
    res.status(200).json(result);
    // Or res.type('text/csv').send(result); if it's raw CSV
  } catch (err) {
    console.error('Error in /csv route:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

/** Serve tables as static files for download */
app.use('/downloads', express.static(path.join(__dirname, '../tables'))); 

app.get('/', async (req, res) => {

  await openingManager.main(); // don't use this in production, just for development [queries db on every request]

  const csv_downloads: Record<string, Record<string, Record<string, string | number>>> = {}

  // prepare directory paths
  const mainDir = path.join(__dirname, '../tables');

  // search for subdirectories
  const subDirs = fs.readdirSync(mainDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const dir of subDirs) {
    
    if (!csv_downloads[dir]) {
      csv_downloads[dir] = {};
    }

    const dirPath = path.join(mainDir, dir);

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (file.endsWith('.csv')) {
        const fileName = path.basename(file, '.csv');

        csv_downloads[dir][fileName] = {
          path: path.join('/downloads', dir, file),
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        }
      }
    }
  }
  
  res.render('index', { csv_downloads });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
