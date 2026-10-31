import sys, json, urllib.request, time, threading
sys.path.append('backend')

import uvicorn
from main import app

server = uvicorn.Server(uvicorn.Config(app, host='127.0.0.1', port=8000, log_level='error'))
t = threading.Thread(target=server.run, daemon=True)
t.start()
time.sleep(2)

try:
    # 1. Health check
    r = urllib.request.urlopen('http://127.0.0.1:8000/api/health')
    h = json.loads(r.read())
    print('HEALTH:', h['status'], '| model_loaded:', h['model_loaded'])

    # 2. Extract text resume
    resume_text = """
    B.Tech Computer Science | CGPA: 8.65 / 10
    10th (SSC): 91.5%  |  12th (HSC): 86.0%
    Internships: SDE Intern at TechCorp, ML Intern at DataLabs
    Projects: 1. ChatBot AI  2. Resume Parser  3. Smart Attendance
    Certifications: AWS Certified, Coursera ML Specialization, NPTEL Workshop
    Extracurricular: Hackathon Winner, Coding Club Lead
    """
    payload = json.dumps({'text': resume_text}).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/extract-resume-text',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    r = urllib.request.urlopen(req)
    ext = json.loads(r.read())
    print('\nEXTRACT RESUME:')
    for k, v in ext['extracted_student'].items():
        print(f'  {k:28s}: {v}')

    # 3. Predict using extracted data
    pred_payload = json.dumps(ext['extracted_student']).encode()
    req2 = urllib.request.Request(
        'http://127.0.0.1:8000/api/predict',
        data=pred_payload,
        headers={'Content-Type': 'application/json'}
    )
    r2 = urllib.request.urlopen(req2)
    pred = json.loads(r2.read())
    status = pred['placement_status']
    prob = pred['placement_probability_pct']
    conf = pred['confidence_level']
    print(f'\nPREDICT: {status} | Probability: {prob}% | {conf}')
    print('\nALL ENDPOINTS WORKING OK')

finally:
    server.should_exit = True
    time.sleep(1)

