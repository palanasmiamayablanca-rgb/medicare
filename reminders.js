(() => {
  const dialog = document.getElementById('reminder-dialog');
  const voiceButton = document.getElementById('enable-voice');
  const voiceInside = document.getElementById('enable-voice-popup');
  const detail = document.getElementById('reminder-detail');
  const when = document.getElementById('reminder-when');
  const error = document.getElementById('reminder-error');
  const status = document.getElementById('reminder-status');
  const csrf = dialog.dataset.csrf;
  let current = null, patientName = '', voiceEnabled = false, checking = false, submitting = false;
  function say(text) {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
  function speakCurrent() {
    if (current) say(`Hello ${patientName}. It is time to take your ${current.name}, ${current.dosage}. Please choose taken, skip, or remind me in five minutes.`);
    else say('Voice reminders are enabled. Please keep this page open.');
  }
  function enableVoice() {
    if (!('speechSynthesis' in window)) { status.textContent = 'Your browser does not support spoken reminders.'; return; }
    voiceEnabled = true;
    voiceButton.textContent = '✓ Voice enabled';
    voiceInside.textContent = '🔊 Hear reminder again';
    status.textContent = 'Voice enabled on this page. Keep it open and check your volume.';
    speakCurrent();
  }
  voiceButton.addEventListener('click', enableVoice);
  voiceInside.addEventListener('click', enableVoice);
  dialog.addEventListener('cancel', e => e.preventDefault());
  function showReminder(dose) {
    current = dose;
    detail.textContent = dose.name + ' · ' + dose.dosage;
    when.textContent = 'Scheduled: ' + dose.scheduled_at + ' (Philippine time)';
    error.textContent = '';
    if (!dialog.open) dialog.showModal();
    say(`Hello ${patientName}. It is time to take your ${dose.name}, ${dose.dosage}. Please choose taken, skip, or remind me in five minutes.`);
  }
  async function check() {
    if (checking || submitting) return;
    checking = true;
    try {
      const response = await fetch('index.php?page=poll', {cache:'no-store', credentials:'same-origin'});
      if (!response.ok) throw new Error();
      const data = await response.json();
      patientName = data.name;
      if (current && !data.reminders.some(item => String(item.id) === String(current.id))) {
        if (dialog.open) dialog.close(); current = null;
      }
      if (!current && data.reminders.length) showReminder(data.reminders[0]);
    } catch (_) {
      status.textContent = 'Unable to check reminders. Check your connection and refresh or sign in again.';
    } finally { checking = false; }
  }
  dialog.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', async () => {
    if (!current || submitting) return;
    submitting = true;
    const doseId = current.id, choice = button.dataset.choice;
    dialog.querySelectorAll('[data-choice]').forEach(b => b.disabled = true);
    error.textContent = 'Saving…';
    try {
      const response = await fetch('index.php?page=reminder_action', {
        method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({csrf, dose_id:doseId, choice})
      });
      const result = await response.json();
      if (response.status === 409) { if(dialog.open) dialog.close(); current=null; status.textContent = result.error; }
      else if (!response.ok || !result.ok) { error.textContent = result.error || 'Could not save. Please try again.'; }
      else {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        if (dialog.open) dialog.close(); current = null;
        status.textContent = choice === 'snooze' ? 'Postponed. This reminder will return in 5 minutes while a patient page is open.' : `Dose marked ${choice}. Refresh the dashboard to update your history.`;
      }
    } catch (_) { error.textContent = 'Could not save. Check your connection and try again.'; }
    finally { submitting = false; dialog.querySelectorAll('[data-choice]').forEach(b => b.disabled = false); if (!current) check(); }
  }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  check();
  setInterval(check, 3000);
})();
