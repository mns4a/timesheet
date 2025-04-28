import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState(0);      // official rate
  const [tempRate, setTempRate] = useState('');  // editable value
  const [date, setDate] = useState('');
  const [minutes, setMinutes] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [saved, setSaved] = useState([]);
  const [error, setError] = useState('');
  const [username, setUser] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [config, setConfig] = useState(null);
  const [finalUri, setFinalUri] = useState('');

  // Fetch the config.json on component mount
  useEffect(() => {
    fetch('/config.json')
      .then(response => response.json())
      .then(data => setConfig(data))
      .catch(error => console.error('Error fetching config:', error));
  }, []);

  // Create final URI by combining the prefix and endpoint
  const createFinalUri = (endpoint) => {
    if (config) {
      const { host, port } = config;
      const prefix = `http://${host}:${port}`;
      const fullUri = `${prefix}${endpoint}`;
      setFinalUri(fullUri);
      return fullUri;
    }
    return '';
  };

  
  //const [savedTimesheets, setSavedTimesheets] = useState([]);

  const addLineItem = () => {
    if (date && minutes) {
      setLineItems([...lineItems, { date, minutes: parseInt(minutes) }]);
      setDate('');
      setMinutes('');
    }
  };

  // const submitTimesheet = async () => {
  //   await axios.post('http://localhost:3001/api/timesheets', {
  //     description,
  //     rate,
  //     lineItems
  //   });
  //   setDescription(''); 
  //   setRate('');
  //   setLineItems([]);
  //   fetchTimesheets();
  // };

  const fetchTimesheets = async (username) => {
    if (!username) return;
    try {
      const endpoint = '/api/timesheets';  // Example endpoint
      const uri = createFinalUri(endpoint);

      const res = await axios.get(uri + `?username=${encodeURIComponent(username)}`);
      
      setSaved(res.data);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    }
  };

  const handleSave = async () => {
    if (lineItems.length === 0) {
      alert('Please enter at least one line item.');
      return;
    }
  
    const safeRate = rate !== '' && !isNaN(rate) ? rate : 0;
    const safeDescription = description.trim() !== '' ? description : 'No description provided';
  
    const totalTime = lineItems.reduce((sum, item) => sum + item.minutes, 0);
    const totalCost = totalTime * safeRate;
  
    const timesheetData = {
      description: safeDescription,
      rate: safeRate,
      lineItems,
      totalTime,
      totalCost, 
      username
    };
  
    try {
      const endpoint = '/api/timesheets';  // Example endpoint
      const uri = createFinalUri(endpoint);
      const response = await axios.post('http://localhost:3001/api/timesheets', timesheetData);
      console.log('Timesheet saved:', response.data);
      alert('Timesheet saved successfully!');

      
      await fetchTimesheets(username);
      
  
      // After saving, add the saved timesheet to your page immediately
      // setSaved(prev => [...prev, timesheetData]);
  
      // Optional: Clear the form
      setDescription('');
      setRate(0); // reset rate to default
      setTempRate('');
      setLineItems([]);
    } catch (error) {
      console.error('Error saving timesheet:', error);
      alert('Failed to save timesheet.');
    }
  };
  
  
  //parameterize local host 
  //add user 
  //label the description

  

  const handleContinue = () => {
    if (usernameInput.trim() !== '') {
      const cleanUsername = usernameInput.trim();
      setUser(cleanUsername);
      fetchTimesheets(cleanUsername); // Only now we fetch
    } else {
      alert('Please enter a valid username.');
    }
  };

  



  return ( 
    <div style={{ textAlign: 'center', padding: '20px' }}>
    {!username ? (
        <div>
          <h2>Enter Your Username</h2>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Username"
          />
          <br /><br />
          <button onClick={handleContinue}>Continue</button>
        </div>
      ) : (
        // Once username is entered, show the timesheet app
        <div>
          <h1>Welcome, {username}!</h1>
          {/* Timesheet form, tables, everything else */}
          <div style={{
            maxWidth: '90%',
            width: '800px',
            margin: '0 auto',
            padding: '20px', 
            textAlign: 'center'
          }}>
            <h1>Timesheet App</h1>
      
            <text>Enter Date: </text>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}/>
            <text> Enter Minutes: </text>
            <input
              type="number"
              placeholder="Minutes"
              value={minutes}
              onChange={(e) => {
                const value = e.target.value;
                
                // Allow empty input (so user can erase)
                if (value === '') {
                  setMinutes('');
                  setError('');
                  return
                }
      
                // Only allow whole positive numbers
                const intValue = parseInt(value, 10);
                if (!isNaN(intValue) && Number(value) === intValue && intValue >= 0) {
                  setMinutes(intValue);
                  setError('');
                } else {
                  setError('Minutes must be a whole number.');
                  console.error('Error saving timesheet:', error)
                  setMinutes('');
                }
              }}
            />
            
            
            
            <button onClick={addLineItem}>Add Line</button>
      
            
            <div>
              {/* decide if you want the rate to be chnaged automatically or only when button clicked */} 
              <text>Enter Rate: </text>
              <input type="number" placeholder="Rate" value={tempRate} onChange={e => setTempRate(e.target.value)} />
              <button
                onClick={() => {
                  if (tempRate !== '') {
                    setRate(Number(tempRate));
                    setTempRate(''); // clear the box after updating if you want
                  }
                }}
              >
                Update Rate
              </button>
            </div>
      
            <div>
              <text>Enter Description: </text>
            </div>
      
            <div>
              <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <button onClick={handleSave}>Save Timesheet</button>
            </div>
            
            <div className="mt-8">
              <h2>Current Line Items:</h2>
      
              {lineItems.length > 0 ? (
                <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.date}</td>
                        <td>{item.minutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No line items added yet.</p>
              )}
            </div>
      
      
            <div>
              <span>
                Total Time: {lineItems.reduce((sum, item) => sum + item.minutes, 0)}
              </span>
            </div>

            <div>
              <span>
                Total Cost: {
                  lineItems.reduce((sum, item) => sum + item.minutes, 0) * rate
                }
              </span>
            </div>

      
            <div>
              <strong>Current Rate: ${rate}</strong>
            </div>
      
            
            
          <h2>Saved Timesheets:</h2>
            {saved.map((sheet, idx) => (
              <div key={idx} style={{ border: '1px solid gray', padding: '16px', marginBottom: '20px', borderRadius: '8px' }}>
                <h3>Timesheet #{idx + 1}</h3>
                
                <p><strong>Description:</strong> {sheet.description}</p>
                <p><strong>Rate:</strong> ${sheet.rate}</p>
                <p><strong>Total Time:</strong> {sheet.total_time} minutes</p>
                <p><strong>Total Cost:</strong> ${sheet.total_cost}</p>
      
                <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.lineItems.map((item, lineIdx) => (
                      <tr key={lineIdx}>
                        <td>{item.date}</td>
                        <td>{item.minutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

        </div>
      )}
      </div>
  );
}

export default App;
