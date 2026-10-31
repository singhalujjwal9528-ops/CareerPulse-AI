# CareerPulse AI – Student Placement Probability Predictor

An interpretable, end-to-end Machine Learning web application designed for academic project evaluation and viva demonstration. The system estimates an undergraduate student's campus placement probability using **Logistic Regression** and **StandardScaler**, trained on historical campus recruitment data from Hugging Face.

---

## 📌 Project Overview

* **Project Title:** CareerPulse AI – Student Placement Probability Predictor
* **Domain:** Educational Data Mining & Machine Learning
* **Primary Algorithm:** Logistic Regression with Standard Feature Scaling
* **Dataset:** Hugging Face – [`Krooz/Campus_Recruitment_CSV`](https://huggingface.co/datasets/Krooz/Campus_Recruitment_CSV) (10,000 student records)
* **Backend:** FastAPI (Python 3)
* **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons (Vite)
* **Model Test Accuracy:** **80.70%** (Stratified 80/20 train-test split)

---

## 🗂️ Project Structure

```text
CareerPulse-AI/
├── backend/
│   ├── main.py                  # FastAPI server with /api/health, /api/predict, /api/stats
│   ├── train_model.py           # Training script for Logistic Regression model
│   ├── model.pkl                # Trained Scikit-Learn pipeline (StandardScaler + LogisticRegression)
│   ├── model_metadata.json      # Dataset summary, confusion matrix, and feature coefficients
│   ├── campus_recruitment.csv   # Local copy of Hugging Face dataset (10,000 rows)
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Navigation header & live API status badge
│   │   │   ├── Dashboard.tsx    # Home page with dataset overview & placement distribution
│   │   │   ├── Predictor.tsx    # Prediction form with input validation & real probabilities
│   │   │   ├── About.tsx        # Comprehensive Viva guide & algorithm explanation
│   │   │   ├── StatCard.tsx     # Clean metric card component
│   │   │   └── Footer.tsx       # Minimalist footer
│   │   ├── services/
│   │   │   └── api.ts           # REST API client for backend
│   │   ├── types.ts             # TypeScript interfaces for inputs, metrics, and responses
│   │   ├── App.tsx              # Main state and tab navigation
│   │   ├── index.css            # Tailwind CSS v4 styling
│   │   └── main.tsx             # React entry point
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration with Tailwind CSS plugin
│   └── index.html               # HTML template
└── README.md                    # Project documentation and run guide
```

---

## 📊 Dataset & Features

The model is trained on **10,000 records** from the `Krooz/Campus_Recruitment_CSV` dataset.

### Input Features (10 Features):
1. **`CGPA`** (Float, 6.5 – 9.1, avg: 7.70): Cumulative Grade Point Average in college.
2. **`Internships`** (Integer, 0 – 2, avg: 1.05): Number of completed professional internships.
3. **`Projects`** (Integer, 0 – 3, avg: 2.03): Number of major academic / technical projects.
4. **`Workshops/Certifications`** (Integer, 0 – 3, avg: 1.01): Professional certifications or workshops attended.
5. **`AptitudeTestScore`** (Integer, 60 – 90, avg: 79.45): Score obtained in the campus placement aptitude test.
6. **`SoftSkillsRating`** (Float, 3.0 – 4.8, avg: 4.32): Evaluated rating for communication and interpersonal skills.
7. **`ExtracurricularActivities`** (Categorical, "Yes" / "No"): Active involvement in college clubs or sports.
8. **`PlacementTraining`** (Categorical, "Yes" / "No"): Completion of institutional placement training.
9. **`SSC_Marks`** (Integer, 55 – 90, avg: 69.16%): 10th standard percentage.
10. **`HSC_Marks`** (Integer, 57 – 88, avg: 74.50%): 12th standard percentage.

### Target Variable:
* **`PlacementStatus`**: Binary target – **`Placed`** (41.97%) or **`NotPlaced`** (58.03%).

---

## 🤖 Machine Learning Workflow

1. **Data Inspection & Cleaning:** Checked for null values (0 missing values), verified column types, and confirmed dataset consistency.
2. **Encoding:** Binary mapping (`Yes` -> 1, `No` -> 0; `Placed` -> 1, `NotPlaced` -> 0).
3. **Stratified Split:** 80% training (8,000 records) and 20% testing (2,000 records) preserving class proportions.
4. **Pipeline with StandardScaler:** Features are normalized using `z = (x - μ) / σ` so that variables with large ranges (like Aptitude score) do not dominate smaller ranges (like CGPA).
5. **Logistic Regression:** Trained with `max_iter=1000` and `random_state=42`.
6. **Persistence:** Saved using `joblib.dump()` as `backend/model.pkl`.

### Model Evaluation Results (on 2,000 unseen test samples):
* **Accuracy:** **80.70%**
* **Precision:** **77.59%**
* **Recall:** **75.92%**
* **F1-Score:** **76.75%**

### Confusion Matrix:
| | Predicted: Not Placed | Predicted: Placed |
|---|---|---|
| **Actual: Not Placed** | **977** (True Negative) | **184** (False Positive) |
| **Actual: Placed** | **202** (False Negative) | **637** (True Positive) |

### Feature Importance (Learned Coefficients):
* **AptitudeTestScore:** `+0.5698` *(Highest positive driver)*
* **PlacementTraining:** `+0.4016`
* **ExtracurricularActivities:** `+0.3448`
* **SSC_Marks:** `+0.2994`
* **SoftSkillsRating:** `+0.2883`
* **CGPA:** `+0.2630`
* **HSC_Marks:** `+0.2270`
* **Projects:** `+0.2137`
* **Workshops/Certifications:** `+0.1278`
* **Internships:** `+0.0003`

---

## 🚀 How to Run Locally

### Prerequisites:
* Python 3.10+ (with pip)
* Node.js 18+ (with npm)

---

### Step 1: Run the Backend

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. (Optional) If you want to re-train the model:
   ```bash
   python train_model.py
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   * Backend will be running at: `http://127.0.0.1:8000`
   * Interactive API docs (Swagger): `http://127.0.0.1:8000/docs`

---

### Step 2: Run the Frontend

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Open your browser at: `http://localhost:5173`

---

## 📄 Resume Parser – NLP Auto-Extraction

CareerPulse AI includes an **Intelligent Document Processing** module that eliminates manual data entry. Upload a student resume (PDF or plain text) to auto-extract all 10 placement features using regex and keyword-based NLP.

### What Gets Extracted:
| Feature | Detection Method |
|---|---|
| `CGPA` | Regex: `CGPA: 8.42 / 10`, `8.42 CGPA`, `GPA: 8.2` |
| `SSC_Marks` (10th) | Regex: `10th: 88%`, `SSC: 84.0%`, `Class X: 88%` |
| `HSC_Marks` (12th) | Regex: `12th: 84%`, `HSC: 82.0%`, `Class XII: 84%` |
| `Internships` | Keyword matching: *Intern, Trainee, SDE Intern* (deduped count) |
| `Projects` | Project section bullet / numbered item counting |
| `Workshops/Certifications` | Keywords: *AWS, Coursera, NPTEL, HackerRank, Workshop* |
| `ExtracurricularActivities` | Keywords: *Hackathon, Club, IEEE, Sports, NSS, Volunteer* |
| `PlacementTraining` | Phrases: *Placement Training, CRT, Mock Interview* |
| `AptitudeTestScore` | Extracted if present, else estimated from CGPA |
| `SoftSkillsRating` | Inferred from leadership keywords: *led, organized, presented* |

### Libraries Used:
* `pypdf` — PDF text extraction from binary file uploads.
* `re` (standard library) — Regular expression pattern matching for structured data.
* `python-multipart` — Enables `multipart/form-data` file uploads in FastAPI.

---

## 🔌 API Endpoints Specification

### 1. `GET /api/health`
Checks whether the backend service is running and the model is loaded in memory.
* **Sample Response:**
  ```json
  {
    "status": "healthy",
    "service": "CareerPulse AI Backend",
    "model_loaded": true,
    "algorithm": "Logistic Regression"
  }
  ```

### 2. `POST /api/predict`
Takes student details and returns the predicted outcome and exact placement probability.
* **Sample Request Body:**
  ```json
  {
    "cgpa": 8.5,
    "internships": 2,
    "projects": 3,
    "workshops_certifications": 2,
    "aptitude_test_score": 85.0,
    "soft_skills_rating": 4.5,
    "extracurricular_activities": "Yes",
    "placement_training": "Yes",
    "ssc_marks": 85.0,
    "hsc_marks": 88.0
  }
  ```
* **Sample Response:**
  ```json
  {
    "status": "success",
    "placement_status": "Placed",
    "placement_probability": 0.873,
    "placement_probability_pct": 87.3,
    "confidence_level": "High Probability",
    "message": "Profile strongly matches historical placement benchmarks."
  }
  ```

### 3. `POST /api/extract-resume`
Upload a student's PDF or TXT resume file and extract all 10 placement features automatically.
* **Request:** `multipart/form-data` with field `file` (`.pdf` or `.txt`)
* **Sample Response:**
  ```json
  {
    "status": "success",
    "extracted_student": {
      "cgpa": 8.54,
      "internships": 2,
      "projects": 3,
      "workshops_certifications": 3,
      "aptitude_test_score": 85.4,
      "soft_skills_rating": 4.4,
      "extracurricular_activities": "Yes",
      "placement_training": "Yes",
      "ssc_marks": 91.5,
      "hsc_marks": 86.0
    },
    "evidence": {
      "cgpa": "Detected: cgpa: 8.54 / 10",
      "ssc_marks": "Detected: 10th (ssc): 91.5%",
      ...
    },
    "text_preview": "Priya Patel\nB.Tech CSE | CGPA: 8.54 / 10..."
  }
  ```

### 4. `POST /api/extract-resume-text`
Same as above but accepts raw pasted resume text in JSON body instead of a file upload.
* **Request Body:** `{ "text": "resume text..." }`

### 5. `GET /api/stats`
Returns the dataset statistics, training split counts, confusion matrix, and feature summaries for the dashboard.

---

## 🎓 Academic Viva Questions & Answers

1. **Why use Logistic Regression instead of complex deep learning models?**
   * *Answer:* For tabular structured recruitment data, Logistic Regression provides calibrated probability scores, avoids overfitting, has full mathematical interpretability via coefficients, and does not require black-box explanations.

2. **How does Logistic Regression output probabilities?**
   * *Answer:* It computes the linear score $z = w^T x + b$ and passes it through the sigmoid function $\sigma(z) = \frac{1}{1 + e^{-z}}$, bounding the output strictly between 0 and 1. If $P \ge 0.50$, the predicted outcome is "Placed".

3. **Why is StandardScaler essential for Logistic Regression?**
   * *Answer:* Features with differing scales (e.g. CGPA is 0–10 while Aptitude score is 0–100) will cause gradient descent to update weights unevenly. StandardScaler standardizes each feature to zero mean and unit variance.

4. **Why is the model loaded once at startup rather than retrained per request?**
   * *Answer:* Retraining on every prediction is computationally wasteful. In standard machine learning production pipelines, models are trained offline and serialized into `model.pkl`. At startup, FastAPI loads the model once, enabling sub-millisecond inference per request.

