/* ============================================
   Shared data store — services, doctors, appointments
   Uses localStorage so the booking page and admin panel
   can share data on the SAME browser/device.

   IMPORTANT: localStorage is per-browser, per-device.
   This is fine for a single reception-desk computer, but
   it will NOT sync bookings across a patient's phone and
   the clinic's computer. For that, this needs a real
   backend (e.g. Supabase, Firebase, or a small server) —
   see the note in admin.html.
   ============================================ */

const MD_KEYS = {
  services: 'md_services',
  doctors: 'md_doctors',
  appointments: 'md_appointments',
};

const MD_DEFAULT_SERVICES = [
  { id: 's1', name: 'Consultations & Checkups', duration: '20–30 min', blurb: 'Routine exam of teeth, gums, and bite.' },
  { id: 's2', name: 'Cleaning & Scaling', duration: '30–45 min', blurb: 'Plaque and tartar removal, polishing.' },
  { id: 's3', name: 'Fillings & Cavity Treatment', duration: '30–60 min', blurb: 'Tooth-coloured composite fillings.' },
  { id: 's4', name: 'Root Canal Treatment', duration: '1–2 visits', blurb: 'Pain relief and tooth-saving treatment.' },
  { id: 's5', name: 'Tooth Extraction', duration: '20–40 min', blurb: 'Safe removal when a tooth can\u2019t be saved.' },
  { id: 's6', name: 'Gum Care', duration: '30–45 min', blurb: 'Treatment for bleeding or sensitive gums.' },
];

function mdLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Data store read error for', key, e);
    return fallback;
  }
}

function mdSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Data store write error for', key, e);
    return false;
  }
}

function mdUid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const MDStore = {
  getServices() {
    let list = mdLoad(MD_KEYS.services, null);
    if (!list) {
      list = MD_DEFAULT_SERVICES;
      mdSave(MD_KEYS.services, list);
    }
    return list;
  },
  setServices(list) { mdSave(MD_KEYS.services, list); },
  addService(service) {
    const list = this.getServices();
    list.push({ id: mdUid(), ...service });
    this.setServices(list);
  },
  updateService(id, updates) {
    const list = this.getServices().map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.setServices(list);
  },
  deleteService(id) {
    this.setServices(this.getServices().filter((s) => s.id !== id));
  },

  getDoctors() {
    return mdLoad(MD_KEYS.doctors, []);
  },
  setDoctors(list) { mdSave(MD_KEYS.doctors, list); },
  addDoctor(doctor) {
    const list = this.getDoctors();
    list.push({ id: mdUid(), ...doctor });
    this.setDoctors(list);
  },
  updateDoctor(id, updates) {
    const list = this.getDoctors().map((d) => (d.id === id ? { ...d, ...updates } : d));
    this.setDoctors(list);
  },
  deleteDoctor(id) {
    this.setDoctors(this.getDoctors().filter((d) => d.id !== id));
  },

  getAppointments() {
    return mdLoad(MD_KEYS.appointments, []);
  },
  setAppointments(list) { mdSave(MD_KEYS.appointments, list); },
  addAppointment(appt) {
    const list = this.getAppointments();
    const record = { id: mdUid(), status: 'pending', createdAt: new Date().toISOString(), ...appt };
    list.unshift(record);
    this.setAppointments(list);
    return record;
  },
  updateAppointment(id, updates) {
    const list = this.getAppointments().map((a) => (a.id === id ? { ...a, ...updates } : a));
    this.setAppointments(list);
  },
  deleteAppointment(id) {
    this.setAppointments(this.getAppointments().filter((a) => a.id !== id));
  },
};