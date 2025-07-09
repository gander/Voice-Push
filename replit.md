# Push-to-Talk Audio Recorder

## Overview

This is a Vue.js-based web application that provides push-to-talk audio recording functionality. The application allows users to record audio by holding down a button and automatically transmits the recording to a configured endpoint when released. It features a modern TypeScript architecture with composable-based state management and modular service layers.

## User Preferences

- Preferred communication style: Simple, everyday language (Polish language support)
- Version management: Increment minor version for each bug fix/improvement
- Build process: Generate production build to dist folder after every code change

## System Architecture

### Frontend Architecture
- **Framework**: Vue 3 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Bootstrap 5 for responsive UI components with Feather Icons
- **Architecture Pattern**: Composition API with composables for reusable logic
- **State Management**: Reactive composables instead of centralized store

### Component Structure
- Single Page Application (SPA) with minimal component hierarchy
- Main App component orchestrates the entire application
- Logic separated into composables for recording, configuration, and business logic
- Service layer for external integrations (audio recording, HTTP transmission)

### Audio Processing
- **Recording Engine**: Native Web Audio API via MediaRecorder
- **Supported Formats**: WebM, MP3, WAV, OGG with automatic browser compatibility detection
- **Audio Quality**: High-quality settings with echo cancellation and noise suppression
- **Real-time Processing**: Push-to-talk functionality with immediate recording start/stop

## Key Components

### Core Composables
1. **useAudioRecording**: Manages the complete recording workflow including start/stop recording and transmission
2. **useConfiguration**: Handles endpoint configuration and audio format settings with environment variable support

### Service Layer
1. **AudioRecorder Service**: Wraps MediaRecorder API with error handling and format management
2. **HttpClient Service**: Handles secure transmission of audio files to configured endpoints
3. **MIME Type Utilities**: Browser compatibility detection and format conversion

### Type System
- Comprehensive TypeScript interfaces for all data structures
- Audio format enums with browser support validation
- Recording status tracking with type-safe state management

## Data Flow

1. **Initialization**: Application loads configuration from environment variables or prompts user
2. **Audio Setup**: Request microphone permissions and initialize MediaRecorder
3. **Recording Cycle**:
   - User presses and holds record button
   - Audio recording starts with configured format
   - Real-time status updates provide user feedback
   - User releases button to stop recording
4. **Transmission**: Recorded audio automatically uploads to configured endpoint
5. **Feedback**: Success/error status displayed to user

## External Dependencies

### Runtime Dependencies
- **Vue 3**: Core framework for reactive UI
- **TypeScript**: Type safety and enhanced development experience
- **Bootstrap 5**: UI framework for responsive design
- **Feather Icons**: Consistent iconography

### Browser APIs
- **MediaDevices API**: Microphone access and audio stream management
- **MediaRecorder API**: Audio recording functionality
- **Fetch API**: HTTP transmission of recorded audio
- **File API**: Blob handling for audio data

### Development Tools
- **Vite**: Build tool and development server
- **Vue TypeScript Config**: Optimized TypeScript configuration for Vue

## Deployment Strategy

### Environment Configuration
- **Flexible Setup**: Supports both environment variable configuration and runtime user configuration
- **Environment Variables**:
  - `VITE_ENDPOINT_URL`: Default transmission endpoint
  - `VITE_AUDIO_FORMAT`: Default audio recording format
- **Runtime Configuration**: Users can override settings through in-app configuration panel

### Build Configuration
- **Modern JavaScript**: ES2020 target with DOM type support
- **Bundle Optimization**: Vite handles code splitting and optimization
- **TypeScript Compilation**: Strict type checking with path aliases for clean imports
- **Static Asset Handling**: Optimized handling of CSS, images, and other assets

### Browser Compatibility
- **Modern Browsers**: Requires MediaRecorder API support (Chrome 47+, Firefox 25+, Safari 14+)
- **Progressive Enhancement**: Graceful degradation for unsupported audio formats
- **HTTPS Requirement**: Microphone access requires secure context in production

### Security Considerations
- **CORS Handling**: Configurable endpoints must support cross-origin requests for audio upload
- **Permission Management**: Explicit microphone permission requests with user-friendly error handling
- **Data Privacy**: No local storage of audio data, immediate transmission after recording

## Documentation and Legal

### Project Documentation
- **README.md**: Comprehensive setup guide, configuration options, and troubleshooting
- **LICENSE**: MIT License with Adam Gąsowski's copyright
- **PRIVACY.md**: Detailed privacy policy explaining data handling and user rights

### Recent Changes (July 9, 2025)
- ✓ Created comprehensive README.md with installation and configuration instructions
- ✓ Added MIT LICENSE with proper copyright attribution to Adam Gąsowski
- ✓ Enhanced HTML meta tags with SEO optimization, author, and license information
- ✓ Created PRIVACY.md with detailed privacy policy for data handling transparency
- ✓ Updated build output with new metadata (dist folder updated)
- ✓ v1.1.0: Added comprehensive logging system with LogPanel component
- ✓ v1.1.1: Set log panel to be expanded by default for better user experience
- ✓ v1.1.2: Enhanced logging with detailed server response status and data display
- ✓ v1.1.3: Fixed microphone permissions handling - auto-check existing permissions and added manual permission button