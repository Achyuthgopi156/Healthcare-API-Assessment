import fetch from "node-fetch";

const API_KEY = "ak_3f1ebe08d58ed79f07c47b3ca388a93e346ddb25cd696d7c";
const BASE_URL = "https://assessment.ksensetech.com/api";

// Helper function to fetch with retries for 429/500/503
async function fetchWithRetry(url, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { "x-api-key": API_KEY } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Function to get all patients with pagination
async function fetchAllPatients() {
  let patients = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const data = await fetchWithRetry(`${BASE_URL}/patients?page=${page}&limit=5`);
    patients.push(...data.data);
    hasNext = data.pagination.hasNext;
    page++;
  }

  return patients;
}

// Risk scoring functions
function calculateBPRisk(bp) {
  if (!bp || !bp.includes("/")) return 0;
  const [s, d] = bp.split("/").map(x => parseInt(x));
  if (isNaN(s) || isNaN(d)) return 0;

  if (s < 120 && d < 80) return 1;
  if (s >= 120 && s <= 129 && d < 80) return 2;
  if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) return 3;
  if (s >= 140 || d >= 90) return 4;
  return 0;
}

function calculateTempRisk(temp) {
  const t = parseFloat(temp);
  if (isNaN(t)) return 0;
  if (t <= 99.5) return 0;
  if (t >= 99.6 && t <= 100.9) return 1;
  if (t >= 101) return 2;
  return 0;
}

function calculateAgeRisk(age) {
  const a = parseInt(age);
  if (isNaN(a)) return 0;
  if (a < 40) return 1;
  if (a <= 65) return 1;
  return 2;
}

// Main assessment function
async function runAssessment() {
  const patients = await fetchAllPatients();

  const highRisk = [];
  const fever = [];
  const dataIssues = [];

  for (const p of patients) {
    const bpScore = calculateBPRisk(p.blood_pressure);
    const tempScore = calculateTempRisk(p.temperature);
    const ageScore = calculateAgeRisk(p.age);

    if (bpScore === 0 || tempScore === 0 && p.temperature != 0 || ageScore === 0) {
      dataIssues.push(p.patient_id);
    }

    const total = bpScore + tempScore + ageScore;
    if (total >= 4) highRisk.push(p.patient_id);
    if (parseFloat(p.temperature) >= 99.6) fever.push(p.patient_id);
  }

  console.log("=== Patient Risk Assessment Results ===");
  console.log("High-risk patients:", highRisk);
  console.log("Fever patients:", fever);
  console.log("Data quality issues:", dataIssues);

  const results = { high_risk_patients: highRisk, fever_patients: fever, data_quality_issues: dataIssues };
  const res = await fetch(`${BASE_URL}/submit-assessment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify(results)
  });
  const submission = await res.json();
  console.log(" Submission Response:", submission);
}

runAssessment().catch(err => console.error(err));
