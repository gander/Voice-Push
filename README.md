# Push-to-Talk Audio Recorder

A Vue.js 3 + TypeScript web application for push-to-talk audio recording with automatic transmission to configurable endpoints.

## 🌐 Live Demo

Try the application at: **https://voice-push.replit.app**

## Features

- **Push-to-Talk Recording**: Record audio by holding down a button
- **Automatic Transmission**: Audio files are sent immediately after recording
- **Multiple Audio Formats**: WebM, MP3, WAV, OGG with browser compatibility detection
- **Configurable Endpoints**: Support for various services (n8n, Make, custom APIs)
- **Real-time Configuration**: In-app settings panel for endpoint and format selection
- **Responsive Design**: Works on mobile and desktop devices
- **Real-time Logging**: Detailed operation logs with server response information

## How It Works

1. **Initialize**: Grant microphone permissions when prompted
2. **Configure**: Set your endpoint URL and preferred audio format
3. **Record**: Hold the record button to start recording
4. **Release**: Audio stops recording and automatically uploads to your endpoint
5. **Feedback**: View success/error status in the logs panel

## Configuration Options

### Audio Formats
- **WebM**: Best browser support, recommended default
- **MP3**: Universal compatibility
- **WAV**: Uncompressed, larger file size
- **OGG**: Open source format

### Endpoint Configuration
Configure your receiving endpoint URL through the settings panel. The application will validate the endpoint and show connection status.

## API Request Format

The application sends a POST request with `multipart/form-data`:

```javascript
{
  audio: File,              // Audio file blob
  format: string,           // Audio format (webm/mp3/wav/ogg)
  timestamp: string,        // ISO timestamp
  size: string,             // File size in bytes
  filename: string,         // Generated filename
  type: string              // MIME type
}
```

### Example Endpoint Handler (Node.js/Express)
```javascript
app.post('/webhook', upload.single('audio'), (req, res) => {
  const { format, timestamp, size } = req.body;
  const audioFile = req.file;
  
  console.log(`Received audio: ${audioFile.filename}, format: ${format}`);
  
  res.json({ success: true, message: 'Audio received successfully' });
});
```

## Technical Requirements

- **Browsers**: Chrome 47+, Firefox 25+, Safari 14+ (requires MediaRecorder API)
- **HTTPS**: Required for microphone access in production
- **CORS**: Endpoint must support cross-origin requests

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Adam Gąsowski