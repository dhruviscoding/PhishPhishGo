import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix, classification_report
import joblib

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

def extract_features(df):
    features = pd.DataFrame()
    features['text_length'] = df['text'].apply(len)
    features['has_url'] = df['text'].str.contains(r'http|www', case=False, regex=True).astype(int)
    features['exclamation_count'] = df['text'].str.count('!')
    features['digit_count'] = df['text'].str.count(r'\d')
    features['uppercase_ratio'] = df['text'].apply(lambda x: sum(1 for c in x if c.isupper()) / len(x) if len(x) > 0 else 0)
    features['urgency_word_count'] = df['text'].apply(count_urgency_words)
    features['special_char_count'] = df['text'].str.count(r'[^\w\s]')
    return features

# Load data
df = pd.read_csv('data/spam.csv', encoding='latin-1')
df = df[['v1', 'v2']]
df.columns = ['label', 'text']
df['label_num'] = df['label'].map({'ham': 0, 'spam': 1})

# Extract features
X = extract_features(df)
y = df['label_num']

# Split into train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"Training set size: {len(X_train)}")
print(f"Test set size: {len(X_test)}")

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"Precision: {precision_score(y_test, y_pred):.4f}")
print(f"Recall: {recall_score(y_test, y_pred):.4f}")
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

joblib.dump(model, 'scam_model.pkl')
print("Model saved as scam_model.pkl")