const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

//gets the current enviornment variables to use for database connection

const host = process.env.REACT_APP_API_HOST; 
const port = process.env.REACT_APP_API_PORT;
const prefix = `http://${host}:${port}`;
const fullUri = `${prefix}/api/timesheets`;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});
//handles post requests from frontend
app.post('/api/timesheets', (req, res) => {  
  const { description, rate, lineItems, username } = req.body;
  const totalTime = lineItems.reduce((sum, item) => sum + item.minutes, 0);
  const totalCost = totalTime * rate;

  db.query(
    'INSERT INTO timesheets (description, rate, total_time, total_cost, username) VALUES (?, ?, ?, ?, ?)',
    [description, rate, totalTime, totalCost, username],
    (err, result) => {
      if (err) return res.status(500).json(err);
      const timesheetId = result.insertId;

      const values = lineItems.map(item => [timesheetId, item.date, item.minutes]);
      db.query(
        'INSERT INTO line_items (timesheet_id, date, minutes) VALUES ?',
        [values],
        (err) => {
          if (err) return db.rollback(() => res.status(500).json(err));

          db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            res.json({ success: true, timesheetId });
          });
        }
      );
    }
  );
});
//handles get requests from frontend server and returns only items that match current user name 
app.get('/api/timesheets', (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  db.query(
    'SELECT * FROM timesheets WHERE username = ? ORDER BY created_at DESC',
    [username],
    (err, timesheets) => {
      if (err) return res.status(500).json(err); 

      const fetchLineItems = timesheets.map(ts => { 
        return new Promise((resolve, reject) => {
          db.query(
            'SELECT date, minutes FROM line_items WHERE timesheet_id = ?',
            [ts.id],
            (err, items) => {
              if (err) reject(err);
              else {
                // console.log("Hello, Node.js!" + JSON.stringify(ts));
                // console.log("Hello, Node.js!" + JSON.stringify(items));
                resolve({
                  ...ts,
                  lineItems: items
                });
            }
          }
          );
        });
      });

      Promise.all(fetchLineItems)
        .then(results => res.json(results))
        .catch(err => res.status(500).json(err));
    }
  );
});

const PORT = port || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
