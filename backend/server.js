const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected to ZenWA CRM'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/inbox', require('./routes/inbox'));
app.use('/api/coexistence', require('./routes/coexistence'));
app.use('/api/broadcasts', require('./routes/broadcasts'));
app.use('/api/flows', require('./routes/flows'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/ai-agent', require('./routes/aiAgent'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
