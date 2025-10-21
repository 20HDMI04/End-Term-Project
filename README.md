<div align="center">

![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

# 🚀 Readsy

Ez a projekt egy modern, teljes értékű monorepo architektúrát valósít meg, a **Turborepo** és a **pnpm** segítségével. Célja a kódmegosztás maximalizálása, a type-safe fejlesztés, és a platformfüggetlen hitelesítés biztosítása.

## 📖 Téma

Azért választottuk ezt a témát mert célunk, hogy áthidaljuk a könyvválasztás nehézségeit, és egy olyan felületet biztosítsunk, ahol a felhasználók:

🧭 **Segítenek egymásnak a könyvválasztásban:** A userek ajánlanak és értékelnek, így könnyű megtalálni a következő kedvencet!

🗣️💬 **Ösztönzi a beszélgetést:** Lehet vitatkozni, megosztani a gondolatokat, és mélyebben elmerülni a könyvek világában.

🫂 **Aktív közösséget épít:** Minél több ember csatlakozik, annál több a segítség és az inspiráció!

## 🌟 Technológiai Stack

| Részleg              | Fő technológia          | Leírás                                                    |
| :------------------- | :---------------------- | :-------------------------------------------------------- |
| **Monorepo Manager** | **Turborepo**           | Gyors buildelés és task futtatás a munkaterületek között. |
| **Csomagkezelő**     | **pnpm**                | Hatékony függőségkezelés szimlinkekkel.                   |
| **Backend**          | **NestJS (Fastify)**    | Skálázható, hatékony szerveroldali alkalmazás.            |
| **Web Frontend**     | **React (Vite)**        | Gyors, modern webes felhasználói felület.                 |
| **Mobil Frontend**   | **React Native (Expo)** | Natív mobilalkalmazások (iOS és Android).                 |
| **Adatbázis ORM**    | **Prisma**              | Type-safe adatbázis-hozzáférés és migrációk.              |
| **Hitelesítés**      | **SuperTokens**         | Session és felhasználókezelés.                            |
| **Séma Validáció**   | **Zod**                 | End-to-end type-safe adatsémák.                           |

---

## 📦 Monorepo Struktúra

A projekt a következő kulcsfontosságú munkaterületeket tartalmazza:

| Mappa               | Leírás                                                                                                                                            |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/backend`      | A **NestJS API** a Fastify adapterrel. Felelős a business logika, adatbázis-kommunikáció és a SuperTokens autentikáció szerveroldali kezeléséért. |
| `apps/web`          | A **React webalkalmazás**, Vite-tel buildelve.                                                                                                    |
| `apps/mobile`       | A **React Native mobilalkalmazás** (Expo-val konfigurálva).                                                                                       |
| `packages/types`    | Megosztott TypeScript interfészek és **Zod sémák**. Biztosítja a type-safe adatcserét a backend és minden frontend között.                        |
| `packages/database` | A **Prisma** konfiguráció (`schema.prisma`), migrációk, és a kliens kód.                                                                          |
| `packages/ui`       | Megosztott UI komponens könyvtár (React és React Native komponensek megosztására).                                                                |
| `packages/tsconfig` | Megosztott `tsconfig.json` fájlok.                                                                                                                |

---

## 🛠️ Beüzemelés (Local Development)

A fejlesztéshez szükséges a **Node.js** (ajánlott v18+) és a **pnpm** telepítése.

### 1\. Függőségek telepítése

Navigálj a gyökérkönyvtárba, és telepítsd az összes munkaterületi függőséget:

```bash
pnpm install
```

### 2\. Környezeti Változók beállítása

Hozd létre a `.env` fájlt a gyökérkönyvtárban és az `apps/backend` mappában a szükséges környezeti változókkal.

**Példa kulcsfontosságú változókra:**

```env
# .env (Gyökér)
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
SUPERTOKENS_URI="http://localhost:3567"
SUPERTOKENS_API_KEY="optional-api-key"
```

### 3\. SuperTokens Core és Adatbázis indítása

A SuperTokens-nek szüksége van egy **SuperTokens Core** szerverre és egy **adatbázisra** (a fenti `DATABASE_URL` alapján).

**Javasolt megközelítés: Docker Compose**

A projekt tartalmaz egy `docker-compose.yml` fájlt, amely elindítja a SuperTokens Core-t és egy PostgreSQL adatbázist:

```bash
docker compose up -d postgres supertokens
```

### 4\. Adatbázis és Prisma

Telepítsd a Prisma sémát az adatbázisra:

```bash
pnpm --filter database db:migrate
pnpm --filter database build
```

_(Ez a parancs futtatja a migrációkat és legenerálja a Prisma klienst a `packages/database` mappában.)_

---

## ▶️ Futtatás

Használd a **`turbo`** parancsot a munkaterületek párhuzamos indításához.

| Parancs                             | Leírás                                                                                                         |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **`pnpm dev`**                      | **Párhuzamosan indítja** a backendet, a webes frontendet és a mobilalkalmazást (ha futtatható a környezetben). |
| **`pnpm run dev --filter backend`** | Csak a NestJS backend indítása.                                                                                |
| **`pnpm run dev --filter web`**     | Csak a React webes frontend indítása.                                                                          |
| **`pnpm run dev --filter mobile`**  | A React Native (Expo) mobilalkalmazás indítása.                                                                |

## 📚 Kódmegosztás (Type-Safety)

A projekt fő erőssége a **type-safety**:

- **Zod Sémák:** Az összes bejövő és kimenő adat validálása a **`@repo/types`** csomagban definiált Zod sémákkal történik, amelyeket mind a NestJS, mind a React alkalmazások importálnak.
- **Prisma Kliens:** A **`@repo/database`** csomag egy megosztott Prisma klienst és típusokat exportál, így a backend kódja mindig típusbiztosan kommunikál az adatbázissal.

## További dokumentációk

- Bővebben az architektúráról [Áttekintés](https://github.com/20HDMI04/End-Term-Project/blob/main/documentation/overview.md)

## 👤 Tagok

[Hegedűs Péter](https://github.com/LepkefingLeo)<br>
[Balogh János Péter](https://github.com/20HDMI04)<br>
[Szalontai Csekő](https://github.com/Cs3k0)
