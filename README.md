# Rajzolj és Emlékezz! 🎨🧠

Egy modern, pörgős böngészős rajzolós és memóriajáték a **Kahoot!** vidám, letisztult és dinamikus látványvilágával felvértezve.

## 🎯 Újdonságok és Frissítések

- **Nehézségi szint választó a főmenüben**:
  - 🟢 **Könnyű (Kezdő)**: **10 másodperc** egy rajzra, összesen **5 feladvány**, színek engedélyezve, a rajzok sorban jönnek vissza.
  - 🟡 **Normál (Ajánlott)**: **5 másodperc** egy rajzra, összesen **15 feladvány**, színek engedélyezve, a rajzok sorban jönnek vissza.
  - 🔴 **Extrém (Hardcore)**: **2 másodperc** egy rajzra! **Nincs színválasztó** (csak azonnali ceruza), és a kitalálós fázisban **a rajzok megkeverve (nem sorban) jönnek vissza**!
- **Intelligens kurzor láthatóság**:
  - Fehér felületen éles **fekete kurzor**, fekete felületen éles **hófehér kurzor**.
  - Valós idejű, lebegő ecset-gyűrű (`mix-blend-mode: difference`), amely a fehér vásznon feketének, a fekete vonalak felett pedig automatikusan fehérnek látszik!
  - **Vászon háttér váltó**: Bármikor átválthatsz ⬜ Fehér lapról ⬛ Fekete táblára (ahol fehér krétával rajzolhatsz).
- **Bővített, nehezebb szókészlet**:
  - Kifejezetten nehezen és kapkodva lerajzolható szavak: *Mikró*, *Ló*, *Majomkenyérfa*, *Megelőzni tilos*, *Fekete lyuk*, *DNS spirál*, *Időgép*, *Délibáb*, *Gravitáció*, *Hűtőszekrény*, *Porszívó*, *Wi-Fi jel*, *Szfinx*, stb.

---

## 🎮 A Játék Menete

1. **Főmenü & Nehézség**:
   - Válaszd ki a neked tetsző szintet (Könnyű / Normál / Extrém).
   - Kattints a nagy, animált **„MEHET!”** gombra!
2. **3-2-1 visszaszámlálás**:
   - Dinamikus visszaszámláló kör és hangeffekt készít fel az 1. körre.
3. **Rajzolási Fázis**:
   - Rajzold le a feladványt a rendelkezésre álló idő alatt (10 mp / 5 mp / 2 mp).
   - Az idő lejárta után a rajz azonnal mentődik, a vászon letiltódik, és animált átmenettel érkezik a következő kör.
4. **Kitalálós Fázis**:
   - Visszakapod a saját rajzaidat (Normál/Könnyű módban sorban, **Extrém módban véletlenszerűen megkeverve**!).
   - Írd be emlékezetből a feladványt a beviteli mezőbe és nyomj `Enter`-t vagy a *Beküldés* gombot.
5. **Eredményhirdetés & Összesítés**:
   - Konfetti animáció és hanghatás.
   - Helyes / helytelen szám, százalékos értékelés és rang.
   - 15 (vagy 5) kártyás részletes galéria minden rajzoddal és a megfejtésekkel.

---

## 📁 Fájlok

- [index.html](file:///C:/Users/sarka/.gemini/antigravity/scratch/rajzolj-es-emlekezz/index.html): Főoldal, nehézségválasztó, canvas és galéria
- [style.css](file:///C:/Users/sarka/.gemini/antigravity/scratch/rajzolj-es-emlekezz/style.css): Kahoot! dizájn, inverz kurzor stílusok, reszponzivitás
- [game.js](file:///C:/Users/sarka/.gemini/antigravity/scratch/rajzolj-es-emlekezz/game.js): Nehézség-logika, időzítő, kevert sorrend és canvas motor
- [words.js](file:///C:/Users/sarka/.gemini/antigravity/scratch/rajzolj-es-emlekezz/words.js): Szógyűjtemény a nehéz és klasszikus szavakkal, szinonimákkal
- [audio.js](file:///C:/Users/sarka/.gemini/antigravity/scratch/rajzolj-es-emlekezz/audio.js): Web Audio API szintetizátor

## 🚀 Indítás

Nyisd meg az [index.html](file:///C:/Users/sarka/.gemini/antigravity/scratch/rajzolj-es-emlekezz/index.html) fájlt bármilyen böngészőben!
