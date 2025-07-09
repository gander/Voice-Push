# Push-to-Talk Audio Recorder

Aplikacja webowa Vue.js 3 + TypeScript umożliwiająca nagrywanie audio w trybie push-to-talk z automatycznym wysyłaniem do konfigurowalnych endpointów.

## Funkcjonalności

- **Push-to-Talk Recording**: Nagrywanie audio przez przytrzymanie przycisku
- **Automatyczne wysyłanie**: Pliki audio są natychmiast wysyłane po zakończeniu nagrania
- **Konfigurowalne endpointy**: Obsługa różnych serwisów (n8n, Make, własne API)
- **Obsługa formatów audio**: WebM, MP3, WAV, OGG z automatyczną detekcją kompatybilności przeglądarki
- **Konfiguracja przez zmienne środowiskowe**: Możliwość pre-konfiguracji endpointu i formatu
- **Panel konfiguracji**: Interfejs użytkownika do zmiany ustawień w czasie rzeczywistym
- **Responsywny design**: Dopasowanie do urządzeń mobilnych i desktopowych

## Wymagania techniczne

- **Przeglądarki**: Chrome 47+, Firefox 25+, Safari 14+ (wymaga MediaRecorder API)
- **HTTPS**: Wymagane w produkcji dla dostępu do mikrofonu
- **Uprawnienia**: Dostęp do mikrofonu wymagany przy pierwszym użyciu

## Szybki start

### 1. Klonowanie repozytorium
```bash
git clone <repository-url>
cd push-to-talk-recorder
```

### 2. Instalacja zależności
```bash
npm install
```

### 3. Konfiguracja (opcjonalna)
Utwórz plik `.env` w głównym katalogu:
```env
VITE_ENDPOINT_URL=https://twoj-endpoint.com/webhook
VITE_AUDIO_FORMAT=webm
```

### 4. Uruchomienie w trybie deweloperskim
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### 5. Build produkcyjny
```bash
npm run build
```

Pliki gotowe do wdrożenia znajdziesz w folderze `dist/`

## Konfiguracja

### Zmienne środowiskowe

| Zmienna | Opis | Wartości | Domyślna |
|---------|------|----------|----------|
| `VITE_ENDPOINT_URL` | URL endpointu do wysyłania audio | URL | - |
| `VITE_AUDIO_FORMAT` | Format nagrywania audio | `webm`, `mp3`, `wav`, `ogg` | `webm` |

### Interfejs użytkownika

Jeśli zmienne środowiskowe nie są skonfigurowane, aplikacja wyświetli panel konfiguracji gdzie można:
- Ustawić URL endpointu
- Wybrać format audio
- Sprawdzić kompatybilność przeglądarki

## Architektura

### Technologie
- **Vue 3** z Composition API
- **TypeScript 5.8** dla bezpieczeństwa typów
- **Vite** jako narzędzie budowy
- **Bootstrap 5** dla interfejsu użytkownika
- **Feather Icons** dla ikonografii

### Struktura projektu
```
src/
├── components/           # Komponenty Vue
│   ├── PushToTalkButton.vue
│   ├── ConfigurationPanel.vue
│   └── StatusIndicator.vue
├── composables/          # Logika biznesowa
│   ├── useAudioRecording.ts
│   └── useConfiguration.ts
├── services/             # Usługi zewnętrzne
│   ├── audioRecorder.ts
│   └── httpClient.ts
├── types/               # Definicje TypeScript
└── utils/               # Narzędzia pomocnicze
```

## Wdrożenie

### Serwer statyczny
Skopiuj zawartość folderu `dist/` na dowolny serwer HTTP:
```bash
npm run build
cp -r dist/* /var/www/html/
```

### Netlify/Vercel
1. Podłącz repozytorium
2. Ustaw build command: `npm run build`
3. Ustaw publish directory: `dist`
4. Skonfiguruj zmienne środowiskowe w panelu administracyjnym

### Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

## API endpointu

Aplikacja wysyła dane POST z plikiem audio w formacie `multipart/form-data`:

```javascript
{
  audio: File,              // Plik audio
  format: string,           // Format (webm/mp3/wav/ogg)
  timestamp: string,        // ISO timestamp
  size: string,             // Rozmiar w bajtach
  filename: string          // Nazwa pliku
}
```

### Przykład endpointu (Node.js/Express)
```javascript
app.post('/webhook', upload.single('audio'), (req, res) => {
  const { format, timestamp, size } = req.body;
  const audioFile = req.file;
  
  // Przetwarzanie pliku audio
  console.log(`Otrzymano audio: ${audioFile.filename}, format: ${format}`);
  
  res.json({ success: true, message: 'Audio otrzymane' });
});
```

## Bezpieczeństwo

- **CORS**: Endpoint musi obsługiwać żądania cross-origin
- **Uprawnienia**: Aplikacja prosi o zgodę na dostęp do mikrofonu
- **HTTPS**: Wymagane w produkcji dla WebRTC APIs
- **Prywatność**: Audio nie jest przechowywane lokalnie

## Rozwiązywanie problemów

### Brak dostępu do mikrofonu
- Sprawdź czy strona jest serwowana przez HTTPS
- Zezwól na dostęp do mikrofonu w przeglądarce
- Sprawdź czy mikrofon nie jest używany przez inną aplikację

### Błędy wysyłania
- Sprawdź URL endpointu
- Upewnij się że endpoint obsługuje CORS
- Sprawdź logi sieciowe w narzędziach deweloperskich

### Problemy z formatem audio
- Sprawdź kompatybilność przeglądarki w panelu konfiguracji
- Spróbuj innego formatu (WebM zwykle najlepiej obsługiwany)

## Licencja

MIT License - zobacz plik [LICENSE](LICENSE) dla szczegółów.

## Autor

Adam Gąsowski

## Wsparcie

W przypadku problemów lub pytań, utwórz issue w repozytorium projektu.