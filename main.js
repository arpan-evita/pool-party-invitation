// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => observer.observe(el));

// Form submit
function handleSubmit() {
  const form = document.getElementById('app-form');
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const instagram = document.getElementById('instagram').value.trim();
  const occupation = document.getElementById('occupation').value;
  const age = document.getElementById('age').value;
  const ticket = document.querySelector('input[name="ticket"]:checked');
  const comfort = document.querySelector('input[name="comfort"]:checked');
  const agree = document.getElementById('agree').checked;

  if (!name || !phone || !instagram || !occupation || !age || !ticket || !comfort || !agree) {
    // Highlight missing
    const btn = document.getElementById('submit-btn');
    btn.style.background = 'rgba(180,60,60,0.8)';
    btn.textContent = 'Please complete all required fields';
    setTimeout(() => {
      btn.style.background = '';
      btn.textContent = 'Submit Application';
    }, 2600);
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  // Google Apps Script Web App URL
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwktAVPJzT9wr30ovbaZ_citruI7Nun-tFxgIf94CTPTbiUbeF4tfCBSeIVulKda8bsCw/exec';

  const formData = {
    name,
    phone,
    instagram,
    occupation,
    age,
    source: document.querySelector('input[name="source"]:checked')?.value || '',
    attending: document.querySelector('input[name="attending"]:checked')?.value || '',
    why,
    ticket: ticket.value,
    comfort: comfort.value,
    date: new Date().toLocaleString()
  };

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // Apps Script requires no-cors for simple POST
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(() => {
    form.style.display = 'none';
    document.getElementById('confirmation').classList.add('show');
    window.scrollTo({ top: document.getElementById('apply').offsetTop - 80, behavior: 'smooth' });
  })
  .catch(error => {
    console.error('Error!', error.message);
    btn.disabled = false;
    btn.textContent = 'Error. Try Again';
  });
}

