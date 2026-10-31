export interface StudentInput {
  cgpa: number;
  internships: number;
  projects: number;
  workshops_certifications: number;
  aptitude_test_score: number;
  soft_skills_rating: number;
  extracurricular_activities: "Yes" | "No";
  placement_training: "Yes" | "No";
  ssc_marks: number;
  hsc_marks: number;
}

export interface PredictionResult {
  status: string;
  placement_status: "Placed" | "Not Placed";
  placement_probability: number;
  placement_probability_pct: number;
  confidence_level: string;
  message: string;
}

export interface ConfusionMatrix {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: ConfusionMatrix;
}

export interface FeatureSummaryItem {
  min: number;
  max: number;
  mean: number;
  median: number;
}

export interface DatasetStats {
  dataset_name: string;
  algorithm: string;
  total_records: number;
  placed_count: number;
  not_placed_count: number;
  placement_rate_pct: number;
  features: string[];
  metrics: ModelMetrics;
  coefficients: Record<string, number>;
  intercept: number;
  feature_summary: Record<string, FeatureSummaryItem>;
}

export interface HealthStatus {
  status: string;
  service: string;
  model_loaded: boolean;
  algorithm: string;
}

export interface ResumeExtractionResponse {
  status: string;
  extracted_student: StudentInput;
  evidence: Record<string, string>;
  text_preview: string;
}
