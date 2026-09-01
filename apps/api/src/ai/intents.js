export const INTENTS = {
  GREETING: 'GREETING',
  SERVICE_INFORMATION: 'SERVICE_INFORMATION',
  PRICE_INFORMATION: 'PRICE_INFORMATION',
  DOCTOR_INFORMATION: 'DOCTOR_INFORMATION',
  CLINIC_INFORMATION: 'CLINIC_INFORMATION',
  LOCATION: 'LOCATION',
  WORKING_HOURS: 'WORKING_HOURS',
  APPOINTMENT_BOOKING: 'APPOINTMENT_BOOKING',
  APPOINTMENT_RESCHEDULE: 'APPOINTMENT_RESCHEDULE',
  APPOINTMENT_CANCEL: 'APPOINTMENT_CANCEL',
  APPOINTMENT_STATUS: 'APPOINTMENT_STATUS',
  LEAD_CAPTURE: 'LEAD_CAPTURE',
  FOLLOW_UP: 'FOLLOW_UP',
  HUMAN_REQUEST: 'HUMAN_REQUEST',
  MEDICAL_QUESTION: 'MEDICAL_QUESTION',
  EMERGENCY_SIGNAL: 'EMERGENCY_SIGNAL',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Fast deterministic intent classifier with support for English, Hindi, and Hinglish.
 */
export function detectIntent(text = '') {
  // Normalize punctuation and spacing
  const clean = text.toLowerCase().replace(/[,.!?]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Emergency Signal (Highest Priority)
  if (
    clean.includes('emergency') ||
    clean.includes('severe allergic') ||
    clean.includes('bleeding uncontrollably') ||
    clean.includes('anaphylaxis') ||
    clean.includes('swelling in throat') ||
    clean.includes('cannot breathe') ||
    clean.includes('heart attack') ||
    clean.includes('emergency hai') ||
    clean.includes('bahut bleeding ho rahi')
  ) {
    return INTENTS.EMERGENCY_SIGNAL;
  }

  // 2. Human Request / Doctor Request
  if (
    clean.includes('human') ||
    clean.includes('talk to human') ||
    clean.includes('speak with agent') ||
    clean.includes('representative') ||
    clean.includes('receptionist') ||
    clean.includes('doctor se baat') ||
    clean.includes('staff se baat') ||
    clean.includes('talk to doctor') ||
    clean.includes('call me') ||
    clean.includes('connect to person') ||
    clean.includes('asli insan') ||
    clean.includes('mujhe doctor se baat karni')
  ) {
    return INTENTS.HUMAN_REQUEST;
  }

  // 3. Medical / Diagnosis / Prescription Question
  if (
    clean.includes('medicine') ||
    clean.includes('which cream') ||
    clean.includes('kaunsi cream') ||
    clean.includes('kaunsi dawai') ||
    clean.includes('dawa batao') ||
    clean.includes('ointment') ||
    clean.includes('steroid') ||
    clean.includes('hydrocortisone') ||
    clean.includes('isotretinoin') ||
    clean.includes('tretinoin') ||
    clean.includes('antibiotic') ||
    clean.includes('diagnose') ||
    clean.includes('kya bimari hai') ||
    clean.includes('rash treatment at home') ||
    clean.includes('is this skin cancer') ||
    clean.includes('prescribe') ||
    clean.includes('dosage')
  ) {
    return INTENTS.MEDICAL_QUESTION;
  }

  // 4. Appointment Reschedule
  if (
    clean.includes('reschedule') ||
    clean.includes('change appointment') ||
    clean.includes('change time') ||
    clean.includes('postpone') ||
    clean.includes('prepone') ||
    clean.includes('dusre din karna') ||
    clean.includes('time badalna') ||
    clean.includes('date change')
  ) {
    return INTENTS.APPOINTMENT_RESCHEDULE;
  }

  // 5. Appointment Cancel
  if (
    clean.includes('cancel appointment') ||
    clean.includes('cancel my booking') ||
    clean.includes('appointment cancel') ||
    clean.includes('nahi aa sakta') ||
    clean.includes('cancel kardo')
  ) {
    return INTENTS.APPOINTMENT_CANCEL;
  }

  // 6. Appointment Status
  if (
    clean.includes('my appointment') ||
    clean.includes('booking status') ||
    clean.includes('check appointment') ||
    clean.includes('kab hai mera appointment')
  ) {
    return INTENTS.APPOINTMENT_STATUS;
  }

  // 7. Appointment Booking
  if (
    clean.includes('book appointment') ||
    clean.includes('book slot') ||
    clean.includes('schedule consultation') ||
    clean.includes('appointment chahiye') ||
    clean.includes('appointment book') ||
    clean.includes('book karna hai') ||
    clean.includes('slot available') ||
    clean.includes('kal 4 baje') ||
    clean.includes('available slots') ||
    clean.includes('book') ||
    clean.includes('consultation schedule')
  ) {
    return INTENTS.APPOINTMENT_BOOKING;
  }

  // 8. Price Information
  if (
    clean.includes('price') ||
    clean.includes('cost') ||
    clean.includes('fee') ||
    clean.includes('charges') ||
    clean.includes('kitne ka hai') ||
    clean.includes('fees kitni hai') ||
    clean.includes('consultation fee') ||
    clean.includes('prp cost') ||
    clean.includes('rate') ||
    clean.includes('how much')
  ) {
    return INTENTS.PRICE_INFORMATION;
  }

  // 9. Location & Address
  if (
    clean.includes('location') ||
    clean.includes('address') ||
    clean.includes('kahan hai') ||
    clean.includes('where is the clinic') ||
    clean.includes('directions') ||
    clean.includes('maps') ||
    clean.includes('cyber city') ||
    clean.includes('gurgaon')
  ) {
    return INTENTS.LOCATION;
  }

  // 10. Working Hours & Timings
  if (
    clean.includes('timings') ||
    clean.includes('working hours') ||
    clean.includes('opening hours') ||
    clean.includes('kab khulta hai') ||
    clean.includes('open on sunday') ||
    clean.includes('closing time') ||
    clean.includes('hours')
  ) {
    return INTENTS.WORKING_HOURS;
  }

  // 11. Doctor Information
  if (
    clean.includes('doctor') ||
    clean.includes('dr ') ||
    clean.includes('dermatologist') ||
    clean.includes('specialist') ||
    clean.includes('qualification') ||
    clean.includes('ananya') ||
    clean.includes('vikram') ||
    clean.includes('experience')
  ) {
    return INTENTS.DOCTOR_INFORMATION;
  }

  // 12. Service Information
  if (
    clean.includes('acne') ||
    clean.includes('pimple') ||
    clean.includes('hair loss') ||
    clean.includes('hair fall') ||
    clean.includes('prp') ||
    clean.includes('laser') ||
    clean.includes('pigmentation') ||
    clean.includes('chemical peel') ||
    clean.includes('scars') ||
    clean.includes('hydrafacial') ||
    clean.includes('services') ||
    clean.includes('treatment') ||
    clean.includes('facial') ||
    clean.includes('glow') ||
    clean.includes('melasma')
  ) {
    return INTENTS.SERVICE_INFORMATION;
  }

  // 13. Clinic Information
  if (
    clean.includes('about clinic') ||
    clean.includes('dermacare') ||
    clean.includes('phone number') ||
    clean.includes('email')
  ) {
    return INTENTS.CLINIC_INFORMATION;
  }

  // 14. Greeting (Support words & phrases)
  const greetingWords = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'hola'];
  if (greetingWords.some((w) => clean === w || clean.startsWith(w + ' '))) {
    return INTENTS.GREETING;
  }

  // 15. Follow Up
  if (
    clean.includes('thanks') ||
    clean.includes('thank you') ||
    clean.includes('ok') ||
    clean.includes('okay') ||
    clean.includes('dhanyawaad') ||
    clean.includes('sure')
  ) {
    return INTENTS.FOLLOW_UP;
  }

  return INTENTS.UNKNOWN;
}
