import pandas as pd
import re

df = pd.read_csv('data/spam.csv', encoding='latin-1')
df = df[['v1', 'v2']]
df.columns = ['label', 'text']

URGENCY_KEYWORDS = [
    "urgent", "immediately", "act now", "limited time", "expires",
    "click here", "verify now", "account suspended", "account blocked",
    "claim now", "winner", "congratulations", "you have won",
    "lottery", "prize", "kyc", "update your", "confirm your",
    "your account will be", "final notice", "last chance",
    "blocked", "suspended", "deactivated", "unauthorized"
]

def count_urgency_words(text):
    text_lower = text.lower()
    return sum(1 for word in URGENCY_KEYWORDS if word in text_lower)

df['text_length'] = df['text'].apply(len)
df['has_url'] = df['text'].str.contains(r'http|www', case=False, regex=True).astype(int)
df['exclamation_count'] = df['text'].str.count('!')
df['digit_count'] = df['text'].str.count(r'\d')
df['uppercase_ratio'] = df['text'].apply(lambda x: sum(1 for c in x if c.isupper()) / len(x) if len(x) > 0 else 0)
df['urgency_word_count'] = df['text'].apply(count_urgency_words)
df['special_char_count'] = df['text'].str.count(r'[^\w\s]')

print(df.groupby('label')[['text_length', 'has_url', 'exclamation_count', 'digit_count', 'uppercase_ratio', 'urgency_word_count', 'special_char_count']].mean().T)