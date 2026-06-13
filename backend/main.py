from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import requests
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageInput(BaseModel):
    text: str

URGENCY_KEYWORDS = [
    "urgent", "immediately", "act now", "limited time", "expires",
    "click here", "verify now", "account suspended", "account blocked",
    "claim now", "winner", "congratulations", "you have won",
    "lottery", "prize", "kyc", "update your", "confirm your",
    "your account will be", "final notice", "last chance",
    "blocked", "suspended", "deactivated", "unauthorized"
]

def extract_urls(text):
    url_pattern = r'(https?://\S+|www\.\S+)'
    return re.findall(url_pattern, text)

def detect_urgency_language(text):
    text_lower = text.lower()
    found = []
    for keyword in URGENCY_KEYWORDS:
        if keyword in text_lower:
            found.append(keyword)
    return found

def extract_domain(url):
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except:
        return None

def check_domain_reputation(domain):
    if not domain:
        return None
    try:
        url = f"https://www.virustotal.com/api/v3/domains/{domain}"
        headers = {"x-apikey": VIRUSTOTAL_API_KEY}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            stats = data["data"]["attributes"]["last_analysis_stats"]
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            return {
                "domain": domain,
                "malicious_votes": malicious,
                "suspicious_votes": suspicious,
                "is_flagged": malicious > 0 or suspicious > 2
            }
    except Exception as e:
        print(f"Domain check error: {e}")
        return {"error": str(e)}
    return None

def calculate_risk_score(urls, urgency_phrases, domain_results=[]):
    score = 0
    
    if len(urls) > 0:
        score += 20
    
    score += len(urgency_phrases) * 15
    
    for domain in domain_results:
        if domain.get("is_flagged"):
            score += 40
        elif domain.get("malicious_votes", 0) > 0:
            score += 25
    
    score = min(score, 100)
    
    if score >= 70:
        verdict = "High Risk - Likely Scam"
    elif score >= 40:
        verdict = "Medium Risk - Suspicious"
    elif score >= 15:
        verdict = "Low Risk - Be Cautious"
    else:
        verdict = "Likely Safe"
    
    return score, verdict

@app.get("/")
def root():
    return {"message": "PhishPhishGo API is running"}

@app.post("/analyze")
def analyze(input: MessageInput):
    urls = extract_urls(input.text)
    urgency_phrases = detect_urgency_language(input.text)
    domain_results = []
    for url in urls:
        domain = extract_domain(url)
        if domain:
            rep = check_domain_reputation(domain)
            if rep:
                domain_results.append(rep)
    risk_score, verdict = calculate_risk_score(urls, urgency_phrases, domain_results)
    return {
        "text": input.text,
        "urls_found": urls,
        "urgency_phrases_found": urgency_phrases,
        "domain_reputation": domain_results,
        "risk_score": risk_score,
        "verdict": verdict
    }