import os
import hashlib
import json
import logging
import io
import requests
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional

# Image Processing
from PIL import Image, ExifTags, ImageFilter
# Document Processing
from pypdf import PdfReader
from docx import Document

from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Hugging Face Cloud Client
from huggingface_hub import InferenceClient

from dotenv import load_dotenv
from groq import Groq

from database import get_db_connection, init_db
from models import ClaimRequest, VerificationResponse, Source, ArchiveItem

# --- Configuration ---
load_dotenv() 

GOOGLE_FACT_CHECK_KEY = os.getenv("GOOGLE_FACT_CHECK_KEY", "")
SERPER_API_KEY = os.getenv("SERPER_API_KEY", "")
CLAIMBUSTER_API_KEY = os.getenv("CLAIMBUSTER_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
HF_API_KEY = os.getenv("HF_API_KEY", "") 

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
except Exception as e:
    print(f"ERROR: Groq Client Init Failed: {e}")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Veripress Journalist Tool API", version="20.0.0-Doc-Archive")

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
def generate_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def calculate_file_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def get_exif_data(image):
    exif_data = {}
    try:
        info = image.getexif()
        if info:
            for tag, value in info.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                if isinstance(value, bytes):
                    try: value = value.decode()
                    except: value = str(value)
                exif_data[decoded] = str(value)
    except: pass
    return exif_data

# --- NEW: ARCHIVE TRACING (Wayback Machine) ---
def check_wayback_machine(url: str):
    api_url = f"http://archive.org/wayback/available?url={url}"
    try:
        response = requests.get(api_url, timeout=10)
        data = response.json()
        if "archived_snapshots" in data and "closest" in data["archived_snapshots"]:
            snapshot = data["archived_snapshots"]["closest"]
            return {
                "status": "found",
                "url": snapshot["url"],
                "timestamp": snapshot["timestamp"],
                "available": True
            }
        return {"status": "not_found", "available": False}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# --- NEW: AI DOCUMENT SUMMARY ---
def generate_doc_analysis(meta: Dict, text_preview: str, filename: str) -> str:
    if not client: return "AI Analysis unavailable."
    prompt = f"""
    Analyze this document metadata for "{filename}".
    Metadata: {json.dumps(meta)}
    Text Preview: "{text_preview[:200]}..."
    
    Task:
    1. Is the metadata suspicious? (e.g. generic Author "User" vs official name).
    2. Does the text preview look like a legitimate report or spam?
    3. Give a credibility rating (Low/Medium/High).
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3, max_tokens=150
        )
        return completion.choices[0].message.content.strip()
    except: return "Analysis unavailable."

# --- Endpoints ---
@app.on_event("startup")
def startup_event():
    init_db()

# ... (Verify Claim & Scan Image endpoints remain unchanged) ...
@app.post("/verify-claim", response_model=VerificationResponse)
def verify_claim(request: Request, body: ClaimRequest):
     # (Keeping existing logic placeholder for brevity)
    return VerificationResponse(verdict="System OK", explanation="Text logic intact.", sources=[], credibility_score=50, hash="000", created_at=datetime.now().isoformat())

@app.post("/scan-image")
async def scan_image(file: UploadFile = File(...)):
    # (Keeping existing logic placeholder - ensure you keep the Image code from previous step)
    return {"status": "Please use the previous full code for image scanning if needed."}


# 3. NEW: DOCUMENT FORENSICS (PDF / DOCX)
@app.post("/scan-document")
async def scan_document(file: UploadFile = File(...)):
    filename = file.filename.lower()
    content = await file.read()
    file_hash = calculate_file_hash(content)
    
    meta_data = {}
    text_preview = ""
    doc_type = "unknown"
    risk_flags = []

    try:
        if filename.endswith(".pdf"):
            doc_type = "PDF"
            pdf = PdfReader(io.BytesIO(content))
            info = pdf.metadata
            if info:
                meta_data = {k.strip('/'): v for k, v in info.items()}
            
            # Forensics: Check for Javascript (often malicious in PDFs)
            if "/JS" in meta_data or "/JavaScript" in meta_data:
                risk_flags.append("Contains Embedded JavaScript (Potential Malware/Tracking)")
            
            # Extract text for AI
            if len(pdf.pages) > 0:
                text_preview = pdf.pages[0].extract_text()

        elif filename.endswith(".docx"):
            doc_type = "DOCX"
            doc = Document(io.BytesIO(content))
            prop = doc.core_properties
            meta_data = {
                "Author": prop.author,
                "Created": str(prop.created),
                "Modified": str(prop.modified),
                "LastModifiedBy": prop.last_modified_by,
                "Revision": prop.revision
            }
            # Extract text
            text_preview = "\n".join([p.text for p in doc.paragraphs[:5]])
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF or DOCX.")

        # AI Analysis
        ai_analysis = generate_doc_analysis(meta_data, text_preview, filename)
        
        # Score Logic
        score = 80
        if not meta_data: score -= 20
        if risk_flags: score -= 40
        if "User" in str(meta_data.get("Author", "")): score -= 10 # Generic author

        return {
            "filename": file.filename,
            "type": doc_type,
            "hash": file_hash,
            "score": score,
            "metadata": meta_data,
            "risk_flags": risk_flags,
            "ai_analysis": ai_analysis
        }

    except Exception as e:
        logging.error(f"Doc Scan Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")


# 4. NEW: ARCHIVE TRACER
@app.post("/trace-archive")
async def trace_archive(url: str = Form(...)):
    # 1. Check Wayback Machine
    wb_data = check_wayback_machine(url)
    
    # 2. AI Verification of the URL
    ai_verdict = "Unknown"
    if client:
        prompt = f"Is the domain '{url}' generally considered a credible news source or a known disinformation site? Answer in 1 sentence."
        try:
            ai_verdict = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            ).choices[0].message.content
        except: pass

    return {
        "url": url,
        "archive_status": wb_data,
        "ai_credibility_check": ai_verdict
    }