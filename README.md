# 🚀 Full-Stack Monorepo Projekt

Ez a projekt egy modern, teljes értékű monorepo architektúrát valósít meg, a **Turborepo** és a **pnpm** segítségével. Célja a kódmegosztás maximalizálása, a type-safe fejlesztés, és a platformfüggetlen hitelesítés biztosítása.

## 🌟 Technológiai Stack

| Részleg | Fő technológia | Leírás |
| :--- | :--- | :--- |
| **Monorepo Manager** | **Turborepo** | Gyors buildelés és task futtatás a munkaterületek között. |
| **Csomagkezelő** | **pnpm** | Hatékony függőségkezelés szimlinkekkel. |
| **Backend** | **NestJS (Fastify)** | Skálázható, hatékony szerveroldali alkalmazás. |
| **Web Frontend** | **React (Vite)** | Gyors, modern webes felhasználói felület. |
| **Mobil Frontend** | **React Native (Expo)** | Natív mobilalkalmazások (iOS és Android). |
| **Adatbázis ORM** | **Prisma** | Type-safe adatbázis-hozzáférés és migrációk. |
| **Hitelesítés** | **SuperTokens** | Session és felhasználókezelés. |
| **Séma Validáció** | **Zod** | End-to-end type-safe adatsémák. |

-----

## 📦 Monorepo Struktúra

A projekt a következő kulcsfontosságú munkaterületeket tartalmazza:

| Mappa | Leírás |
| :--- | :--- |
| `apps/backend` | A **NestJS API** a Fastify adapterrel. Felelős a business logika, adatbázis-kommunikáció és a SuperTokens autentikáció szerveroldali kezeléséért. |
| `apps/web` | A **React webalkalmazás**, Vite-tel buildelve. |
| `apps/mobile` | A **React Native mobilalkalmazás** (Expo-val konfigurálva). |
| `packages/types` | Megosztott TypeScript interfészek és **Zod sémák**. Biztosítja a type-safe adatcserét a backend és minden frontend között. |
| `packages/database` | A **Prisma** konfiguráció (`schema.prisma`), migrációk, és a kliens kód. |
| `packages/ui` | Megosztott UI komponens könyvtár (React és React Native komponensek megosztására). |
| `packages/tsconfig` | Megosztott `tsconfig.json` fájlok. |

-----

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

*(Ez a parancs futtatja a migrációkat és legenerálja a Prisma klienst a `packages/database` mappában.)*

-----

## ▶️ Futtatás

Használd a **`turbo`** parancsot a munkaterületek párhuzamos indításához.

| Parancs | Leírás |
| :--- | :--- |
| **`pnpm dev`** | **Párhuzamosan indítja** a backendet, a webes frontendet és a mobilalkalmazást (ha futtatható a környezetben). |
| **`pnpm run dev --filter backend`** | Csak a NestJS backend indítása. |
| **`pnpm run dev --filter web`** | Csak a React webes frontend indítása. |
| **`pnpm run dev --filter mobile`** | A React Native (Expo) mobilalkalmazás indítása. |

## 📚 Kódmegosztás (Type-Safety)

A projekt fő erőssége a **type-safety**:

  * **Zod Sémák:** Az összes bejövő és kimenő adat validálása a **`@repo/types`** csomagban definiált Zod sémákkal történik, amelyeket mind a NestJS, mind a React alkalmazások importálnak.
  * **Prisma Kliens:** A **`@repo/database`** csomag egy megosztott Prisma klienst és típusokat exportál, így a backend kódja mindig típusbiztosan kommunikál az adatbázissal.