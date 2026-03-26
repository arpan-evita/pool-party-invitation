// ─── CONFIG ───────────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwktAVPJzT9wr30ovbaZ_citruI7Nun-tFxgIf94CTPTbiUbeF4tfCBSeIVulKda8bsCw/exec';

// Store basic info globally for Step 2 linkage (declared at top scope)
let currentSubmission = { name: '', phone: '' };

// ─── SCROLL REVEAL ────────────────────────────────────────────
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

// ─── FORM SUBMIT ──────────────────────────────────────────────
function handleSubmit() {
  const form = document.getElementById('app-form');
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const instagram = document.getElementById('instagram').value.trim();
  const email = document.getElementById('email').value.trim();
  const occupation = document.getElementById('occupation').value;
  const age = document.getElementById('age').value;
  const ticket = document.querySelector('input[name="ticket"]:checked');
  const comfort = document.querySelector('input[name="comfort"]:checked');
  const agree = document.getElementById('agree').checked;
  const why = document.getElementById('why').value.trim();

  const tierMap = {
    'founders': { name: 'Founders Circle', price: '9999' },
    'curated':  { name: 'Curated Access',  price: '11999' },
    'inner':    { name: 'Inner Circle',    price: '16666' }
  };
  const selectedTier = tierMap[ticket ? ticket.value : ''];

  if (!name || !phone || !instagram || !email || !occupation || !age || !ticket || !comfort || !agree) {
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

  // Save details before the form is reset
  currentSubmission.name  = name;
  currentSubmission.phone = phone;

  const formData = {
    name, phone, instagram, email,
    tier:      selectedTier.name,
    amount:    selectedTier.price,
    occupation, age,
    source:    document.querySelector('input[name="source"]:checked')?.value   || '',
    attending: document.querySelector('input[name="attending"]:checked')?.value || '',
    why,
    comfort:   comfort?.value || '',
    timestamp: new Date().toISOString()
  };

  // application/x-www-form-urlencoded is natively read by Apps Script
  // via e.parameter — no JSON parsing needed, no preflight triggered.
  fetch(SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    cache:   'no-cache',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(formData).toString()
  })
  .then(() => {
    document.getElementById('payment-modal').classList.add('show');
    btn.textContent = 'Application Sent';
    form.reset();
  })
  .catch(error => {
    console.error('Submit error:', error.message);
    btn.disabled = false;
    btn.textContent = 'Error. Try Again';
  });
}

// ─── MODAL STEP NAVIGATION ────────────────────────────────────
function showStep3() {
  document.getElementById('modal-step-1').style.display = 'none';
  document.getElementById('modal-step-2').style.display = 'block';
}

// ─── TRANSACTION ID SUBMIT ────────────────────────────────────
function submitTxn() {
  const txnId = document.getElementById('txn-id').value.trim();
  if (!txnId) {
    alert('Please enter your Transaction ID');
    return;
  }

  const btn = document.getElementById('btn-confirm-txn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  const txnData = {
    name:        currentSubmission.name,
    phone:       currentSubmission.phone,
    transaction: txnId,
    timestamp:   new Date().toISOString(),
    type:        'payment_confirmation'
  };

  // Best-effort log — show success regardless of network response
  // (primary data was already captured in step 1)
  fetch(SCRIPT_URL, {
    method:  'POST',
    mode:    'no-cors',
    cache:   'no-cache',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(txnData).toString()
  })
  .finally(() => {
    document.getElementById('modal-step-2').style.display = 'none';
    document.getElementById('modal-step-3').style.display = 'block';
  });
}

// ─── CLOSE MODAL ─────────────────────────────────────────────
function closeModal() {
  document.getElementById('payment-modal').classList.remove('show');
  setTimeout(() => {
    document.getElementById('modal-step-1').style.display = 'block';
    document.getElementById('modal-step-2').style.display = 'none';
    document.getElementById('modal-step-3').style.display = 'none';
    document.getElementById('txn-id').value = '';
    const confirmBtn = document.getElementById('btn-confirm-txn');
    if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Confirm Reservation'; }
  }, 500);
}


