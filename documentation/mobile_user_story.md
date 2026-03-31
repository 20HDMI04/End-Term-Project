# 📖 Readsy Könyv FelfedezőFelhasználói Történetek (User Stories)

## 🎯 Dokumentáció célja

A dokumentum célja a mobilalkalmazás funkcionális követelményeinek meghatározása **felhasználói történetek (User Stories)** formájában. Az Agilis módszertan szerint ezek a leírások a rendszer funkcióit tisztán a felhasználó szemszögéből mutatják be.

> 🗨️ **Megjegyzés**:
> Úgy gondoltuk hogy a fontos számunkra is egy User Story megalkotása. Így megfogalmaztunk pár fontos kritériumot habár ez a mobil alkalmazáshoz készült részben a weben is ezeket az elvárásokat igyekeztünk betartani.

## 🧭 1. Navigáció

### **US - 01 | Navigáció az alkalmazásban**

- **User Story:** Mint felhasználó, szeretnék egyszerűen navigálni az alkalmazás különböző képernyői között, hogy gyorsan elérhessem a kívánt funkciókat.
- **Elfogadási kritériumok:**
  - Az alkalmazás alsó navigációs sávval (**Bottom Navigation Bar**) rendelkezik.
  - A navigációs sáv tartalmazza: `Home` 🏠, `Discover` 🧭, `Search` 🔍, `Favorites` ❤️, `Profile` 👤.
  - A menüpontokra kattintva azonnal a megfelelő képernyő jelenik meg.

## 🏠 2. Főoldal (Home)

### **US - 02 | Ajánlott könyvek megtekintése**

- **User Story:** Mint felhasználó, szeretném megtekinteni az ajánlott könyveket a főoldalon, hogy új olvasnivalókat fedezhessek fel. 🌟
- **Elfogadási kritériumok:**
  - Betöltéskor azonnal látszódnak az ajánlott könyvek.
  - A **„Trending Now”** szekció kiemelt könyveket tartalmaz.
  - Adatok: borítókép, értékelése.

### **US - 03 | Új könyvek böngészése**

- **User Story:** Mint felhasználó, szeretném böngészni az újonnan megjelent könyveket, hogy naprakész legyek. 🆕
- **Elfogadási kritériumok:**
  - A **„What’s New”** szekció elérhető a főoldalon.
  - A könyvlista vízszintesen görgethető (**Horizontal Scroll**).
  - Adatok: borítókép, cím.

## 🧭 3. Discover (Felfedezés)

### **US - 04 | Új könyvek felfedezése**

- **User Story:** Mint felhasználó, szeretnék új könyveket és szerzőket felfedezni a listám bővítéséhez. 🌍
- **Elfogadási kritériumok:**
  - Megjelenik a **„Book of the Week”** (A hét könyve).
  - Népszerű szerzők ajánlása.

### **US - 05 | Szerzők böngészése**

- **User Story:** Mint felhasználó, szeretném megtekinteni a népszerű szerzőket. ✍️
- **Elfogadási kritériumok:**
  - A szerzők listás nézetben jelennek meg.
  - Adatok: profilkép.
  - Kiválasztáskor megjelennek a szerző egyes művei.

## 🔍 4. Keresés (Search)

### **US - 06 | Könyv keresése**

- **User Story:** Mint felhasználó, szeretnék könyveket keresni cím vagy szerző alapján. 🧐
- **Elfogadási kritériumok:**
  - Funkcionális keresőmező az oldal tetején.
  - Keresés támogatása **cím** és **szerző** szerint.
  - A találatok átlátható listában jelennek meg.

### **US - 07 | Könyvek böngészése kategória szerint**

- **User Story:** Mint felhasználó, szeretnék műfajok szerint böngészni.
- **Elfogadási kritériumok:**
  - Választható kategóriák: Fantasy 🧙‍♂️, Sci-Fi 🚀, Mystery 🕵️, Romance 💖, Young Adult 🎒, Classics 🏛️.
  - Kategóriára kattintva szűrt lista jelenik meg.

## ❤️ 5. Kedvencek (Favorites)

### **US - 08 | Könyv mentése kedvencek közé**

- **User Story:** Mint felhasználó, szeretném elmenteni a könyveket későbbre. 🔖
- **Elfogadási kritériumok:**
  - Minden könyv adatlapján található egy **szív (heart)** ikon.
  - Kattintásra a könyv bekerül a `Favorites` listába.

### **US - 09 | Kedvencek megtekintése**

- **User Story:** Mint felhasználó, szeretném gyorsan elérni a mentett könyveimet. 📚
- **Elfogadási kritériumok:**
  - A Favorites oldal listázza az összes elmentett tételt.
  - Adatok: borítókép, cím, szerző.

### **US - 10 | Könyv eltávolítása a kedvencekből**

- **User Story:** Mint felhasználó, szeretném rendezni a listámat és törölni, ami már nem kell. 🗑️
- **Elfogadási kritériumok:**
  - Eltávolítás ikon (X vagy kuka) a mentett könyvek mellett.
  - Megnyomásra a könyv azonnal eltűnik a listából.

## 👤 6. Profil (Profile)

### **US - 11 | Profil megtekintése**

- **User Story:** Mint felhasználó, szeretném látni a saját adataimat. 🖼️
- **Elfogadási kritériumok:**
  - Megjelenő adatok: profilkép, felhasználónév, e-mail cím.

### **US - 12 | Profil szerkesztése**

- **User Story:** Mint felhasználó, szeretném frissíteni a személyes adataimat. ⚙️
- **Elfogadási kritériumok:**
  - Módosítható mezők: név, profilkép.

### **US - 13 | Kijelentkezés**

- **User Story:** Mint felhasználó, szeretnék biztonságosan kijelentkezni. 🚪
- **Elfogadási kritériumok:**
  - Látható **Logout** gomb a profil oldalon.
  - Kattintás után a munkamenet lezárul.
  - Visszairányítás a bejelentkezési (Login) képernyőre.
