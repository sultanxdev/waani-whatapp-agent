# Medical Safety Guardrails & Non-Diagnostic Triage Policy

## 1. Safety Mandate
In strict accordance with PRD Sections 5, 15, and 16, the system operates under a **Non-Diagnostic Policy**:
- **NEVER diagnose skin diseases.**
- **NEVER prescribe or advise pharmaceutical medicines (steroids, hydrocortisone, antibiotics, tretinoin, isotretinoin).**
- **NEVER attempt independent emergency triage.**

## 2. Safety Classifier Categories
Every patient inquiry is filtered through the Medical Safety Classifier:
1. `BUSINESS_QUESTION`: Pricing, opening hours, directions, doctor qualifications, approved FAQ queries. (Safe for bot answer).
2. `MEDICAL_QUESTION`: Medication questions, symptom diagnosis, treatment requests. (Bot politely explains prescription policy and immediately creates a human handoff alert).
3. `EMERGENCY_SIGNAL`: Acute allergic reactions, breathing difficulties, uncontrollable bleeding. (Bot immediately outputs hospital ER / 112 guidance and raises priority alert).
4. `UNKNOWN`: Grounded fallback without hallucination.

## 3. Human Handoff Triggers
The AI assistant pauses itself and alerts clinic receptionists upon:
- Direct request for human / doctor ("doctor se baat karni hai")
- Medical questions regarding prescriptions
- Emergency signals
- Low confidence / unknown complex inquiries
