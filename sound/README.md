# Звуковой дневник / Sound diary

Страница: https://gek2or.github.io/donetsk-2011/sound.html

Как добавить запись (можно прямо на github.com, без пересборки сайта):

1. Загрузи файл в эту папку `sound/` (лучше `.mp3`, 128–192 kbps, или `.m4a`), например `sound/a01-dvor.mp3`.
2. Открой `sound/tracks.json` и добавь запись в список `tracks`:

```json
{
  "tracks": [
    {
      "file": "sound/a01-dvor.mp3",
      "side": "A",
      "date": "2026-10-20",
      "t": { "ru": "Двор, утро", "uk": "Двір, ранок", "en": "Courtyard, morning", "fi": "Sisäpiha, aamu" },
      "n": { "ru": "Первый набросок. Что записано и почему.", "en": "First sketch." }
    }
  ]
}
```

`t` — название, `n` — заметка. Языки, которых нет, берутся из `ru`.
Плеер на сайте без кнопки скачивания.
