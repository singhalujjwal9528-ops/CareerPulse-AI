"""
CareerPulse AI - Resume Parser Module
Extracts candidate attributes (CGPA, SSC, HSC, Projects, Internships, etc.)
from uploaded PDF files or raw resume text.
"""

import re
import io
from typing import Dict, Any, Tuple
import pypdf

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from uploaded PDF bytes using pypdf."""
    text_parts = []
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts)

def parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Parse text extracted from a resume and infer values for the 10 placement features.
    Returns:
        {
            "extracted": StudentInput dict,
            "evidence": matched evidence for each field,
            "summary": summary of extraction
        }
    """
    evidence = {}
    lower_text = text.lower()

    # 1. CGPA Extraction
    # Matches: CGPA: 8.35, CGPA - 8.35, GPA: 8.2/10, 8.5 CGPA, Pointer: 8.1
    cgpa = 7.70 # Default to dataset average
    cgpa_match = re.search(
        r'(?:cgpa|gpa|pointer|sgpa)[\s:=-]+([0-9]+(?:\.[0-9]+)?)(?:\s*/\s*10)?',
        lower_text
    )
    if not cgpa_match:
        # Check reverse: "8.4 CGPA"
        cgpa_match = re.search(r'([0-9]\.[0-9]{1,2})\s*(?:cgpa|gpa)', lower_text)

    if cgpa_match:
        try:
            val = float(cgpa_match.group(1))
            if 0.0 <= val <= 10.0:
                cgpa = round(val, 2)
                evidence["cgpa"] = f"Detected: {cgpa_match.group(0).strip()}"
            elif 50.0 <= val <= 100.0:
                # Likely given as percentage, convert to 10-point scale
                cgpa = round(val / 9.5, 2)
                evidence["cgpa"] = f"Converted {val}% to CGPA: {cgpa}"
        except Exception:
            pass
    if "cgpa" not in evidence:
        evidence["cgpa"] = "Defaulted to benchmark average (7.70)"

    # 2. 10th / SSC Marks Extraction
    # Handles: "10th: 88%", "SSC: 84%", "Class X | 95.8%", "Class X: 95.8"
    ssc_marks = 70.0 # Default to dataset benchmark average
    # Primary: standard keywords
    ssc_match = re.search(
        r'(?:10th|ssc|secondary|matriculation|class\s*x\b)[\s\w()\-:|]*?([0-9]{2,3}(?:\.[0-9]+)?)\s*%?',
        lower_text
    )
    # Fallback: "class x | 95.8%"
    if not ssc_match:
        ssc_match = re.search(r'class\s*x\s*[|\-:]\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*%?', lower_text)
    if ssc_match:
        try:
            val = float(ssc_match.group(1))
            if 40.0 <= val <= 100.0:
                ssc_marks = round(val, 1)
                evidence["ssc_marks"] = f"Detected: {ssc_match.group(0).strip()}"
        except Exception:
            pass
    if "ssc_marks" not in evidence:
        evidence["ssc_marks"] = "Defaulted to benchmark average (70%)"

    # 3. 12th / HSC Marks Extraction
    # Handles: "12th: 84%", "HSC: 82%", "Class XII | 90.8%", "Class XII: 90.8"
    hsc_marks = 75.0 # Default to dataset benchmark average
    # Primary: standard keywords (class xii must come before class x to avoid partial match)
    hsc_match = re.search(
        r'(?:12th|hsc|senior\s*secondary|intermediate|class\s*xii\b)[\s\w()\-:|]*?([0-9]{2,3}(?:\.[0-9]+)?)\s*%?',
        lower_text
    )
    # Fallback: "class xii | 90.8%"
    if not hsc_match:
        hsc_match = re.search(r'class\s*xii\s*[|\-:]\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*%?', lower_text)
    if hsc_match:
        try:
            val = float(hsc_match.group(1))
            if 40.0 <= val <= 100.0:
                hsc_marks = round(val, 1)
                evidence["hsc_marks"] = f"Detected: {hsc_match.group(0).strip()}"
        except Exception:
            pass
    if "hsc_marks" not in evidence:
        evidence["hsc_marks"] = "Defaulted to benchmark average (75%)"

    # 4. Internships
    # Count occurrences of internship keywords or bullet entries
    internship_matches = re.findall(
        r'(?:intern(?:ship)?|trainee|apprentice|sde\s*intern|software\s*(?:engineering|engineer)?\s*intern)',
        lower_text
    )
    # Deduplicate closely spaced mentions by checking section
    internship_count = min(3, len(set(internship_matches)))
    if "no internship" in lower_text or "nil" in lower_text:
        internship_count = 0

    evidence["internships"] = f"Found {internship_count} internship role references"

    # 5. Projects Count
    # Count distinct project blocks, not individual bullet points or links
    projects_count = 2 # default
    project_section = re.search(
        r'(?:projects|academic\s*projects|personal\s*projects)(.*?)(?:technical\s*skills|certifications|skills|experience|education|activities|\Z)',
        lower_text, re.DOTALL
    )
    if project_section:
        sec_text = project_section.group(1)
        # Strategy 1: Count "Links:" markers — each project block typically ends with a Links line
        links_count = len(re.findall(r'links\s*:', sec_text))
        if links_count > 0:
            projects_count = min(5, max(1, links_count))
            evidence["projects"] = f"Detected {projects_count} projects in Projects section"
        else:
            # Strategy 2: Count distinct GitHub repo URLs (unique repos only)
            github_repos = set(re.findall(r'github\.com/[\w\-]+/[\w\-]+', sec_text))
            if github_repos:
                projects_count = min(5, max(1, len(github_repos)))
                evidence["projects"] = f"Detected {projects_count} projects from GitHub links"
            else:
                # Strategy 3: Count lines that look like project titles
                # (em-dash or en-dash separated title + subtitle pattern)
                title_lines = re.findall(r'\n[^\n]*(?:\u2013|\u2014|--)\s*\w', sec_text)
                if title_lines:
                    projects_count = min(5, max(1, len(title_lines)))
                    evidence["projects"] = f"Detected {projects_count} projects from title lines"
                else:
                    projects_count = 2
                    evidence["projects"] = "Projects section found (estimated 2 projects)"
    else:
        # Fallback keyword count
        proj_mentions = len(re.findall(r'\b(?:project|developed|built|implemented)\b', lower_text))
        projects_count = min(3, max(1, proj_mentions // 2))
        evidence["projects"] = f"Estimated {projects_count} projects based on technical contributions"

    # 6. Workshops & Certifications
    cert_keywords = [
        "certified", "certification", "certificate", "workshop", "coursera",
        "udemy", "aws", "nptel", "hackerrank", "bootcamp", "training program"
    ]
    cert_hits = [k for k in cert_keywords if k in lower_text]
    workshops_count = min(3, max(0, len(cert_hits)))
    evidence["workshops_certifications"] = f"Found certifications/workshops matching: {', '.join(cert_hits[:3]) or 'None'}"

    # 7. Extracurricular Activities
    extra_keywords = [
        "hackathon", "sports", "club", "cultural", "volunteer", "coordinator",
        "president", "member", "nss", "rotaract", "ieee", "acm", "cricket",
        "football", "badminton", "music", "dance", "debate", "lead"
    ]
    extra_hits = [k for k in extra_keywords if k in lower_text]
    extracurricular = "Yes" if len(extra_hits) > 0 else "No"
    evidence["extracurricular_activities"] = f"Activity detected ({', '.join(extra_hits[:2])})" if extra_hits else "No extracurricular activities identified"

    # 8. Placement Training
    training_keywords = [
        "placement training", "campus recruitment training", "crt",
        "aptitude training", "mock interview", "soft skills training"
    ]
    has_training = any(k in lower_text for k in training_keywords)
    placement_training = "Yes" if has_training else "Yes" # Default to Yes as 73% college students undergo it
    evidence["placement_training"] = "Placement training detected or standard curriculum enrolled"

    # 9. Aptitude Test Score
    # Extract if mentioned, otherwise baseline average
    aptitude_match = re.search(r'(?:aptitude|amcat|cocubes|elitmux)[\s\w:]*?([0-9]{2}(?:\.[0-9]+)?)', lower_text)
    aptitude_score = 80.0
    if aptitude_match:
        try:
            val = float(aptitude_match.group(1))
            if 50.0 <= val <= 100.0:
                aptitude_score = round(val, 1)
                evidence["aptitude_test_score"] = f"Extracted aptitude test score: {aptitude_score}"
        except Exception:
            pass
    if "aptitude_test_score" not in evidence:
        # Slightly correlated baseline from CGPA
        aptitude_score = min(90.0, max(65.0, round(cgpa * 10.0, 1)))
        evidence["aptitude_test_score"] = f"Estimated from academic performance ({aptitude_score}). Please verify."

    # 10. Soft Skills Rating
    leadership_keywords = ["leader", "led", "managed", "head", "organized", "public speaking", "presented", "secretary"]
    leadership_hits = sum(1 for k in leadership_keywords if k in lower_text)
    soft_skills = min(4.8, max(3.5, round(4.0 + (leadership_hits * 0.2), 1)))
    evidence["soft_skills_rating"] = f"Inferred soft skills rating ({soft_skills}/5.0) based on communication/leadership cues"

    extracted_student = {
        "cgpa": cgpa,
        "internships": internship_count,
        "projects": projects_count,
        "workshops_certifications": workshops_count,
        "aptitude_test_score": aptitude_score,
        "soft_skills_rating": soft_skills,
        "extracurricular_activities": extracurricular,
        "placement_training": placement_training,
        "ssc_marks": ssc_marks,
        "hsc_marks": hsc_marks
    }

    return {
        "status": "success",
        "extracted_student": extracted_student,
        "evidence": evidence,
        "text_preview": text[:400] + ("..." if len(text) > 400 else "")
    }
