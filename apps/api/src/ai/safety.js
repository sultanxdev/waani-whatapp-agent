export const SAFETY_CATEGORIES = {
  BUSINESS_QUESTION: 'BUSINESS_QUESTION',
  MEDICAL_QUESTION: 'MEDICAL_QUESTION',
  EMERGENCY_SIGNAL: 'EMERGENCY_SIGNAL',
  UNKNOWN: 'UNKNOWN'
};

export function classifySafety(text = '') {
  const clean = text.toLowerCase().trim();

  // Emergency triggers
  if (
    clean.includes('emergency') ||
    clean.includes('severe allergic') ||
    clean.includes('bleeding uncontrollably') ||
    clean.includes('anaphylaxis') ||
    clean.includes('swelling in throat') ||
    clean.includes('cannot breathe') ||
    clean.includes('poisoning') ||
    clean.includes('acute burn') ||
    clean.includes('unconscious')
  ) {
    return {
      category: SAFETY_CATEGORIES.EMERGENCY_SIGNAL,
      isSafeForBotAnswer: false,
      requiresHandoff: true,
      reason: 'Patient indicated potential medical emergency requiring immediate hospital assistance.'
    };
  }

  // Medical diagnosis / prescription / dosage / symptoms triggers
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
    clean.includes('kya bimari hai') ||
    clean.includes('diagnose') ||
    clean.includes('eczema') ||
    clean.includes('fungal') ||
    clean.includes('blisters') ||
    clean.includes('rash') ||
    clean.includes('infection') ||
    clean.includes('itching with red') ||
    clean.includes('is this skin cancer') ||
    clean.includes('peeling skin with pus') ||
    clean.includes('prescribe') ||
    clean.includes('dosage')
  ) {
    return {
      category: SAFETY_CATEGORIES.MEDICAL_QUESTION,
      isSafeForBotAnswer: false,
      requiresHandoff: true,
      reason: 'Medical question regarding diagnosis, prescription, or pharmaceutical treatments requiring dermatologist clinical review.'
    };
  }

  // Business queries
  if (
    clean.includes('price') ||
    clean.includes('cost') ||
    clean.includes('fee') ||
    clean.includes('timing') ||
    clean.includes('hours') ||
    clean.includes('location') ||
    clean.includes('address') ||
    clean.includes('doctor') ||
    clean.includes('appointment') ||
    clean.includes('book') ||
    clean.includes('reschedule') ||
    clean.includes('cancel') ||
    clean.includes('service') ||
    clean.includes('acne') ||
    clean.includes('prp') ||
    clean.includes('laser') ||
    clean.includes('hi') ||
    clean.includes('hello')
  ) {
    return {
      category: SAFETY_CATEGORIES.BUSINESS_QUESTION,
      isSafeForBotAnswer: true,
      requiresHandoff: false,
      reason: 'Standard administrative or clinic service query.'
    };
  }

  return {
    category: SAFETY_CATEGORIES.UNKNOWN,
    isSafeForBotAnswer: true,
    requiresHandoff: false,
    reason: 'General or unclassified enquiry.'
  };
}
