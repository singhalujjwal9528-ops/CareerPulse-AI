# CareerPulse AI – Student Placement Probability Predictor

An interpretable machine learning web application that predicts undergraduate campus recruitment likelihood based on academic performance, aptitude test scores, practical project experience, and training credentials.

---

## 🚀 Live Deployment Links

- **Frontend Application (Vercel):** [https://career-pulse-ai-snowy.vercel.app](https://career-pulse-ai-snowy.vercel.app)
- **Backend API (Render):** [https://careerpulse-ai-jnxl.onrender.com](https://careerpulse-ai-jnxl.onrender.com)
- **Interactive Swagger Docs:** [https://careerpulse-ai-jnxl.onrender.com/docs](https://careerpulse-ai-jnxl.onrender.com/docs)
- **API Health Check:** [https://careerpulse-ai-jnxl.onrender.com/api/health](https://careerpulse-ai-jnxl.onrender.com/api/health)

---

## 📌 Overview

CareerPulse AI is designed to help students and placement cells assess recruitment readiness early. The application uses a trained **Logistic Regression** model coupled with **StandardScaler** to provide probability estimates and status classifications (`Placed` / `Not Placed`). 

It also includes an **automated resume parser** that extracts attributes directly from uploaded PDF resumes or pasted text, pre-filling the prediction form.

---

## 🛠️ Tech Stack

- **Machine Learning:** Python, Scikit-Learn, Pandas, NumPy, Joblib
- **Backend:** FastAPI, Uvicorn, Pydantic, PyPDF
- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Deployment:** Render (Backend), Vercel (Frontend)

---

## 📊 Dataset & Model Performance

- **Dataset Source:** Hugging Face [`Krooz/Campus_Recruitment_CSV`](https://huggingface.co/datasets/Krooz/Campus_Recruitment_CSV) (10,000 verified student records)
- **Target Variable:** `PlacementStatus` (`Placed` – 41.97% / `NotPlaced` – 58.03%)
- **Model Pipeline:** `StandardScaler` + `LogisticRegression`
- **Evaluation Split:** 80% Training / 20% Testing (2,000 test samples)

### Evaluation Metrics
| Metric | Score |
|---|---|
| **Accuracy** | 80.70% |
| **Precision** | 77.59% |
| **Recall** | 75.92% |
| **F1-Score** | 76.75% |

### Confusion Matrix (Test Set: 2,000 samples)
- **True Negatives (TN):** 977
- **False Positives (FP):** 184
- **False Negatives (FN):** 202
- **True Positives (TP):** 637

---

## 🌟 Key Features

1. **Automated Resume Parsing:**
   - Extracts CGPA, 10th/12th percentages, projects, internships, certifications, and soft skill signals from uploaded PDF or text resumes using rule-based NLP and regex matching.
2. **Transparent ML Predictions:**
   - Evaluates all 10 features through learned standardized coefficients, displaying exact placement probabilities and outcome classifications.
3. **Campus Benchmark Dashboard:**
   - Visualizes dataset distributions, historical feature averages, and relative feature weights.
4. **Flexible Inputs:**
   - Supports arbitrary decimal values (e.g. `95.8%`, `9.49` CGPA) with full client-side validation.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns service status and model loaded state |
| `GET` | `/api/stats` | Returns dataset benchmark statistics, distributions, and metrics |
| `POST` | `/api/predict` | Computes placement probability for student feature payload |
| `POST` | `/api/extract-resume` | Multipart upload (PDF/TXT) extracting candidate features |
| `POST` | `/api/extract-resume-text` | JSON payload extracting features from raw resume text |

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/singhalujjwal9528-ops/CareerPulse-AI.git
cd CareerPulse-AI/backend

# Create and activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn main:app --reload --port 8000
```
Backend will be available at `http://127.0.0.1:8000`.

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```text
CareerPulse-AI/
├── backend/
│   ├── main.py                  # FastAPI application & REST endpoints
│   ├── train_model.py           # Training pipeline (StandardScaler + Logistic Regression)
│   ├── resume_parser.py         # NLP & regex parser for resume PDF/text
│   ├── model.pkl                # Serialized model pipeline
│   ├── model_metadata.json      # Dataset stats, metrics, & coefficients
│   ├── campus_recruitment.csv   # Local dataset copy
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Dashboard, Predictor, About, Navbar, Footer
│   │   ├── services/api.ts      # API client communicating with backend
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── App.tsx              # Root component & tab routing
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---


