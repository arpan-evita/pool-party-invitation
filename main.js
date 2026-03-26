const WEBHOOK = 'https://script.google.com/macros/s/AKfycbwktAVPJzT9wr30ovbaZ_citruI7Nun-tFxgIf94CTPTbiUbeF4tfCBSeIVulKda8bsCw/exec';

const TIERS = {
  'Founder': { label: 'Founders Circle', price: 9999 },
  'Curated': { label: 'Curated Access', price: 11999 },
  'VIP':     { label: 'Inner Circle',    price: 16666 }
};

let selectedTier = 'Curated';
let screenshotB64 = '';

function openModal(tierKey) {
  selectedTier = tierKey;
  const info = TIERS[tierKey];
  const tierEl = document.getElementById('sum-tier');
  const priceEl = document.getElementById('sum-price');
  
  if (tierEl) tierEl.textContent = info.label;
  if (priceEl) priceEl.textContent = '₹' + info.price.toLocaleString();
  
  const modal = document.getElementById('modal-overlay');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  showStep(1);
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.body.style.overflow = 'auto';
}

function showStep(n) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
}

function nextStep(n) {
  // Simple validation for Step 1
  if (n === 2) {
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    if (!name || !phone) {
      alert('Please enter your name and WhatsApp number.');
      return;
    }
  }
  showStep(n);
}

// Handle Screenshot Upload
const screenshotInput = document.getElementById('f-screenshot');
if (screenshotInput) {
  screenshotInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const text = document.getElementById('sc-text');
    const preview = document.getElementById('sc-preview');
    const nameDisplay = document.getElementById('sc-file-name');
    
    if (text) text.style.display = 'none';
    if (preview) preview.style.display = 'block';
    if (nameDisplay) nameDisplay.textContent = file.name;
    
    screenshotB64 = await toBase64(file);
  });
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function submitReservation() {
  const btn = document.getElementById('btn-submit');
  const txn = document.getElementById('f-txn').value.trim();

  if (!txn) {
    alert('Please enter your Transaction ID for verification.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Processing...';

  const info = TIERS[selectedTier];
  const payload = {
    name:        document.getElementById('f-name').value.trim(),
    phone:       document.getElementById('f-phone').value.trim(),
    instagram:   document.getElementById('f-insta').value.trim(),
    email:       document.getElementById('f-email').value.trim(),
    tier:        info.label,
    amount:      String(info.price),
    transaction: txn,
    screenshot:  screenshotB64 ? '[attached]' : '',
    timestamp:   new Date().toLocaleString()
  };

  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showStep('success');
  } catch(e) {
    console.error('Submission error:', e);
    // Since no-cors might hide success, we still proceed to success screen
    showStep('success');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirm Reservation';
  }
}

// FAQ Accordion
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const a = q.nextElementSibling;
    const isOpen = a.classList.contains('open');
    
    // Close others
    document.querySelectorAll('.faq-a').forEach(x => x.classList.remove('open'));
    document.querySelectorAll('.faq-q').forEach(x => x.classList.remove('open'));
    
    if (!isOpen) { 
      a.classList.add('open'); 
      q.classList.add('open'); 
    }
  });
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Close modal on background click
const overlay = document.getElementById('modal-overlay');
if (overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
}
