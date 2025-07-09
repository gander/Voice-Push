# Privacy Policy - Push-to-Talk Audio Recorder

## Data Collection

### Audio Data
- The application records audio from your microphone only while the record button is actively pressed
- Audio recordings are immediately sent to your configured endpoint and **are not stored** locally in the browser
- We have no access or control over how external endpoints process the received audio files

### Configuration Data
- Endpoint URL and audio format are stored in your browser's localStorage
- This data remains only in your browser and is not sent anywhere else

### Metadata
Along with the audio file, we send the following metadata:
- File format (webm/mp3/wav/ogg)
- Recording timestamp
- File size in bytes
- Auto-generated filename

## Permissions

### Microphone Access
- The application requires microphone permissions for recording functionality
- Microphone access is only active while the record button is pressed
- You can revoke permissions at any time in your browser settings

## Security

### Data Transmission
- All data is transmitted via HTTPS in production
- Audio files are sent as multipart/form-data to your configured endpoint
- We have no control over the security of external endpoints

### Local Storage
- Configuration (URL, format) stored in localStorage
- No audio recordings are stored locally
- You can clear configuration data using the "Reset" function in the app

## External Services

### Target Endpoints
- The application sends recordings to user-configured endpoints
- You can use any services: n8n, Make, custom APIs, etc.
- **You are responsible for checking the privacy policies of the endpoints you use**

### CDN and External Libraries
The application loads the following resources from external CDNs:
- Bootstrap 5 CSS/JS (cdn.jsdelivr.net)
- Feather Icons (cdn.jsdelivr.net)

## Your Rights

### Data Control
- You can change or delete endpoint configuration at any time
- You can revoke microphone permissions in your browser
- You can contact endpoint operators about deleting sent recordings

### Transparency
- Application source code is publicly available
- You can verify what data is sent using browser developer tools

## Contact

For privacy-related questions, contact:
**Adam Gąsowski** - Application Author

## Updates

This privacy policy may be updated. Check this document regularly for the latest information.

**Last updated:** July 9, 2025