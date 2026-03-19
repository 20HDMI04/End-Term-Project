# Readsy Library - Setup Útmutató

Ez az útmutató végigvezet a Readsy Library backend és web frontend telepítésén és futtatásán.

## Előfeltételek

Győződj meg róla, hogy a következők telepítve vannak a gépen:

- ✅ Node.js (v18 vagy újabb)
- ✅ Docker
- ✅ Git
- ✅ Visual Studio Code (ajánlott IDE)
- ✅ Google Cloud Console ismeretek
- ✅ Expo Env Változók beállítva buildnél

## 1. Projekt Klónozása

```bash
git clone <repository-url> End-Term-Project-Books
cd End-Term-Project-Books
```

## 2. PNPM Telepítése

Mivel a projekt pnpm-et használ csomagkezelőnek, először telepítsd globálisan:

```bash
npm install -g pnpm
```

Ellenőrizd a telepítést:

```bash
pnpm --version
```

## 3. Függőségek Telepítése

Telepítsd a projekt összes függőségét a gyökérkönyvtárból:

```bash
pnpm install
```

Ez telepíti az összes szükséges csomagot a monorepo összes alkalmazásához (backend, web, mobile).

## 4. Környezeti Változók Beállítása

### Backend `.env` fájl

Hozz létre egy `.env` fájlt az `apps/backend/` mappában a következő tartalommal a `.env.example`-ben meg vannak adva ezek:

```env
# Database Configuration
DATABASE_URL="postgresql://admin:admin@127.0.0.1:5432/libraryDb"
DB_USER="admin"
DB_PASSWORD="admin"
DB_NAME="libraryDb"

# Google OAuth (ha nem feltétlenül akarod használni a passwordless bejelentkezést akkor ezt nem kell configolni)
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"

# SuperTokens Database
POSTGRES_USER="supertokens_user"
POSTGRES_PASSWORD="supertokens_password"
POSTGRES_DB="supertokens"

# Admin Email
email_admin="YOUR_ADMIN_EMAIL"

# Akit regisztrálni fogsz majd mint user annak az email címét add meg itt!

# Google Books API
GOOGLE_BOOKS_API_KEY="YOUR_GOOGLE_API_KEY"

# AWS S3 (LocalStack)
AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY(bármi lehet csak biztonságos legyen)"
AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY(bármi lehet csak legyen biztonságos)"
AWS_DEFAULT_REGION="eu-central-1"

S3_ENDPOINT="http://localhost:4566"
S3_BOOK_COVERS_BUCKET_NAME="book-covers"
S3_PROFILE_PICTURES_BUCKET_NAME="user-pictures"
S3_AUTHOR_IMAGES_BUCKET_NAME="author-images"

# Placeholder Images
PLACEHOLDER_FOR_COVER_IMAGE="http://localhost:4566/book-covers/default-book.jpg"
PLACEHOLDER_FOR_PROFILE_PICTURE="http://localhost:4566/user-pictures/anonymous-user.webp"
PLACEHOLDER_FOR_AUTHOR_IMAGE="http://localhost:4566/author-images/author-default.png"
```

### Mobile `.env` fájl

Hozz létre egy `.env` fájlt az `apps/mobile/` mappában a következő tartalommal a `.env.example`-ben meg vannak adva ezek:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
```

## 5. Docker Konténerek Indítása

> ⚠️ **Figyelem** !!!
> Az `apps/backend/localstack/init-aws.sh` fájl ami a default képek és a bucketek létrehozásáért felel meglehet hogy `CRLF`-ben van ebben az esetben nem fog lefutni normálisan mikor a docker létrehozza a konténereket ezért át kell állítani `LF`-be mindenképpen.

A projekt PostgreSQL adatbázist, SuperTokens-t és LocalStack S3-at használ ezt docker compose segítségével. Hogy elindítsd a Docker konténereket ezeket a command-okat használd ha a root directoryba vagy:

```bash
cd ./apps/backend
docker compose up -d
```

Ez elindítja:

- PostgreSQL adatbázist (port: 5432)
- SuperTokens core-t az adatbázisával
- LocalStack-et (S3 szolgáltatás, port: 4566)

Ellenőrizd, hogy minden konténer fut:

```bash
docker ps
```

Vagy ha van Docker Desktop akkor nézd meg ott!

> 🗨️ **Megjegyzés**
> Ha van localstack account-od azon keresztül az S3 bucket tartalmát is ellenőrizheted hogy helyesen létrejött-e

## 6. Prisma Adatbázis Migráció

Futtasd a Prisma migrációkat az adatbázis sémájának létrehozásához:

```bash
cd apps/backend
npx prisma migrate deploy
```

ÉS

Hozzuk létre a prisma klienst (ha nem vagy a backend directoryban cd-z vissza oda):

```bash
npx prisma generate
```

> 🗨️ **Megjegyzés**
> Ha esetleg nem működne érdemes lefuttatni még egy `npx prisma db push`-t is.

## 7. Adatbázis Seed (Opcionális)

⚠️ **FIGYELEM**: A seed szkript külső API-kat használ (Open Library Api), amelyek IP-alapú rate limiting-et alkalmazhatnak. **Ne futtasd túl gyakran**, különösen ne többször egymás után!

Csak akkor futtasd, ha üres az adatbázis és tesztadatokra van szükség:

```bash
cd apps/backend
npx prisma db seed
```

**Tipp**: Ha már egyszer lefuttattad a seedet és megvannak az adatok, ne futtasd újra, kivéve ha teljesen törölted az adatbázist.

## 8. S3 Buckets Inicializálása (LocalStack)

A bucketek egy shell script segítségével jönnek létre és a seedelés is azzal történik így alapvetően ezzel nincs több dolgod.

## 9. Alkalmazások Indítása

### Backend indítása

Fejlesztéshez használd:

```bash
pnpm run dev --filter=backend
```

A backend alapértelmezés szerint a **http://localhost:3002** címen fut.

### Web Frontend indítása

Fejlesztéshez használd:

```bash
pnpm run dev --filter=web
```

A web frontend alapértelmezés szerint a **http://localhost:5173** címen fut.

### Mobil alkalmazás fejlesztése/buildelése

> ❗ **Fontos**❗
> Mindenképpen a mobil directory-ban legyél mert különben nem fog működni.
> Ezenkívül az alkalmazás Android-ra készült ezért kérlek vedd figyelembe hogy alapból csak Android-ra buildeltem ebben a projektben.

A mobil nem futtatható Expo Go funkcióval mivel a projekt igényli az SHA-1-es certificatet amelyhez létre kell hozz egy eas buildet és ezt meg kell adnod a Google Cloud Console-ban:

Ha egy preview build-et akarsz készíteni használd ezt:

```bash
eas build --platform android --profile preview
```

Abban az esetben ha dev buildet akarsz akkor futtasd ezt:

```bash
eas build --platform android --profile development
```

Amennyiben megakarod kapni az SHA-1 -es kulcsot amit generált az expo és meg szeretnéd adni a Google Cloud Console-ban akkor futtasd ezt:

```bash
npx eas credentials
```

## 10. Alkalmazás Elérése

Nyisd meg a böngésződben:

- **Frontend**: http://localhost:5173

## Hasznos Parancsok

### Docker konténerek leállítása

⚠️ **FIGYELEM**: Ilyenkor elveszhetnek a volume-ok és az adatok is amelyek abban voltak illetve a supertokensben lévő adatok deszinkronizálódhatnak a prisma által létrehozott adatbázissal ekkor le kell törölni az összes volume-ot és újra setupolni az adatbázisokat pl.: prisma migrációkat.

```bash
docker compose down
```

### Összes függőség újratelepítése

⚠️ **FIGYELEM**: Amennyiben újra töltöd a függőségeket fontos hogy tudd hogy mivel ez egy monorepo-s projekt és így van beállítva ezért a prisma a **node_modules**-ba generálja a klienst ezért ilyenkor újra kell futtatni az `npx prisma db push` és `npx prisma generate` parancsokat.

```bash
pnpm install --force
```

### Hasznos Expo parancsok

Mivel az expo sokkal jobban tudja hogy mik minek a függőségei érdemesebb inkább ezt a parancsot használni ha mobil függőségeket telepítesz nem pedig a `pnpm add`-ot

```bash
npx expo install
```

Ez a parancs ellenőrzi ha valamilyen függőség verziója deprecated vagy a verziók mismatch-elnek

```bash
npx expo install --check
```

Ez a parancs ellenőrzi ha van valami ami a projektben rosszul configolt

```bash
pnpm run expo doctor
```

## Hibaelhárítás

### Adatbázis kapcsolódási hiba

- Ellenőrizd, hogy a Docker konténerek futnak: `docker ps`
- Ellenőrizd a `DATABASE_URL`-t a `.env` fájlban
- Próbáld újraindítani a PostgreSQL konténert: `docker compose restart <container-name>`

### Port már használatban

- Backend (3002): Ellenőrizd, hogy nincs-e más alkalmazás a 3002-es porton
- Frontend (5173): Ellenőrizd, hogy nincs-e más Vite projekt futva
- PostgreSQL (5432 és 5431): Győződj meg róla, hogy nincs lokális PostgreSQL futva
- LocalStack (4566 és 4571): Győződj meg róla hogy ezen a portokon sem fut semmi

### Prisma migráció hibák

- Töröld az adatbázist és indítsd újra: `docker compose down -v && docker compose up -d`
- Futtasd újra a migrációkat

### Open Library rate limiting

- Várj néhány órát vagy egy napot a seed újrafuttatása előtt
- Használj VPN-t vagy más hálózatot

## Tesztek és Dokumentáció

A teszteléshez **Vitest**-et használtunk a dokumentációhoz pedig **Typedoc**-ot és **Swagger**-t ahhoz hogy futtasd a Unit teszteket használd az alábbi parancsokat:

```bash
npx vitest
```

---

Ahhoz hogy a részletesebb dokumentáció is elérhető legyen ahol inkább a service-k vannak dokumentálva ahhoz kérlek használd ezt a parancsot:

```bash
npx typedoc
```

> 🗨️ **Megjegyzés**
> A typedoc egy html-ekből álló multipage dokumentációt készít majd ahhoz hogy megnyithasd keresd meg a fő html-t és azt nyisd meg, Live Server használata ajánlott.
> A másik dokumentációt (Swagger) akkor tudod megnyitni ha fut a backend a `http://localhost:3002/docs` címen. Fontosnak tartom megjegyezni ,hogy a végpontok Role és Session Guard-dal védettek emiatt kipróbálásukat csak éles alkalmazásban tudjuk megtenni Swagger-en belül nem.

## Projekt Struktúra

```
End-Term-Project-Books/
│
├── apps/
│   ├── backend/                 # NestJS Backend API
│   │   ├── prisma/             # Prisma schema & migrations
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seed-external.ts  # Database seed script
│   │   ├── src/                # Backend source code
│   │   ├── .env                # Backend environment variables
│   │   ├── docker-compose.yml           # Szolgáltatások
│   │   └── package.json
│   │
│   ├── web/                     # React + Vite Frontend
│   │   ├── src/                # Frontend source code
│   │   ├── .env                # Web environment variables
│   │   └── package.json
│   │
│   └── mobile/                  # React Native Expo App (nem szükséges)
│       ├── .env
│       └── package.json
│
├── packages/                    # Megosztott csomagok (ha vannak)
│
├── package.json                 # Gyökér package.json (workspace)
├── pnpm-workspace.yaml          # PNPM workspace konfiguráció
└── SETUP.md                     # Ez a fájl
```

### Fontosabb mappák és fájlok

```
📦 End-Term-Project-Books
├── 📂 apps
│   ├── 📂 backend
│   │   ├── 📂 prisma
│   │   │   ├── 📄 schema.prisma        # Adatbázis séma definíció
│   │   │   ├── 📂 migrations           # Verziókezelt DB változások
│   │   │   └── 📄 seed-external.ts     # Kezdő adatok betöltése
│   │   ├── 📂 src
│   │   │   ├── 📂 auth                 # Authentikáció (Google OAuth)
│   │   │   ├── 📂 books                # Könyv kezelés
│   │   │   ├── 📂 authors              # Szerző kezelés
│   │   │   ├── 📂 users                # Felhasználó kezelés
│   │   │   └── 📄 main.ts              # Backend belépési pont
│   │   ├── 📄 docker-compose.yml       # Docker szolgáltatások
│   │   └── 📄 .env                     # Backend konfiguráció
│   │
│   ├── 📂 web
│   │   ├── 📂 src
│   │   │   ├── 📂 components           # React komponensek
│   │   │   ├── 📂 assets               # Assetek
│   │   │   └── 📄 main.tsx             # Frontend belépési pont
│   │   └── 📄 .env                     # Web konfiguráció
│   │
│   └── 📂 mobile                       #
│
├── 📄 package.json                     # Workspace definíció
├── 📄 pnpm-workspace.yaml              # PNPM workspace config
└── 📄 SETUP.md                         # Setup dokumentáció
```

## Következő Lépések

Miután minden fut:

1. Regisztrálj egy új felhasználót (ha adtál meg admin email-t akkor érdemes azzal belépni) a webes felületen (ha nem configoltad a saját google cloud serviced ne próbáld ki a passwordless bejelentkezést)
2. Böngészd a könyveket (ha futott a seed)
3. Fedezd fel az API dokumentációt (Swagger: http://localhost:3002/docs)
