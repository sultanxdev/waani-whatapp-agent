import bcrypt from 'bcryptjs';
import db from './db.js';

export async function seedDatabase() {
  console.log('🌱 Seeding database for DermaCare Clinic...');

  // 1. Clinic
  const clinicId = 'clinic_derma_care_01';
  db.data.clinics = [
    {
      id: clinicId,
      name: 'DermaCare Skin, Hair & Laser Clinic',
      tagline: 'Advanced Clinical Dermatology & Aesthetic Excellence',
      phone: '+91 98765 43210',
      whatsapp_number: '+919876543210',
      email: 'care@dermacareclinic.com',
      website: 'https://dermacareclinic.example.com',
      address: 'Suite 402, DLF Cyber City, Sector 24, Gurugram, Haryana 122002',
      google_maps_url: 'https://maps.google.com/?q=DLF+Cyber+City+Gurugram',
      currency: 'INR',
      working_hours: 'Monday to Saturday: 10:00 AM - 7:30 PM, Sunday: 10:00 AM - 2:00 PM',
      emergency_instructions: 'For severe acute allergic reactions or medical emergencies, please visit the nearest hospital emergency room immediately or call 112.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 2. Users (Owner, Staff, Doctor, Admin)
  const passwordHash = bcrypt.hashSync('password123', 10);
  db.data.users = [
    {
      id: 'user_owner_01',
      clinic_id: clinicId,
      name: 'Dr. Ananya Sharma',
      email: 'owner@dermacare.com',
      phone: '+919876543210',
      password: passwordHash,
      role: 'OWNER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user_staff_01',
      clinic_id: clinicId,
      name: 'Pooja Verma (Receptionist)',
      email: 'reception@dermacare.com',
      phone: '+919876543211',
      password: passwordHash,
      role: 'STAFF',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user_doctor_01',
      clinic_id: clinicId,
      name: 'Dr. Vikram Kapoor',
      email: 'dr.vikram@dermacare.com',
      phone: '+919876543212',
      password: passwordHash,
      role: 'DOCTOR',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user_admin_01',
      clinic_id: clinicId,
      name: 'System Administrator',
      email: 'admin@system.local',
      phone: '+919876543299',
      password: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 3. Doctors & Schedules
  db.data.doctors = [
    {
      id: 'doc_ananya_01',
      clinic_id: clinicId,
      user_id: 'user_owner_01',
      name: 'Dr. Ananya Sharma',
      qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
      registration_no: 'DMC/R/14892',
      specialty: 'Clinical Dermatology, Acne & Anti-Aging Aesthetics',
      consultation_duration: 30,
      fee: 800,
      status: 'ACTIVE',
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      working_start_time: '10:00',
      working_end_time: '19:00',
      break_start_time: '13:30',
      break_end_time: '14:30',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'doc_vikram_02',
      clinic_id: clinicId,
      user_id: 'user_doctor_01',
      name: 'Dr. Vikram Kapoor',
      qualification: 'MBBS, DVD, Fellowship in Hair Restoration',
      registration_no: 'DMC/R/19043',
      specialty: 'Trichology, PRP, Hair Loss & Laser Procedures',
      consultation_duration: 30,
      fee: 800,
      status: 'ACTIVE',
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      working_start_time: '11:00',
      working_end_time: '19:30',
      break_start_time: '14:00',
      break_end_time: '15:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 4. Services
  db.data.services = [
    {
      id: 'srv_acne_01',
      clinic_id: clinicId,
      name: 'Acne & Breakouts Consultation',
      category: 'Clinical Dermatology',
      description: 'Comprehensive skin assessment, root-cause identification (hormonal/dietary/lifestyle), and customized treatment protocol.',
      price: 800,
      duration: 30,
      is_active: true,
      booking_enabled: true,
      doctor_id: 'doc_ananya_01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'srv_hair_prp_02',
      clinic_id: clinicId,
      name: 'PRP Hair Loss Therapy',
      category: 'Hair & Trichology',
      description: 'Platelet-Rich Plasma therapy to stimulate dormant hair follicles, increase hair density, and reduce shedding.',
      price: 4500,
      duration: 45,
      is_active: true,
      booking_enabled: true,
      doctor_id: 'doc_vikram_02',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'srv_laser_carbon_03',
      clinic_id: clinicId,
      name: 'Laser Carbon Peel (Hollywood Facial)',
      category: 'Laser Aesthetics',
      description: 'Advanced Q-switched laser treatment for deep pore cleansing, oil control, instant glow, and fine line reduction.',
      price: 3500,
      duration: 45,
      is_active: true,
      booking_enabled: true,
      doctor_id: 'doc_ananya_01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'srv_chemical_peel_04',
      clinic_id: clinicId,
      name: 'Chemical Peel for Pigmentation & Melasma',
      category: 'Cosmetic Dermatology',
      description: 'Dermatologist-grade glycolic / lactic / salicylic peel to lighten stubborn dark spots, sun tanning, and hyperpigmentation.',
      price: 2200,
      duration: 30,
      is_active: true,
      booking_enabled: true,
      doctor_id: 'doc_ananya_01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'srv_acne_scar_05',
      clinic_id: clinicId,
      name: 'Acne Scar Subcision & Microneedling',
      category: 'Scar Revision',
      description: 'Targeted RF Microneedling combined with subcision to rebuild collagen and smooth out pitted acne scars.',
      price: 5000,
      duration: 60,
      is_active: true,
      booking_enabled: true,
      doctor_id: 'doc_ananya_01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'srv_hydrafacial_06',
      clinic_id: clinicId,
      name: 'Medical Grade Hydra-Dermabrasion',
      category: 'Medi-Facials',
      description: 'Multi-step vortex deep cleansing, exfoliation, extraction, and antioxidant serum infusion for radiant skin.',
      price: 3000,
      duration: 45,
      is_active: true,
      booking_enabled: true,
      doctor_id: 'doc_ananya_01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 5. Clinic-Approved FAQs
  db.data.faqs = [
    {
      id: 'faq_01',
      clinic_id: clinicId,
      category: 'Consultation & Pricing',
      question: 'What is the consultation fee?',
      answer: 'Our initial in-person consultation fee is ₹800 with our senior dermatologists (Dr. Ananya Sharma / Dr. Vikram Kapoor).',
      approved: true,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'faq_02',
      clinic_id: clinicId,
      category: 'Timings & Location',
      question: 'What are the clinic timings and address?',
      answer: 'We are open Monday to Saturday from 10:00 AM to 7:30 PM, and Sunday from 10:00 AM to 2:00 PM. Our address is Suite 402, DLF Cyber City, Sector 24, Gurugram (Near Cyber Hub Metro Station).',
      approved: true,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'faq_03',
      clinic_id: clinicId,
      category: 'Procedures',
      question: 'How many PRP sessions are required for hair loss?',
      answer: 'Most patients require 4 to 6 sessions spaced 4 weeks apart for optimal hair regrowth, followed by maintenance sessions every 6 months. The exact protocol is personalized during consultation.',
      approved: true,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'faq_04',
      clinic_id: clinicId,
      category: 'Pre-treatment',
      question: 'Do I need any preparation before coming for an appointment?',
      answer: 'Please come with a clean face free of heavy makeup. Bring any previous prescription slips or skin care products you currently use.',
      approved: true,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'faq_05',
      clinic_id: clinicId,
      category: 'Payment',
      question: 'What payment modes do you accept?',
      answer: 'We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash at the clinic reception.',
      approved: true,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  // 6. Sample Leads
  db.data.leads = [
    {
      id: 'lead_01',
      clinic_id: clinicId,
      name: 'Rahul Verma',
      phone: '+919811223344',
      service: 'Acne & Breakouts Consultation',
      service_id: 'srv_acne_01',
      intent: 'APPOINTMENT_BOOKING',
      source: 'WhatsApp',
      status: 'BOOKED',
      assigned_to: 'user_staff_01',
      notes: 'Has active cystic acne for 6 months. Scheduled for Saturday 2:30 PM.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'lead_02',
      clinic_id: clinicId,
      name: 'Priyanka Sen',
      phone: '+919877112233',
      service: 'PRP Hair Loss Therapy',
      service_id: 'srv_hair_prp_02',
      intent: 'PRICE_INFORMATION',
      source: 'Instagram',
      status: 'QUALIFIED',
      assigned_to: 'user_staff_01',
      notes: 'Inquired about PRP cost and package discounts. Interested in booking for next week.',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'lead_03',
      clinic_id: clinicId,
      name: 'Amit Khurana',
      phone: '+919822334455',
      service: 'Acne Scar Subcision & Microneedling',
      service_id: 'srv_acne_scar_05',
      intent: 'MEDICAL_QUESTION',
      source: 'WhatsApp',
      status: 'CONTACTED',
      assigned_to: 'user_staff_01',
      notes: 'Asked about post-procedure downtime. Escalated to clinic staff.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'lead_04',
      clinic_id: clinicId,
      name: 'Simran Kaur',
      phone: '+919833445566',
      service: 'Laser Carbon Peel (Hollywood Facial)',
      service_id: 'srv_laser_carbon_03',
      intent: 'SERVICE_INFORMATION',
      source: 'Google',
      status: 'NEW',
      assigned_to: 'user_staff_01',
      notes: 'Wedding next month, wants skin rejuvenation protocol.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 7. Sample Appointments
  const today = new Date().toISOString().split('T')[0];
  db.data.appointments = [
    {
      id: 'apt_01',
      clinic_id: clinicId,
      lead_id: 'lead_01',
      patient_name: 'Rahul Verma',
      patient_phone: '+919811223344',
      doctor_id: 'doc_ananya_01',
      doctor_name: 'Dr. Ananya Sharma',
      service_id: 'srv_acne_01',
      service_name: 'Acne & Breakouts Consultation',
      date: today,
      time: '14:30',
      duration: 30,
      status: 'CONFIRMED',
      notes: 'First time consultation for acne.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'apt_02',
      clinic_id: clinicId,
      lead_id: null,
      patient_name: 'Meera Rajput',
      patient_phone: '+919844556677',
      doctor_id: 'doc_vikram_02',
      doctor_name: 'Dr. Vikram Kapoor',
      service_id: 'srv_hair_prp_02',
      service_name: 'PRP Hair Loss Therapy',
      date: today,
      time: '16:00',
      duration: 45,
      status: 'CONFIRMED',
      notes: 'Session 2 of 4 PRP package.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 8. Sample Conversations & Messages
  db.data.conversations = [
    {
      id: 'conv_01',
      clinic_id: clinicId,
      patient_phone: '+919811223344',
      patient_name: 'Rahul Verma',
      lead_id: 'lead_01',
      ai_status: 'ACTIVE', // ACTIVE | PAUSED
      stage: 'CONFIRMATION',
      last_message: 'Your appointment has been confirmed for 2:30 PM with Dr. Ananya Sharma.',
      last_intent: 'APPOINTMENT_BOOKING',
      last_customer_message_at: new Date().toISOString(),
      unread_count: 0,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'conv_02',
      clinic_id: clinicId,
      patient_phone: '+919822334455',
      patient_name: 'Amit Khurana',
      lead_id: 'lead_03',
      ai_status: 'PAUSED', // Staff took over
      stage: 'HANDOFF',
      last_message: 'Main aapko clinic team se connect kar raha hoon.',
      last_intent: 'MEDICAL_QUESTION',
      last_customer_message_at: new Date(Date.now() - 1800000).toISOString(),
      unread_count: 1,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  db.data.messages = [
    {
      id: 'msg_01',
      conversation_id: 'conv_01',
      sender: 'CUSTOMER',
      wa_message_id: 'wamid_sample_001',
      text: 'Hi, I need acne treatment consultation.',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'msg_02',
      conversation_id: 'conv_01',
      sender: 'AI',
      wa_message_id: 'wamid_out_001',
      text: 'Welcome to DermaCare Clinic! We provide specialist dermatologist consultations for acne & breakouts. Would you like to check doctor availability or book an appointment?',
      timestamp: new Date(Date.now() - 1790000).toISOString()
    },
    {
      id: 'msg_03',
      conversation_id: 'conv_02',
      sender: 'CUSTOMER',
      wa_message_id: 'wamid_sample_002',
      text: 'Mere face par red patches aur itching hai, kaunsi hydrocortisone cream lagaun?',
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: 'msg_04',
      conversation_id: 'conv_02',
      sender: 'AI',
      wa_message_id: 'wamid_out_002',
      text: 'Yeh diagnosis aur prescription doctor ke examination par depend karta hai. Main medication advise nahi kar sakta. Main aapko clinic team se connect kar raha hoon.',
      timestamp: new Date(Date.now() - 890000).toISOString()
    }
  ];

  // 9. Sample Human Handoffs
  db.data.handoffs = [
    {
      id: 'handoff_01',
      clinic_id: clinicId,
      conversation_id: 'conv_02',
      patient_name: 'Amit Khurana',
      patient_phone: '+919822334455',
      reason: 'Medical question regarding hydrocortisone cream recommendation',
      status: 'PENDING', // PENDING | ASSIGNED | RESOLVED
      assigned_to: 'user_staff_01',
      created_at: new Date(Date.now() - 900000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 10. WhatsApp Accounts
  db.data.whatsapp_accounts = [
    {
      id: 'wa_acc_01',
      clinic_id: clinicId,
      phone_number_id: '100000000000001',
      display_phone_number: '+91 98765 43210',
      verified_name: 'DermaCare Clinic',
      quality_rating: 'GREEN',
      webhook_verified: true,
      status: 'CONNECTED',
      created_at: new Date().toISOString()
    }
  ];

  // 11. Google Docs Live Sync State
  db.data.google_docs_sync = {
    last_synced_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'SYNCED',
    doc_id: '1_sample_google_doc_id_for_clinic_knowledge_base',
    sheet_id: '1_sample_google_sheet_id_for_live_lead_stream',
    enabled: true,
    extracted_faqs_count: 5,
    last_sync_message: 'Successfully synchronized 5 clinic FAQs and live stream configured.'
  };

  db.save();
  console.log('✅ Seed completed successfully! All dermatology data, doctors, services, FAQs, leads, and appointments ready.');
}

// Run if called directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
