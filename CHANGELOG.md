# Changelog

## [Unreleased]

### Added
- **Manual Character Creation**: Added option to create a character with completely empty and editable fields
  - Two creation modes available: Automatic (generates random values) and Manual (empty form)
  - In Automatic mode: Name, Background, and Birthsign fields are read-only after generation, while Stats (STR, DEX, WIL, HP) are read-only. All fields can still be modified but with restrictions.
  - In Manual mode: All fields (Name, Background, Birthsign, Stats) are fully editable from the start
  - Character creation method is tracked and influences field editability across the character sheet

- **Shareable Character Links**: Generate compressed shareable links to share character sheets with others
  - Compress character data using LZ-string algorithm for compact URL representation
  - Share links contain full character state encoded in URL parameters
  - Automatic character loading when opening a shared link
  - One-click copy to clipboard with fallback to manual prompt
  - "Copia link" button appears when viewing a shared character
  - Shareable links work just like Excalidraw - send the URL and others can view your exact character state

