"""
CareerPulse AI – Student Placement Probability Predictor
FastAPI Backend (main.py)

Endpoints:
- GET /api/health: Check API status and model loaded state.
- POST /api/predict: Predict placement probability and status for a student.
- GET /api/stats: Return dataset overview, metrics, and distribution for dashboard.
- POST /api/extract-resume: Extract candidate attributes from an uploaded PDF or pasted text.
"""

import os
import json
from contextlib import asynccontextmanager
from typing import Optional, Literal, Dict, Any

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from resume_parser import parse_resume_text, extract_text_from_pdf

# Global state to hold loaded model and metadata
model_pipeline = None
model_metadata = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the trained model and metadata once when the backend starts up.
    This avoids retraining or reloading on every request.
    """
    global model_pipeline, model_metadata
    base_dir = os.path.dirname(__file__)
    model_path = os.path.join(base_dir, "model.pkl")
    metadata_path = os.path.join(base_dir, "model_metadata.json")

    if not os.path.exists(model_path):
        raise RuntimeError(f"Trained model not found at {model_path}. Please run train_model.py first.")

    print(f"Loading trained model from {model_path}...")
    model_pipeline = joblib.load(model_path)

    if os.path.exists(metadata_path):
        with open(metadata_path, "r") as f:
            model_metadata = json.load(f)
        print("Model metadata loaded successfully.")
    else:
        model_metadata = {}

    yield

    print("Shutting down CareerPulse AI backend...")

app = FastAPI(
    title="CareerPulse AI – Student Placement API",
    description="Machine Learning backend using Logistic Regression to predict student placement probability.",
    version="1.1.0",
    lifespan=lifespan
)

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentPredictionInput(BaseModel):
    """
    Input schema with validation for the 10 actual features of the Campus Recruitment dataset.
    """
    cgpa: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="College Cumulative Grade Point Average (0.0 - 10.0)",
        examples=[8.2]
    )
    internships: int = Field(
        ...,
        ge=0,
        le=10,
        description="Number of internships completed (e.g. 0 to 3)",
        examples=[1]
    )
    projects: int = Field(
        ...,
        ge=0,
        le=20,
        description="Number of academic / personal projects completed",
        examples=[2]
    )
    workshops_certifications: int = Field(
        ...,
        ge=0,
        le=20,
        description="Number of technical workshops attended or certifications earned",
        examples=[1]
    )
    aptitude_test_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Score obtained in general placement aptitude test (0 - 100)",
        examples=[82.0]
    )
    soft_skills_rating: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Rating of communication and soft skills (1.0 - 5.0)",
        examples=[4.5]
    )
    extracurricular_activities: Literal["Yes", "No"] = Field(
        ...,
        description="Participation in extracurricular activities ('Yes' or 'No')",
        examples=["Yes"]
    )
    placement_training: Literal["Yes", "No"] = Field(
        ...,
        description="Whether the student completed college placement training ('Yes' or 'No')",
        examples=["Yes"]
    )
    ssc_marks: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="10th Standard / SSC percentage (0 - 100)",
        examples=[78.0]
    )
    hsc_marks: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="12th Standard / HSC percentage (0 - 100)",
        examples=[82.0]
    )

class PredictionOutput(BaseModel):
    status: str
    placement_status: Literal["Placed", "Not Placed"]
    placement_probability: float
    placement_probability_pct: float
    confidence_level: str
    message: str

class ResumeTextInput(BaseModel):
    text: str

class ResumeExtractionResponse(BaseModel):
    status: str
    extracted_student: Dict[str, Any]
    evidence: Dict[str, str]
    text_preview: str

@app.get("/")
def root():
    """
    Root landing endpoint.
    """
    return {
        "project": "CareerPulse AI – Student Placement Probability Predictor",
        "status": "online",
        "documentation": "/docs",
        "health_check": "/api/health",
        "frontend": "https://career-pulse-ai-snowy.vercel.app"
    }

@app.get("/api/health")
def health_check():
    """
    Check whether the backend is running and the model is loaded into memory.
    """
    return {
        "status": "healthy",
        "service": "CareerPulse AI Backend",
        "model_loaded": model_pipeline is not None,
        "algorithm": "Logistic Regression"
    }

@app.get("/api/stats")
def get_dataset_stats():
    """
    Return dataset overview, statistics, and model performance metrics
    derived directly from the Krooz/Campus_Recruitment_CSV dataset.
    """
    if model_metadata is None:
        raise HTTPException(status_code=500, detail="Metadata not loaded.")
    return model_metadata

@app.post("/api/predict", response_model=PredictionOutput)
def predict_placement(student: StudentPredictionInput):
    """
    Receive student details and return the Logistic Regression placement prediction.
    Features are scaled and fed into the model pipeline.
    """
    if model_pipeline is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")

    try:
        # Convert inputs to numerical format matching training features
        # 1. ExtracurricularActivities: 'Yes' -> 1, 'No' -> 0
        extra_curr_num = 1 if student.extracurricular_activities == "Yes" else 0
        # 2. PlacementTraining: 'Yes' -> 1, 'No' -> 0
        training_num = 1 if student.placement_training == "Yes" else 0

        # DataFrame matching the exact feature names used in training
        input_data = pd.DataFrame([{
            "CGPA": student.cgpa,
            "Internships": student.internships,
            "Projects": student.projects,
            "Workshops/Certifications": student.workshops_certifications,
            "AptitudeTestScore": student.aptitude_test_score,
            "SoftSkillsRating": student.soft_skills_rating,
            "ExtracurricularActivities_Num": extra_curr_num,
            "PlacementTraining_Num": training_num,
            "SSC_Marks": student.ssc_marks,
            "HSC_Marks": student.hsc_marks
        }])

        # Logistic Regression probability output: [P(NotPlaced), P(Placed)]
        probabilities = model_pipeline.predict_proba(input_data)[0]
        prob_not_placed = float(probabilities[0])
        prob_placed = float(probabilities[1])

        # Standard decision threshold is 0.50
        predicted_class = int(model_pipeline.predict(input_data)[0])
        outcome = "Placed" if predicted_class == 1 else "Not Placed"

        prob_pct = round(prob_placed * 100, 2)

        if prob_placed >= 0.70:
            confidence = "High Probability"
            message = "Profile strongly matches historical placement benchmarks."
        elif prob_placed >= 0.50:
            confidence = "Moderate Probability"
            message = "Profile meets baseline criteria with positive placement likelihood."
        else:
            confidence = "Needs Improvement"
            message = "Profile currently falls below placement cutoffs in key areas."

        return PredictionOutput(
            status="success",
            placement_status=outcome,
            placement_probability=round(prob_placed, 4),
            placement_probability_pct=prob_pct,
            confidence_level=confidence,
            message=message
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@app.post("/api/extract-resume", response_model=ResumeExtractionResponse)
async def extract_resume_file(file: UploadFile = File(...)):
    """
    Extract candidate attributes from an uploaded PDF or plain text resume file.
    """
    try:
        contents = await file.read()
        filename = (file.filename or "").lower()

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        else:
            # Assume text/plain
            text = contents.decode("utf-8", errors="ignore")

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract readable text from the uploaded file.")

        result = parse_resume_text(text)
        return ResumeExtractionResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Resume extraction failed: {str(e)}")

@app.post("/api/extract-resume-text", response_model=ResumeExtractionResponse)
def extract_resume_raw_text(payload: ResumeTextInput):
    """
    Extract candidate attributes from pasted resume text.
    """
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Provided resume text is empty.")

    try:
        result = parse_resume_text(payload.text)
        return ResumeExtractionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Resume extraction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
