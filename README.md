**Veripress** (TextAtlas Journalist Tool)
The Journalist's Intelligence Unit. A suite of tactical digital forensic tools designed to verify news, detect deepfakes, and analyze documents. Built for the modern newsroom to fight disinformation using local AI and real-time data.

* Features :

1. VeriCheck (Fact Checking Module)
Real-Time Verification: Cross-references claims against Google Fact Check Explorer and live Google Search results.
AI Analysis: Uses Llama 3.3 (via Groq) to synthesize verdicts and assign credibility scores (0-100%).
Source Citations: Automatically cites trusted sources (Reuters, AP, BBC, etc.) and highlights "Official" vs. "Web" sources.

2. DeepScan (Image Forensics)
5-Layer Analysis: Checks provenance, metadata, noise variance, context, and AI patterns.
Local AI Detector: Runs an open-source Hugging Face Transformer model (ResNet-50) locally on your CPU to detect AI-generated images (Midjourney, DALL-E) without sending images to the cloud.
Metadata Forensics: Extracts EXIF data and identifies camera models to validate authenticity.

3. DocLab (Document Analysis)
PDF & DOCX Scanning: Parses files for hidden scripts, inconsistent metadata, and "Timeline Paradoxes" (Creation Date > Modification Date).
AI Summaries: Generates concise forensic summaries of document contents.

4. Archive Tracer
Wayback Machine Integration: Instantly checks if a URL has been archived or deleted.


* Tech Stack
  
Frontend:

React (Vite)
Tailwind CSS (v4)
Framer Motion (Animations)
Lucide React (Icons)

Backend:

Python (FastAPI)
SQLite (Local Database)
AI Engines:
groq (Llama 3.3 for text logic)
transformers (Local Hugging Face model for image detection)
Forensic Libs: Pillow (Images), pypdf (PDFs), python-docx (Word).

