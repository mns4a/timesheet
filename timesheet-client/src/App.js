import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState('');
  const [minutes, setMinutes] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [saved, setSaved] = useState([]);

  const addLineItem = () => {
    if (date && minutes) {
      setLineItems([...lineItems, { date, minutes: parseInt(minutes) }]);
      setDate('');
      setMinutes('');
    }
  };

  const submitTimesheet = async () => {
    await axios.post('http://localhost:3001/api/timesheets', {
      description,
      rate,
      lineItems
    });
    setDescription(''); 
    setRate('');
    setLineItems([]);
    fetchTimesheets();
  };

  const fetchTimesheets = async () => {
    const res = await axios.get('http://localhost:3001/api/timesheets');
    setSaved(res.data);
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);


  return (
    <div className="p-4 max-w-xl mx-auto\"> 
      <h1>Timesheet App</h1>
      
      <input type="date" value={date} onChange={e => setDate(e.target.value)}/>
      <input type="number\" placeholder="Minutes" value={minutes} onChange={e => setMinutes(e.target.value)} />
      <button onClick={addLineItem}>Add Line</button>

      <div>
        <input type="number" placeholder="Rate" value={rate} onChange={e => setRate(e.target.value)} />
      </div>
      <div>
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <button onClick={submitTimesheet}>Save Timesheet</button>
      </div>
      
      <ul>{lineItems.map((li, i) => <li key={i}>{li.date} - {li.minutes} minutes</li>)}</ul>

      {/* this is the issue with not displaying multiple objects */} 
      <h2>Saved Timesheets</h2>
      {saved.map((ts, idx) => (
        <div key={idx}>
          <p><strong>{ts.description}</strong> - ${ts.total_cost}</p>
          <ul>{ts.lineItems.map((li, i) => <li key={i}>{li.date} - {li.minutes} min</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

export default App;
