/* ============================================
   Booking page logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const serviceSelect = document.getElementById('b-service');
  const doctorSelect = document.getElementById('b-doctor');
  const dateInput = document.getElementById('b-date');
  const dateError = document.getElementById('b-date-error');

  // ---- Populate services ----
  const services = MDStore.getServices();
  serviceSelect.innerHTML = services
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join('');

  // ---- Populate doctors (optional — clinic may have none listed yet) ----
  const doctors = MDStore.getDoctors();
  doctors.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `${d.name}${d.specialty ? ' — ' + d.specialty : ''}`;
    doctorSelect.appendChild(opt);
  });

  // ---- Date constraints: no past dates, no Friday/Sunday (closed days) ----
  const today = new Date();
  dateInput.min = today.toISOString().split('T')[0];

  function isClosedDay(dateStr) {
    if (!dateStr) return false;
    const day = new Date(dateStr + 'T00:00:00').getDay(); // 0 = Sunday, 5 = Friday
    return day === 0 || day === 5;
  }

  dateInput.addEventListener('change', () => {
    const closed = isClosedDay(dateInput.value);
    dateError.classList.toggle('show', closed);
    dateInput.setCustomValidity(closed ? 'Closed on this day' : '');
  });

  const phoneInput = document.getElementById('b-phone');
  const phoneError = document.getElementById('b-phone-error');

  function digitsOnly(str) {
    return (str || '').replace(/\D/g, '');
  }

  function isValidPhone(value) {
    return digitsOnly(value).length === 11;
  }

  phoneInput.addEventListener('input', () => {
    if (digitsOnly(phoneInput.value).length === 0) {
      phoneError.classList.remove('show');
      return;
    }
    phoneError.classList.toggle('show', !isValidPhone(phoneInput.value));
  });

  // ---- Submit handling ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      const errorEl = field.parentElement.querySelector('.field-error');
      if (!field.value.trim()) {
        valid = false;
        if (errorEl) errorEl.classList.add('show');
      } else if (errorEl && errorEl !== dateError && errorEl !== phoneError) {
        errorEl.classList.remove('show');
      }
    });

    if (!isValidPhone(phoneInput.value)) {
      valid = false;
      phoneError.classList.add('show');
    }

    if (isClosedDay(dateInput.value)) {
      valid = false;
      dateError.classList.add('show');
    }

    if (!valid) return;

    const serviceObj = services.find((s) => s.id === serviceSelect.value);
    const doctorObj = doctors.find((d) => d.id === doctorSelect.value);

    const appointment = MDStore.addAppointment({
      name: document.getElementById('b-name').value.trim(),
      phone: document.getElementById('b-phone').value.trim(),
      serviceId: serviceObj ? serviceObj.id : '',
      serviceName: serviceObj ? serviceObj.name : '',
      doctorId: doctorObj ? doctorObj.id : '',
      doctorName: doctorObj ? doctorObj.name : '',
      date: dateInput.value,
      time: document.getElementById('b-time').value,
      notes: document.getElementById('b-notes').value.trim(),
    });

    showSuccess(appointment);
  });

  function showSuccess(appt) {
    document.getElementById('booking-form-wrap').style.display = 'none';
    const successEl = document.getElementById('booking-success');
    successEl.classList.add('show');

    const dateDisplay = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

    document.getElementById('booking-summary').innerHTML = `
      <div><span>Name</span><strong>${appt.name}</strong></div>
      <div><span>Service</span><strong>${appt.serviceName}</strong></div>
      ${appt.doctorName ? `<div><span>Doctor</span><strong>${appt.doctorName}</strong></div>` : ''}
      <div><span>Date</span><strong>${dateDisplay}</strong></div>
      <div><span>Time</span><strong>${appt.time}</strong></div>
    `;

    const waMessage = encodeURIComponent(
      `Hi Marium Dental Surgery, I'd like to confirm my appointment:\n` +
      `Name: ${appt.name}\nPhone: ${appt.phone}\nService: ${appt.serviceName}\n` +
      `${appt.doctorName ? 'Doctor: ' + appt.doctorName + '\n' : ''}` +
      `Date: ${dateDisplay}\nTime: ${appt.time}` +
      `${appt.notes ? '\nNotes: ' + appt.notes : ''}`
    );
    document.getElementById('whatsapp-confirm-btn').href = `https://wa.me/923706418709?text=${waMessage}`;

    successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('book-another-btn').addEventListener('click', () => {
    form.reset();
    document.getElementById('booking-success').classList.remove('show');
    document.getElementById('booking-form-wrap').style.display = '';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});