

require('dotenv').config();              
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');         
const path = require('path');
const app = express();

// Example for KJUR
const { KJUR } = require('jsrsasign');
// Define coerceRequestBody and validationErrors or remove if not needed
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


let zoomAccessToken = null;

app.get('/', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


async function getAccessTokenOfZoomClient() {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const auth_token_url = "https://zoom.us/oauth/token";
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const authRequest = {
      method: 'POST',
      url: `${auth_token_url}?grant_type=account_credentials&account_id=${accountId}`,
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    };

    const response = await axios.request(authRequest);
    return response.data.access_token;
  } catch (error) {
    console.log(error.response?.data || error.message);
    return undefined;
  }
}

app.post('/api/schedule', async (req, res) => {
  try {
    zoomAccessToken = await getAccessTokenOfZoomClient();
    console.log('e');

  
    const { topic, startTime, duration, description } = req.body;
    
    const meetingData = {
      topic: topic,
      type: 2,
      start_time: startTime,
      duration: duration,
      agenda: description,
      timezone: 'UTC' 
     
    };

    const meetingRes = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingData,
      {
        headers: {
          'Authorization': `Bearer ${zoomAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Extract needed info from Zoom's response
    const { id, join_url, password } = meetingRes.data;
    res.json({ meetingId: id, joinUrl: join_url, passcode: password });
  } catch (error) {

  console.log('Zoom access token is valid.', zoomAccessToken);
    console.error('Error scheduling meeting:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create Zoom meeting.' });
  }
});


app.post('/api/join-meeting', (req, res) => {

  const { meetingNumber, role } = req.body;

  console.log('meetingNumber', meetingNumber);
  console.log('role', role);
  let expirationSeconds = 7200; // Default expiration time in seconds (2 hours)
  let videoWebRtcMode = 0; // Default value for videoWebRtcMode
  const iat = Math.floor(Date.now() / 1000)
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2
  const oHeader = { alg: 'HS256', typ: 'JWT' }

  const oPayload = {
    appKey: process.env.SDK_KEY,
    sdkKey: process.env.SDK_SECRET,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
    video_webrtc_mode: videoWebRtcMode
  }

  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.SDK_SECRET)
  return res.json({ signature: sdkJWT, sdkKey: process.env.SDK_KEY })
})

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to start.`);
});
