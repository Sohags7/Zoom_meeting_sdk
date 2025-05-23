document.addEventListener('DOMContentLoaded', function() {
  const meetinId = document.getElementById('meeting-id');
  const meetingurl = document.getElementById('meeting-url');
  const meetingpass = document.getElementById('meeting-passcode');
  const scheduleForm = document.getElementById('scheduleForm');

  if (!scheduleForm) return; // Don't run if form is not present

  scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = document.getElementById('meetingTopic').value;
    const dateTime = document.getElementById('meetingTime').value;
    const duration = document.getElementById('meetingDuration').value;
    const description = document.getElementById('meetingDesc').value;

    try {
      const res = await fetch('http://localhost:3000/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, startTime: dateTime, duration, description })
      });
      const data = await res.json();
      if (res.ok) {
        const info = document.getElementById('meeting-info');
        info.style.display = "block";
        if (meetinId) meetinId.innerHTML = `<strong>Meeting ID:</strong> ${data.meetingId}</br>`;
        if (meetingurl) meetingurl.innerHTML = `<a href="${data.joinUrl}" target="_blank">Join here</a>`;
        if (meetingpass) meetingpass.innerHTML = `<strong>Passcode:</strong> ${data.passcode }`;
        
      } else {
        
        if (info) info.textContent = 'Error: ' + (data.error || 'Could not create meeting.');
      }
    } catch (err) {
      console.error(err);
      const info = document.getElementById('meeting-info');
      if (info) info.textContent = 'Error creating meeting.';
    }
  });
});
