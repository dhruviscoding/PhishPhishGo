from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageInput(BaseModel):
    text: str

# Common urgency/manipulation phrases used in scam messages
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

def calculate_risk_score(urls, urgency_phrases):
    score = 0
    
    # URLs increase risk
    if len(urls) > 0:
        score += 30
    
    # Each urgency phrase adds risk
    score += len(urgency_phrases) * 15
    
    # Cap at 100
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
    risk_score, verdict = calculate_risk_score(urls, urgency_phrases)

    return {
        "text": input.text,
        "urls_found": urls,
        "urgency_phrases_found": urgency_phrases,
        "risk_score": risk_score,
        "verdict": verdict
    }