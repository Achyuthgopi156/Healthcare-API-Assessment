# Healthcare-API-Assessment

## Overview

This project is a solution for the **Healthcare API Assessment**. It fetches patient data from a simulated API, calculates patient risk scores, and identifies:

- High-risk patients
- Fever patients
- Data quality issues

The project demonstrates handling **real-world API challenges** like rate-limiting, intermittent failures, and inconsistent data.

---

## Features

- Fetches all patients with pagination
- Retry logic for transient API errors (429, 500, 503)
- Risk scoring based on:
  - Blood Pressure
  - Temperature
  - Age
- Generates alert lists for:
  - High-risk patients (total risk score ≥ 4)
  - Fever patients (temperature ≥ 99.6°F)
  - Data quality issues (missing/invalid data)

---

## Requirements

- Node.js **v18+**
- Internet connection to access the assessment API

---

## Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd Healthcare-API-Assessment
```

