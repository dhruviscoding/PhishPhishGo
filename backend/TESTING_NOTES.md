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