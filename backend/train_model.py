"""
CareerPulse AI – Student Placement Probability Predictor
Step 1: Model Training Script (train_model.py)

This script:
1. Loads the campus recruitment dataset (from Hugging Face / local CSV).
2. Performs basic data cleaning and exploratory analysis.
3. Prepares features and maps categorical variables to binary indicators.
4. Splits the dataset into training (80%) and testing (20%) sets.
5. Scales features using StandardScaler and trains a Logistic Regression classifier.
6. Evaluates the model using Accuracy, Precision, Recall, F1-Score, and Confusion Matrix.
7. Saves the trained model pipeline and metadata using Joblib and JSON.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def load_data():
    """
    Load dataset from local CSV if present, otherwise fetch from Hugging Face.
    Dataset: Krooz/Campus_Recruitment_CSV
    """
    csv_path = os.path.join(os.path.dirname(__file__), "campus_recruitment.csv")
    if os.path.exists(csv_path):
        print(f"[1/7] Loading dataset from local cache: {csv_path}")
        df = pd.read_csv(csv_path)
    else:
        print("[1/7] Fetching dataset from Hugging Face (Krooz/Campus_Recruitment_CSV)...")
        from datasets import load_dataset
        ds = load_dataset("Krooz/Campus_Recruitment_CSV")
        df = pd.concat([pd.DataFrame(ds[k]) for k in ds.keys()], ignore_index=True)
        df.to_csv(csv_path, index=False)
        print(f"      Saved local copy to {csv_path}")
    return df

def clean_and_prepare(df):
    """
    Perform basic data cleaning:
    - Check and report missing values.
    - Map binary categorical fields to numeric 0/1.
    - Verify column datatypes.
    """
    print(f"[2/7] Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"      Missing values detected: {df.isnull().sum().sum()}")

    # Fill any missing values if they exist (cleanliness guarantee)
    df = df.dropna().copy()

    # Map categorical binary variables
    # ExtracurricularActivities: 'Yes' -> 1, 'No' -> 0
    # PlacementTraining: 'Yes' -> 1, 'No' -> 0
    # PlacementStatus (Target): 'Placed' -> 1, 'NotPlaced' -> 0
    df["ExtracurricularActivities_Num"] = df["ExtracurricularActivities"].map({"Yes": 1, "No": 0})
    df["PlacementTraining_Num"] = df["PlacementTraining"].map({"Yes": 1, "No": 0})
    df["PlacementStatus_Num"] = df["PlacementStatus"].map({"Placed": 1, "NotPlaced": 0})

    return df

def train():
    # 1. Load data
    df = load_data()

    # 2. Clean and preprocess
    df_clean = clean_and_prepare(df)

    # 3. Define input features and target
    # 10 actual features from the dataset
    features = [
        "CGPA",
        "Internships",
        "Projects",
        "Workshops/Certifications",
        "AptitudeTestScore",
        "SoftSkillsRating",
        "ExtracurricularActivities_Num",
        "PlacementTraining_Num",
        "SSC_Marks",
        "HSC_Marks"
    ]
    target = "PlacementStatus_Num"

    X = df_clean[features]
    y = df_clean[target]

    print(f"[3/7] Selected {len(features)} input features for training:")
    for f in features:
        print(f"      - {f}")

    # 4. Train-test split (80% train, 20% test with stratified sampling)
    print("[4/7] Splitting data: 80% train, 20% test...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"      Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 5. Train Logistic Regression inside a Scikit-Learn Pipeline with StandardScaler
    print("[5/7] Training Logistic Regression model with StandardScaler...")
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=1000, random_state=42))
    ])
    pipeline.fit(X_train, y_train)

    # 6. Model Evaluation
    print("[6/7] Evaluating model performance on test set...")
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"      Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
    print(f"      Precision: {prec:.4f} ({prec*100:.2f}%)")
    print(f"      Recall:    {rec:.4f} ({rec*100:.2f}%)")
    print(f"      F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
    print(f"      Confusion Matrix:\n        TN={cm[0][0]}, FP={cm[0][1]}\n        FN={cm[1][0]}, TP={cm[1][1]}")

    # Feature importances (Logistic Regression coefficients)
    clf = pipeline.named_steps["classifier"]
    coefficients = {
        feat: float(round(coef, 4))
        for feat, coef in zip(features, clf.coef_[0])
    }
    intercept = float(round(clf.intercept_[0], 4))

    # Overall dataset statistics for Frontend Dashboard
    total_students = int(len(df_clean))
    total_placed = int((df_clean["PlacementStatus_Num"] == 1).sum())
    total_not_placed = int((df_clean["PlacementStatus_Num"] == 0).sum())
    placement_rate = float(round((total_placed / total_students) * 100, 2))

    feature_summary = {}
    for col in ["CGPA", "Internships", "Projects", "Workshops/Certifications", "AptitudeTestScore", "SoftSkillsRating", "SSC_Marks", "HSC_Marks"]:
        feature_summary[col] = {
            "min": float(df_clean[col].min()),
            "max": float(df_clean[col].max()),
            "mean": float(round(df_clean[col].mean(), 2)),
            "median": float(df_clean[col].median())
        }

    metadata = {
        "dataset_name": "Krooz/Campus_Recruitment_CSV (Hugging Face)",
        "algorithm": "Logistic Regression with Standard Scaling",
        "total_records": total_students,
        "placed_count": total_placed,
        "not_placed_count": total_not_placed,
        "placement_rate_pct": placement_rate,
        "features": features,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": {
                "tn": cm[0][0],
                "fp": cm[0][1],
                "fn": cm[1][0],
                "tp": cm[1][1]
            }
        },
        "coefficients": coefficients,
        "intercept": intercept,
        "feature_summary": feature_summary
    }

    # 7. Save model and metadata
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    metadata_path = os.path.join(os.path.dirname(__file__), "model_metadata.json")

    print(f"[7/7] Saving model pipeline to: {model_path}")
    joblib.dump(pipeline, model_path)

    print(f"      Saving metadata to: {metadata_path}")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n[SUCCESS] Model trained, evaluated, and saved successfully!")

if __name__ == "__main__":
    train()

