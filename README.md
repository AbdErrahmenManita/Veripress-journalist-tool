#  VeriPress (TextAtlas Journalist Tool)

### *The Journalist's Intelligence Unit*

A tactical suite of digital forensic tools designed to verify news, detect deepfakes, and analyze documents — built for modern newsrooms to combat disinformation using **local AI**, **real-time data**, and **forensic analysis**.

---

#  Overview

**VeriPress** is an OSINT-powered platform providing journalists and fact-checkers with a unified interface to verify text claims, analyze images, detect deepfakes, and authenticate documents.
It emphasizes:

* **Local AI processing** (no images sent to external clouds)
* **Multi-layer forensic analysis**
* **High-speed LLM reasoning via Groq**
* **Credibility scoring with traceable citations**
* **A clean, fast React-based UI**

---

#  Core Features

##  1. VeriCheck — Fact-Checking Engine

Real-time verification of statements and headlines.

**Capabilities**

* **Cross-Verification**

  * Google Fact Check Explorer
  * Live Google Search results
* **AI Verdicts (Groq Llama 3.3)**

  * Credibility score (0–100%)
  * Reasoned verdict
  * Contradiction explanation
* **Trusted Source Citations**

  * Reuters, AP, AFP, BBC, etc.
  * Distinguishes **Official** vs **Web** sources

---

##  2. DeepScan — Image Forensics

A 5-layer forensic image analysis engine.

### 5-Layer Pipeline

1. **Provenance Check**

   * Google Lens API
   * Yandex Vision reverse search

2. **Metadata Forensics**

   * EXIF extraction (ExifTool)
   * GPS, timestamps, camera model
   * Consistency checks

3. **Noise & Compression Analysis**

   * JPEG anomalies
   * Recompression indicators
   * Manipulation patterns

4. **Local AI Detection**

   * HuggingFace ResNet-50 model
   * Detects Midjourney, DALL-E, Stable Diffusion
   * Runs **offline on CPU** (privacy)

5. **Contextual OSINT**

   * Shadow direction
   * Weather & geolocation clues
   * Event timeline comparison

---

##  3. DocLab — Document Forensics

Forensic analysis for PDF and DOCX files.

**Features**

* **PDF Tree Inspection**

  * Embedded objects
  * Hidden scripts
  * Metadata inconsistencies
* **DOCX Structure Analysis**

  * Editor fingerprints
  * Template mismatches
* **Timeline Paradox Detection**

  * Creation > Modification
  * Impossible date sequences
* **AI Summaries**

  * Llama 3.3 (Groq) forensic summary

---

##  4. ArchiveTracer — Web Archive Intelligence

Historic investigation of URLs.

**Features**

* Wayback Machine API integration
* Retrieves:

  * First archive
  * Latest archive
  * Deleted/modified pages
  * Version comparison links

---

#  Technical Architecture

##  Frontend

* **React (Vite)**
* **Tailwind CSS v4**
* **Framer Motion**
* **Lucide React**
* Secure REST communication with FastAPI backend

---

##  Backend

### Framework

* **FastAPI (Python)**

### AI Engines

* **Groq — Llama 3.3**

  * Text logic, fact-checking, summaries
* **Transformers (local)**

  * ResNet-50 for image deepfake detection
  * Fully offline

### Forensic Libraries

* **Pillow** (image processing)
* **ExifTool** (metadata)
* **pypdf** (PDF analysis)
* **python-docx** (Word scanning)
* **OpenCV (optional)**

### Database

* **SQLite**

  * Lightweight and local
  * Used for logs, caching, references

---

#  Installation

## Frontend

```
cd frontend
npm install
npm run dev
```

## Backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

#  Test Cases

## Text Verification

| Input          | Expected          |
| -------------- | ----------------- |
| False rumor    | Credibility < 10% |
| Confirmed news | Credibility > 80% |

## Image Forensics

| Case             | Output                        |
| ---------------- | ----------------------------- |
| Midjourney image | AI-generated flag             |
| Real DSLR photo  | Consistent EXIF, no anomalies |

## Document Analysis

| Case       | Output           |
| ---------- | ---------------- |
| Edited PDF | Timeline paradox |
| Clean DOCX | Valid metadata   |


#  Contributors

VeriPress Team
Unbreaking News — Hackathon Edition 2025



