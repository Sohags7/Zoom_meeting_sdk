const ZoomMtg = window.ZoomMtg;

document.getElementById('startMeeting').addEventListener('click', async () => {
  const userName = document.getElementById('username').value.trim() || 'Guest';
  const meetingNumber = document.getElementById('meetingNumber').value.trim();
  const pwd = document.getElementById('pwd').value.trim();
  const role = Number(document.getElementById('roleSelect').value);

const  sdkKey = 'prZ_hf8sTMSBRCz1aHH1Tw'; // <-- SDK Key here
  if (!meetingNumber) {
    alert('Please enter a meeting number');
    return;
  }


  const sessionKey = `sess_${Date.now()}`;
  console.log("Session Key: ", sessionKey);
  
  async function getToken() {
    const response = await fetch('http://localhost:3000/api/join-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        meetingNumber: meetingNumber,
        role: role,
      }),
    });
    return response.json();
  }

  try {
    const { signature , sdkKey} = await getToken();
 console.log("Joining Zoom with: ", {
  signature: signature,
  sdkKey: sdkKey,
  meetingNumber,
  userName,
  pwd,
});

   ZoomMtg.setZoomJSLib('https://source.zoom.us/3.13.2/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
    ZoomMtg.i18n.load('en-US');
    ZoomMtg.i18n.reload('en-US');

    ZoomMtg.init({
      leaveUrl: 'https://zoom.us',
      isSupportAV: true,
      success: function () {
        ZoomMtg.join({
          signature,
          sdkKey : 'prZ_hf8sTMSBRCz1aHH1Tw',        
          meetingNumber,
          userName,
          passWord: pwd,
          success: () => {
            console.log("Meeting joined successfully!");
          },
          error: err => {
            console.error("Join error:", err);
          }
        });
      },
      error: function (err) {
        console.error('Init error', err);
      }
    });

  } catch (err) {
    console.error('Error fetching token:', err);
  }
});
