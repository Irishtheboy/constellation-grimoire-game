# Background Music

Place your background music files here:

## Supported Formats
- `.mp3` (recommended)
- `.ogg`
- `.wav`

## Suggested Files
- `battle-theme.mp3` - Main battle music
- `lobby-theme.mp3` - Lobby/menu music
- `victory-theme.mp3` - Victory music
- `defeat-theme.mp3` - Defeat music

## Usage
The audio manager will automatically load and play these files when:
- Entering battle (battle-theme.mp3)
- In lobby (lobby-theme.mp3)
- Battle complete (victory/defeat themes)

## Volume Control
Music volume can be controlled via the audio manager:
```javascript
audioManager.setMusicVolume(0.5); // 50% volume
```