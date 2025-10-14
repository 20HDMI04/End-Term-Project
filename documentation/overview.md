## Architektúra Dokumentáció: Full-Stack Monorepo Projekt

Ez a dokumentum a projekt architekturális felépítését, a használt technológiákat és a fejlesztési alapelveket mutatja be.

### 1. Teljes Áttekintés

A projekt egy **monorepo architektúrára** épül, melynek célja a kód és a típusdefiníciók maximális megosztása a különböző alkalmazások (backend, web, mobil) között. A rendszert a **Turborepo** és a **pnpm** eszközök menedzselik, biztosítva a gyors és hatékony fejlesztői környezetet.

Az architektúra három fő pilléren nyugszik:

1. **Backend Szolgáltatás:** Egy központi NestJS API, amely az üzleti logikáért és az adatkezelésért felel.
    
2. **Frontend Kliensek:** Egy webes és egy mobilalkalmazás, amelyek a backend API-t használják.
    
3. **Megosztott Csomagok:** Közös, újrahasznosítható kódok (típusok, adatbázis kliens, UI komponensek), amelyek garantálják a konzisztenciát és a type-safety-t a teljes stacken.
    

---

### 2. Backend Architektúra (`apps/backend`)

A backend a rendszer agya, amely minden üzleti logikát és adatfeldolgozást végez.

#### Fő technológiák

- **Keretrendszer:** **NestJS** a moduláris, skálázható és karbantartható szerkezetért.
    
- **Szerver:** **Fastify** adapter a nagy teljesítményű, alacsony overhead-ű HTTP kérések kezeléséért.
    
- **Hitelesítés:** **SuperTokens** a robusztus, platformfüggetlen felhasználó- és session-kezelésért.
    

#### Felépítés és Felelősségek

- **Moduláris Architektúra:** A funkcionalitás NestJS modulokba van szervezve. 
    
- **API és Adatvalidáció:**
    
    - A bejövő kérések (request body, query params) **Zod sémákkal** történik.
        
    - Ez a megközelítés garantálja, hogy a backend csak validált, típushelyes adatokat dolgoz fel, megelőzve a futásidejű hibákat.
        
- **Hitelesítés és Jogosultságkezelés:**
    
    - A SuperTokens szerveroldali SDK-ja integrálva van a NestJS alkalmazásba.
        
    - A végpontok védelmét NestJS **Guard**-ok biztosítják, amelyek ellenőrzik a bejövő kérések session-jeit a SuperTokens Core-ral kommunikálva.
        
- **Adatbázis-kommunikáció:** A backend **Prisma Kliensen** keresztül kommunikál az adatbázissal. Ez biztosítja, hogy minden adatbázis-művelet összhangban van az adatbázis sémájával.
    

---

### 3. Frontend Architektúra (`apps/web` & `apps/mobile`)

A frontend réteg felelős a felhasználói felület megjelenítéséért és az interakciók kezeléséért.

#### Fő technológiák

- **Web:** **React (Vite)** a gyors, modern és hatékony webes fejlesztésért.
    
- **Mobil:** **React Native (Expo)** a natív iOS és Android alkalmazások egy közös kódbázisból történő fejlesztéséért.
    

#### Struktúra és Kódmegosztás

- **Központi API Kommunikáció:** Mind a webes, mind a mobilalkalmazás a NestJS backend által biztosított REST API-val kommunikál.
    
- **Típusbiztos Adatkezelés:** Az API hívások során a frontendek a `packages/types` csomagban definiált **TypeScript interfészeket és Zod sémákat** használják. Ez lehetővé teszi, hogy a kliensoldali kód pontosan tudja, milyen adatstruktúrát várhat a backendtől, így elkerülhetők az adat-inkonzisztenciák.
    
- **Hitelesítési Folyamat:** A felhasználói bejelentkezést, regisztrációt és session-kezelést a SuperTokens frontend SDK-i végzik, amelyek zökkenőmentesen működnek együtt a backenddel.
    

---

### 4. Adatbázis Architektúra (`packages/database`)

Az adatbázis réteg a perzisztens adattárolásért felelős.

#### Fő technológiák

- **Adatbázis motor:** **PostgreSQL** (Dockerizált környezetben futtatva a konzisztens fejlesztői élményért).
    
- **ORM:** **Prisma** a séma menedzseléséért, a migrációkért és a típusbiztos adatbázis-hozzáférésért.
    
#### Felépítés és Működés
    
- **Migrációk:** Az adatbázis séma változtatásait a Prisma Migrate kezeli. Minden változás egy új, verziókövetett migrációs fájlban kerül rögzítésre, ami lehetővé teszi az adatbázis állapotának konzisztens kezelését minden környezetben.
        
---

### 5. Fejlesztési Folyamat és Alapelvek

- **Indítás:** A teljes ökoszisztéma (PostgreSQL, SuperTokens, Backend, Frontend) a `docker compose up -d` és `pnpm dev` parancsokkal indítható.
    
- **Kódmegosztás:** A `packages/*` mappákban lévő kód célja, hogy a lehető legnagyobb mértékben újrahasznosítható legyen. Bármilyen, több alkalmazást érintő logikát vagy típust itt kell elhelyezni.
    
- **End-to-End Type Safety:** A **Zod**, a **Prisma** és a **TypeScript** együttes használata garantálja a típusbiztonságot az adatbázistól a felhasználói felületig. Ez a projekt egyik legfontosabb architekturális előnye, ami jelentősen csökkenti a hibák számát és növeli a fejlesztési sebességet.
