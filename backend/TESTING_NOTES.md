# Testing Notes

Tested PhishPhishGo against various message types:

- High-risk English scam (lottery/KYC) - correctly flagged 90+ risk score
- Legitimate Hindi message - correctly flagged as safe (ham, 2% confidence)
- Hinglish scam (Hindi + English mixed, with URL) - correctly detected URL and urgency keywords, Medium Risk
- Legitimate utility bill reminder - flagged as Medium Risk (false positive) - documented as known limitation, likely due to ML model being trained on UK/US SMS data which may not generalize to Indian transactional message formats
- QR code analysis - correctly decodes, follows redirects, checks domain reputation

## Known Limitations
- ML model may produce false positives on legitimate transactional messages (bills, payment reminders) due to training data not being India-specific
- ML model not applied to QR-decoded URLs (architectural decision - model trained on message text, not bare URLs)

## ML Model Iteration

Initial model (UCI SMS Spam Collection, 5,572 messages, UK/US data):
- Accuracy: 97.76%, Precision: 91.89%, Recall: 91.28%
- Issue: false positives on Indian telecom/utility notifications (BSES bill, Airtel call alert)

Retrained with India Spam SMS Classification dataset (+2,000 messages):
- Accuracy: 97.64%, Precision: 95.47% (improved), Recall: 91.95%
- Airtel call alert message still flagged (62/100, 95% ML confidence)

Retrained with Spam & Ham 100K India dataset (107,838 total messages, ~50/50 split):
- Accuracy: 99.83%, Precision: 99.86%, Recall: 99.79%
- Airtel call alert message STILL flagged (61/100, 92% ML confidence)

### Key Finding
Even a 99.83% accurate model trained on 100K+ India-specific messages consistently
misclassifies legitimate "missed call alert" notifications as spam. This message type
shares surface-level features (URL presence, "ONLY on [App]", "Get details", 
call-to-action phrasing) with extremely common real promotional spam from the same
telecom providers (e.g., "ONLY on Airtel Thanks App... Click..."). 

This demonstrates a fundamental limitation of feature-based text classification for
this message category - the distinguishing signal between "your missed call is back"
and "claim your free data" isn't captured by surface features like length, digit count,
or URL presence. Distinguishing these would likely require semantic understanding
(e.g., transformer-based embeddings) rather than hand-engineered features.