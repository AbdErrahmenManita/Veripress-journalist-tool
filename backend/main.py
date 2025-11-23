import os
import hashlib
import json
import logging
import requests
import io
import re
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional

# Image Processing Imports
from PIL import Image, ExifTags, ImageChops, ImageFilter
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# NEW: Hugging Face Transformers (Local Open Source Model)
from transformers import pipeline

from dotenv import load_dotenv
from groq import Groq

from database import get_db_connection, init_db
from models import ClaimRequest, VerificationResponse, Source, ArchiveItem

# --- Configuration ---
load_dotenv() 

# APIs
GOOGLE_FACT_CHECK_KEY = os.getenv("GOOGLE_FACT_CHECK_KEY", "")
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
CLAIMBUSTER_API_KEY = os.getenv("CLAIMBUSTER_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

HIGH_TRUST_DOMAINS = [
    ".gov", ".edu", ".mil", "who.int", "un.org", 
    "reuters.com", "apnews.com", "bloomberg.com", "bbc.com", "bbc.co.uk", 
    "npr.org", "pbs.org", "wsj.com", "nytimes.com", "washingtonpost.com", 
    "nature.com", "sciencemag.org", "nejm.org", 
    "snopes.com", "politifact.com", "factcheck.org", "afp.com"
]

# Initialize Groq Client
client = None
try:
    if GROQ_API_KEY:
        client = Groq(api_key=GROQ_API_KEY)
    else:
        logging.warning("Groq API Key missing. AI features disabled.")
except Exception as e:
    print(f"ERROR: Groq Client Init Failed: {e}")

# --- LOAD OPEN SOURCE AI MODEL (Local CPU) ---
print("Loading Open Source AI Detector (CPU Mode)...")
try:
    # Model: umm-maybe/AI-image-detector (ResNet-50 based)
    ai_image_classifier = pipeline("image-classification", model="umm-maybe/AI-image-detector")
    print("✅ Open Source AI Model Loaded.")
except Exception as e:
    print(f"⚠️ AI Model failed to load: {e}")
    ai_image_classifier = None

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Veripress Journalist Tool API", version="15.2.0-Calibrated")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions ---

def safe_int_score(value: Any) -> int:
    """Nuclear option to force any value into an integer score 0-100."""
    try:
        if isinstance(value, (int, float)):
            return max(0, min(100, int(value)))
        if isinstance(value, str):
            numbers = re.findall(r'\d+', value)
            if numbers:
                return max(0, min(100, int(numbers[0])))
        return 50
    except:
        return 50

def generate_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def calculate_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()

def check_google_fact_check(query: str) -> Optional[Dict[str, Any]]:
    if not GOOGLE_FACT_CHECK_KEY: return None
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {"query": query, "key": GOOGLE_FACT_CHECK_KEY, "languageCode": "en"}
    try:
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "claims" in data and data["claims"]: return data["claims"][0]
    except Exception: pass
    return None

def check_live_web_search(query: str) -> Optional[Dict[str, Any]]:
    if not SERPER_API_KEY: return None
    url = "https://google.serper.dev/search"
    payload = json.dumps({"q": query, "num": 6, "tbs": "qdr:w"}) 
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
    try:
        response = requests.post(url, headers=headers, data=payload, timeout=5)
        if response.status_code == 200: return response.json()
    except Exception: pass
    return None

def check_claimbuster(text: str) -> Optional[Dict[str, Any]]:
    if not CLAIMBUSTER_API_KEY: return None
    url = f"https://api.claimbuster.org/api/v2/score/text/{text}"
    headers = {"x-api-key": CLAIMBUSTER_API_KEY}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200: return response.json()
    except Exception: pass
    return None

def is_trusted_domain(url: str) -> bool:
    if not url: return False
    return any(domain in url.lower() for domain in HIGH_TRUST_DOMAINS)

def analyze_with_ai(claim: str, search_results: List[Dict]) -> Dict[str, Any]:
    if not client:
        return {"verdict": "Unverified", "explanation": "AI unavailable.", "score": 50}

    evidence_lines = []
    for res in search_results:
        source_name = res.get('source', 'Web')
        url = res.get('link', '')
        snippet = res.get('snippet', '')
        date = res.get('date', 'Recent')
        trust_tag = "[HIGH AUTHORITY SOURCE] " if is_trusted_domain(url) else ""
        evidence_lines.append(f"- {trust_tag}{source_name}: {snippet} ({date})")

    context_text = "\n".join(evidence_lines)
    prompt = f"""
    You are a rigorous fact-checker using Llama 3.3.
    Current Date: {datetime.now().strftime("%Y-%m-%d")}
    Claim: "{claim}"
    Evidence: {context_text}
    SCORING RULE: 0-20=FALSE, 40-60=UNVERIFIED, 80-100=TRUE.
    Return JSON: {{ "verdict": string, "explanation": string, "score": number }}
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": "Output JSON only."}, {"role": "user", "content": prompt}],
            temperature=0, response_format={"type": "json_object"} 
        )
        
        content = completion.choices[0].message.content
        if "```" in content:
            content = content.split("```json")[-1].split("```")[0].strip()
            
        result = json.loads(content)
        verdict = result.get("verdict", "").lower()
        
        score = safe_int_score(result.get("score", 50))
        if "false" in verdict and score > 40: score = 10
        elif "true" in verdict and score < 60: score = 90
        
        result["score"] = score
        return result
    except Exception as e:
        return {"verdict": "Error", "explanation": str(e)[:50], "score": 50}

def get_exif_data(image):
    """Safely extract EXIF data converting bytes to strings."""
    exif_data = {}
    try:
        info = image.getexif()
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                if isinstance(value, bytes):
                    try: value = value.decode('utf-8', errors='ignore').strip()
                    except: value = str(value)
                elif not isinstance(value, (str, int, float)):
                    value = str(value)
                if isinstance(value, str):
                    value = value.replace('\x00', '')
                exif_data[decoded] = value
    except Exception as e:
        logging.warning(f"EXIF Error: {e}")
    return exif_data

def generate_forensics_report(logs: Dict[str, Any], score: int, filename: str) -> str:
    if not client: return "AI Copilot unavailable."
    prompt = f"""
    As a Digital Forensics Expert, write a 2-sentence summary for "{filename}".
    Findings:
    - Score: {score}/100
    - AI Detection: {logs['ai_detection']['text']} ({logs['ai_detection']['details']})
    - Provenance: {logs['provenance']['text']}
    
    Explain the score and suggest one next step.
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3, max_tokens=150
        )
        return completion.choices[0].message.content.strip()
    except: return "Analysis summary unavailable."

# --- Endpoints ---

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/verify-claim", response_model=VerificationResponse)
@limiter.limit("10/minute")
def verify_claim(request: Request, body: ClaimRequest):
    claim_text = body.claim_text.strip()
    if not claim_text:
        raise HTTPException(status_code=400, detail="Empty claim.")

    google_result = check_google_fact_check(claim_text)
    live_search = check_live_web_search(claim_text)
    claimbuster_result = check_claimbuster(claim_text)

    sources: List[Source] = []
    raw_search_results = []
    breaking_news_signals = ["dead", "killed", "died", "passed away", "shot", "assassination", "confirmed"]
    has_breaking_news = False

    if live_search and "organic" in live_search:
        for res in live_search["organic"][:6]:
            raw_search_results.append(res)
            snippet = res.get('snippet', '').lower()
            title = res.get('title', '').lower()
            if any(sig in snippet or sig in title for sig in breaking_news_signals):
                has_breaking_news = True
            url = res.get('link', '')
            name = res.get('source', 'Web')
            if is_trusted_domain(url): name = f"✅ {name}"
            sources.append(Source(name=f"Live: {name}", url=url, snippet=res.get('snippet')[:100]+"...", date=res.get('date', 'Recent')))

    fact_check_found = False
    if google_result and "claimReview" in google_result:
        review = google_result["claimReview"][0]
        review_date = review.get("reviewDate")
        is_recent = False
        if review_date:
            try:
                d = datetime.strptime(review_date[:10], "%Y-%m-%d")
                if (datetime.now() - d).days < 90: is_recent = True
            except: pass

        if is_recent and not has_breaking_news:
            publisher = review.get("publisher", {}).get("name", "Unknown")
            rating = review.get("textualRating", "Unknown")
            sources.insert(0, Source(name=f"✅ Fact Check ({publisher})", url=review.get("url"), snippet=f"Rated: {rating}", date=review_date))
            verdict = rating
            explanation = f"Verified by {publisher}: {rating}."
            score = 95 if "true" in rating.lower() else 10
            fact_check_found = True

    if not fact_check_found:
        if raw_search_results:
            ai_analysis = analyze_with_ai(claim_text, raw_search_results)
            verdict = ai_analysis.get("verdict", "Unverified")
            explanation = ai_analysis.get("explanation", "Analysis failed.")
            score = ai_analysis.get("score", 50)
            sources.insert(0, Source(name="🤖 AI Analyst (Llama 3.3)", url="https://groq.com", snippet="Synthesized from live data."))
        else:
            verdict = "Unverified"
            explanation = "No data found."
            score = 50
    
    if claimbuster_result and "results" in claimbuster_result:
        cb_score = claimbuster_result["results"][0]["score"]
        sources.append(Source(name="ClaimBuster", url="https://claimbuster.org", snippet=f"Check-worthiness: {cb_score:.2f}"))

    claim_hash = generate_hash(claim_text)
    timestamp = datetime.utcnow().isoformat()
    
    try:
        conn = get_db_connection()
        c = conn.cursor()
        sources_json = json.dumps([s.model_dump() for s in sources])
        c.execute('''INSERT INTO claims (claim_text, verdict, explanation, sources, credibility_score, hash, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)''', 
                     (claim_text, verdict, explanation, sources_json, score, claim_hash, timestamp))
        claim_id = c.lastrowid
        c.execute('INSERT INTO archive (claim_id, hash, archived_at) VALUES (?, ?, ?)', (claim_id, claim_hash, timestamp))
        conn.commit()
    except Exception as e:
        logging.error(f"DB Error: {e}")
    finally:
        conn.close()
    
    return VerificationResponse(
        verdict=verdict,
        explanation=explanation,
        sources=sources,
        credibility_score=score,
        hash=claim_hash,
        created_at=timestamp
    )

# 2. 5-LAYER FORENSICS + OPEN SOURCE AI MODEL
@app.post("/scan-image")
async def scan_image(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        image = Image.open(io.BytesIO(content_bytes))
        
        # Layer 1: Provenance
        file_hash = calculate_image_hash(content_bytes)
        provenance_log = {"status": "neutral", "label": "Provenance", "text": "Hash generated.", "details": f"SHA-256: {file_hash[:16]}..."}

        # Layer 2: Metadata
        exif = get_exif_data(image)
        metadata_log = {"status": "warning", "label": "Metadata", "text": "Missing EXIF.", "details": f"Format: {image.format}. Likely stripped."}
        
        # Layer 3: Forensics
        try:
            gray = image.convert('L')
            edges = gray.filter(ImageFilter.FIND_EDGES)
            edge_hist = edges.histogram()
            noise_level = float(np.var(edge_hist)) if edge_hist else 0.0
        except: noise_level = 0.0
        
        forensics_log = {"status": "success", "label": "Forensics", "text": "Noise Analyzed.", "details": f"Noise Variance: {int(noise_level)}"}

        # Layer 4: Context
        date_original = exif.get("DateTimeOriginal")
        context_log = {"status": "neutral", "label": "Context", "text": "No Timeline.", "details": "No timestamp found."}
        if date_original:
            context_log = {"status": "success", "label": "Context", "text": "Consistent.", "details": f"Date: {date_original}"}

        # --- LAYER 5: CALIBRATED AI DETECTION ---
        ai_score = 0
        ai_label = "No AI Pattern"
        
        if ai_image_classifier:
            try:
                predictions = ai_image_classifier(image)
                
                # Find specific 'artificial' or 'fake' score (More accurate than top_prediction)
                for p in predictions:
                    if p['label'].lower() in ['artificial', 'ai', 'generated', 'fake']:
                        ai_score = p['score'] * 100
                        break
                
                if ai_score > 80:
                    ai_label = "AI Generated"
                elif ai_score > 50:
                     ai_label = "Suspicious"
                else:
                    ai_label = "Authentic"

            except Exception as e:
                logging.error(f"Local AI Model Error: {e}")
                ai_label = "AI Check Failed"

        ai_log = {
            "status": "danger" if ai_score > 80 else "success",
            "label": "AI Detection",
            "text": f"{ai_label}",
            "details": f"AI Confidence: {int(ai_score)}%"
        }

        # --- FINAL SCORING LOGIC ---
        final_score = 50
        verdict = "Unverified"

        # 1. Priority: Camera Metadata (If present, trust it unless AI is 99% sure)
        has_camera_data = bool(exif.get("Model") or exif.get("Make"))
        
        if has_camera_data:
            if ai_score > 98: # Only override metadata if AI is absolutely certain
                final_score = 10
                verdict = "Metadata Spoofed"
                metadata_log["status"] = "danger" 
            else:
                final_score = 95
                verdict = "Authentic"
                metadata_log = {"status": "success", "label": "Metadata", "text": "Verified Camera", "details": f"Source: {exif.get('Model', 'Unknown')}"}
        
        # 2. If no metadata, rely on AI score
        else:
            if ai_score > 80: # Threshold raised to avoid false positives on real photos
                final_score = max(0, 100 - int(ai_score))
                verdict = "AI Generated"
            elif ai_score > 50:
                final_score = 40
                verdict = "Suspicious"
            else:
                final_score = 80
                verdict = "Web / Authentic"

        logs = {
            "provenance": provenance_log,
            "metadata": metadata_log,
            "forensics": forensics_log,
            "ai_detection": ai_log,
            "context": context_log,
            "credibility": {
                "status": "success" if final_score > 80 else ("danger" if final_score < 40 else "warning"),
                "label": "Credibility",
                "text": f"{final_score}/100",
                "details": "Forensic Verification Score"
            }
        }

        ai_summary = generate_forensics_report(logs, final_score, file.filename)

        return {
            "score": final_score,
            "verdict": verdict,
            "layers": logs,
            "ai_summary": ai_summary,
            "filename": file.filename
        }

    except Exception as e:
        logging.error(f"Scan Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/archive", response_model=List[ArchiveItem])
def get_archive():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM claims ORDER BY created_at DESC LIMIT 50')
    rows = c.fetchall()
    conn.close()
    archive = []
    for row in rows:
        sources_data = json.loads(row["sources"]) if row["sources"] else []
        sources_objs = [Source(**s) for s in sources_data]
        archive.append(ArchiveItem(
            id=row["id"], claim_text=row["claim_text"], verdict=row["verdict"],
            explanation=row["explanation"], sources=sources_objs,
            credibility_score=row["credibility_score"], hash=row["hash"], created_at=row["created_at"]
        ))
    return archive