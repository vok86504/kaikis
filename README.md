# Kaikis — George Mitra's portfolio

Live at **https://kaikis.com** (also https://kaikis.web.app), hosted on Firebase Hosting (project `kaikis`).

Plain HTML, CSS and JavaScript — no framework or build step.

```
public/            the website (everything here gets published)
  index.html       home page
  *.html           case studies (strato, kasenso, trainerq, tchrs, quibble, trainerq-ds) and archive
  styles.css       the whole design system: tokens, components, day/night themes
  main.js          theme switch, EXP bar, power aura tap, menu, reveal-on-scroll, lightbox
  images/          screenshots and artwork
firebase.json      hosting config (cache headers, /deped redirect)
.firebaserc        Firebase project id
```

## Preview locally

```bash
python -m http.server 5178 --directory public
```

Then open http://localhost:5178.

## Publish

```bash
npm install -g firebase-tools   # once per computer
firebase login                  # once per computer
firebase deploy --only hosting --project kaikis
```
