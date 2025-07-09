# Polityka Prywatności - Push-to-Talk Audio Recorder

## Zbieranie danych

### Dane audio
- Aplikacja nagrywaje dźwięk z mikrofonu tylko podczas aktywnego przytrzymania przycisku nagrywania
- Nagrania audio są natychmiast wysyłane do skonfigurowanego endpointu i **nie są przechowywane** lokalnie w przeglądarce
- Nie mamy dostępu ani kontroli nad tym, jak zewnętrzne endpointy przetwarzają otrzymane pliki audio

### Dane konfiguracyjne
- URL endpointu i format audio są przechowywane w localStorage przeglądarki
- Te dane pozostają tylko w Twojej przeglądarce i nie są wysyłane nigdzie indziej

### Metadane
Wraz z plikiem audio wysyłamy następujące metadane:
- Format pliku (webm/mp3/wav/ogg)
- Znacznik czasu nagrania
- Rozmiar pliku w bajtach
- Automatycznie wygenerowaną nazwę pliku

## Uprawnienia

### Dostęp do mikrofonu
- Aplikacja wymaga uprawnień do mikrofonu dla funkcjonalności nagrywania
- Dostęp do mikrofonu jest aktywny tylko podczas przytrzymania przycisku nagrywania
- Możesz w każdej chwili odwołać uprawnienia w ustawieniach przeglądarki

## Bezpieczeństwo

### Transmisja danych
- Wszystkie dane są transmitowane przez HTTPS w produkcji
- Pliki audio są wysyłane jako multipart/form-data do skonfigurowanego endpointu
- Nie mamy kontroli nad bezpieczeństwem zewnętrznych endpointów

### Przechowywanie lokalne
- Konfiguracja (URL, format) przechowywana w localStorage
- Żadne nagrania audio nie są przechowywane lokalnie
- Możesz wyczyścić dane konfiguracyjne przez funkcję "Reset" w aplikacji

## Zewnętrzne usługi

### Endpointy docelowe
- Aplikacja wysyła nagrania do endpointów konfigurowanych przez użytkownika
- Możesz używać dowolnych usług: n8n, Make, własne API, etc.
- **Jesteś odpowiedzialny za sprawdzenie polityki prywatności używanych endpointów**

### CDN i biblioteki zewnętrzne
Aplikacja ładuje następujące zasoby z zewnętrznych CDN:
- Bootstrap 5 CSS/JS (cdn.jsdelivr.net)
- Feather Icons (cdn.jsdelivr.net)

## Twoje prawa

### Kontrola danych
- Możesz w każdej chwili zmienić lub usunąć konfigurację endpointu
- Możesz odwołać uprawnienia do mikrofonu w przeglądarce
- Możesz skontaktować się z operatorami endpointów w sprawie usunięcia wysłanych nagrań

### Przezroczystość
- Kod źródłowy aplikacji jest dostępny publicznie
- Możesz zweryfikować, jakie dane są wysyłane poprzez narzędzia deweloperskie przeglądarki

## Kontakt

W sprawie pytań dotyczących prywatności skontaktuj się z:
**Adam Gąsowski** - autor aplikacji

## Aktualizacje

Ta polityka prywatności może być aktualizowana. Sprawdzaj ten dokument regularnie dla najnowszych informacji.

**Ostatnia aktualizacja:** 9 lipca 2025