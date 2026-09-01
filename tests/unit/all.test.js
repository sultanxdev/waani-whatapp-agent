import assert from 'assert';
import { detectIntent, INTENTS } from '../../apps/api/src/ai/intents.js';
import { classifySafety, SAFETY_CATEGORIES } from '../../apps/api/src/ai/safety.js';
import { AppointmentService } from '../../apps/api/src/services/appointmentService.js';
import { ConversationEngine } from '../../apps/api/src/ai/engine.js';
import { GoogleDocsSyncService } from '../../apps/api/src/services/googleDocsSyncService.js';
import db from '../../apps/api/src/database/db.js';
import { seedDatabase } from '../../apps/api/src/database/seed.js';

async function runTests() {
  console.log('🧪 Starting Dermatology WhatsApp AI System Test Suite...\n');
  seedDatabase();

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  console.log('--- 1. Intent Detection Tests ---');
  test('Detects GREETING intent', () => {
    assert.strictEqual(detectIntent('Hi, good morning'), INTENTS.GREETING);
    assert.strictEqual(detectIntent('Namaste'), INTENTS.GREETING);
  });

  test('Detects PRICE_INFORMATION in Hindi and English', () => {
    assert.strictEqual(detectIntent('Consultation fee kitna hai?'), INTENTS.PRICE_INFORMATION);
    assert.strictEqual(detectIntent('What is the cost of PRP hair treatment?'), INTENTS.PRICE_INFORMATION);
  });

  test('Detects MEDICAL_QUESTION for prescription requests', () => {
    assert.strictEqual(detectIntent('Mere acne ke liye kaunsi cream use karu?'), INTENTS.MEDICAL_QUESTION);
    assert.strictEqual(detectIntent('Can you prescribe hydrocortisone steroid?'), INTENTS.MEDICAL_QUESTION);
  });

  test('Detects EMERGENCY_SIGNAL', () => {
    assert.strictEqual(detectIntent('Emergency! severe allergic reaction and throat swelling'), INTENTS.EMERGENCY_SIGNAL);
  });

  test('Detects HUMAN_REQUEST', () => {
    assert.strictEqual(detectIntent('Mujhe doctor se baat karni hai'), INTENTS.HUMAN_REQUEST);
    assert.strictEqual(detectIntent('Please connect me to a human receptionist'), INTENTS.HUMAN_REQUEST);
  });

  console.log('\n--- 2. Medical Safety Layer & Non-Diagnostic Guardrails ---');
  test('Medical questions are flagged as unsafe for bot diagnosis and require handoff', () => {
    const res = classifySafety('Kaunsi medicine lu acne ke liye?');
    assert.strictEqual(res.category, SAFETY_CATEGORIES.MEDICAL_QUESTION);
    assert.strictEqual(res.requiresHandoff, true);
    assert.strictEqual(res.isSafeForBotAnswer, false);
  });

  test('Emergency queries trigger emergency protocol', () => {
    const res = classifySafety('Severe allergic reaction, cannot breathe');
    assert.strictEqual(res.category, SAFETY_CATEGORIES.EMERGENCY_SIGNAL);
    assert.strictEqual(res.requiresHandoff, true);
  });

  test('Administrative price queries are safe for bot answer', () => {
    const res = classifySafety('What are clinic timings and consultation charges?');
    assert.strictEqual(res.category, SAFETY_CATEGORIES.BUSINESS_QUESTION);
    assert.strictEqual(res.isSafeForBotAnswer, true);
    assert.strictEqual(res.requiresHandoff, false);
  });

  console.log('\n--- 3. Deterministic Slot Generation & Working Hours ---');
  test('Slots are generated within working hours and exclude lunch break', () => {
    const slots = AppointmentService.getAvailableSlots({ date: '2026-09-07' });
    assert(slots.length > 0, 'Should generate slots');
    const hasLunchSlot = slots.some((s) => s.time === '13:30' || s.time === '14:00');
    assert.strictEqual(hasLunchSlot, false, 'Lunch break 13:30-14:30 must be excluded');
  });

  console.log('\n--- 4. Atomic Booking & Double-Booking Prevention ---');
  await asyncTest('Prevents double-booking for the same doctor and slot', async () => {
    const date = '2026-09-15';
    const time = '11:30';

    // First booking must succeed
    const res1 = await AppointmentService.bookAppointment({
      patient_name: 'Patient One',
      patient_phone: '+919999000001',
      date,
      time,
      doctor_id: 'doc_ananya_01'
    });
    assert(res1.appointment.id, 'First booking should succeed');

    // Second booking for identical slot must throw error
    let threw = false;
    try {
      await AppointmentService.bookAppointment({
        patient_name: 'Patient Two',
        patient_phone: '+919999000002',
        date,
        time,
        doctor_id: 'doc_ananya_01'
      });
    } catch (err) {
      threw = true;
      assert(err.message.includes('no longer available'), 'Should reject conflicting slot');
    }
    assert.strictEqual(threw, true, 'Double-booking must be blocked');
  });

  console.log('\n--- 5. Conversation Engine & Human Handoff Workflow ---');
  await asyncTest('Medical query generates safe non-diagnostic message and creates pending handoff', async () => {
    const phone = '+919888777666';
    const result = await ConversationEngine.processMessage({
      patient_phone: phone,
      patient_name: 'Test Patient',
      message_text: 'Mere face par red rash hai kaunsi steroid cream lagau?'
    });

    assert.strictEqual(result.intent, INTENTS.MEDICAL_QUESTION);
    assert.strictEqual(result.stage, 'HANDOFF');
    assert(result.response_text.includes('examination') || result.response_text.includes('doctor'));

    const conv = db.findOne('conversations', (c) => c.patient_phone === phone);
    assert.strictEqual(conv.ai_status, 'PAUSED', 'AI should be paused on handoff');

    const handoff = db.findOne('handoffs', (h) => h.conversation_id === conv.id);
    assert(handoff, 'Handoff record must be created');
  });

  console.log('\n--- 6. Google Docs Integration & Toggle Flag ---');
  test('Google Docs sync can be dynamically toggled and reports correct status', () => {
    GoogleDocsSyncService.setEnabled(true);
    let status = GoogleDocsSyncService.getStatus();
    assert.strictEqual(status.enabled, true);

    GoogleDocsSyncService.setEnabled(false);
    status = GoogleDocsSyncService.getStatus();
    assert.strictEqual(status.enabled, false);

    GoogleDocsSyncService.setEnabled(true);
  });

  await asyncTest('Syncs knowledge base from Google Doc when enabled', async () => {
    const syncRes = await GoogleDocsSyncService.syncKnowledgeFromDoc({ docId: 'test_doc_123' });
    assert.strictEqual(syncRes.success, true);
    assert(syncRes.extracted_count > 0);
  });

  console.log(`\n====================================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
