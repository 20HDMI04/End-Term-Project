import { PrismaClient } from '../generated/prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';
import {
  BookOverallNormalizer,
  BookDetailsNormalizer,
  AuthorNormalizer,
} from './interfaces-for-seeding';
const prisma = new PrismaClient();

//https://openlibrary.org/search.json?q=subject:fiction&sort=want_to_read&limit=50

// contact due to rate limiting
const apiClient = axios.create({
  headers: {
    'User-Agent': 'Readsy/1.0 (contact: heropista@gmail.com)',
  },
});
// Simple sleep function to respect API rate limits
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Progress bar for console
function drawProgressBar(current: number, total: number, title: string) {
  const width = 20;
  const progress = Math.round((current / total) * width);
  const percent = Math.round((current / total) * 100);
  const bar = '█'.repeat(progress) + '-'.repeat(width - progress);

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(
    `[${bar}] ${percent}% | ${current}/${total} | Aktuális: ${title.substring(0, 25)}...`,
  );
}

console.log('Seeding...');
dotenv.config();
async function main() {
  const limit = 50;
  const { data: searchData } = await apiClient.get(
    `https://openlibrary.org/search.json?q=subject:fiction&sort=want_to_read&limit=${limit}`,
  );
  const books = searchData.docs;

  for (let i = 0; i < books.length; i++) {
    const doc = books[i];
    const currentStep = i + 1;

    // Progress bar update
    drawProgressBar(currentStep, limit, doc.title);

    try {
      // DATA FETCHING (Parallel fetching of details and ratings for speed)
      // Still waiting a bit before requests
      await sleep(1000);

      const [detailsRes, ratingsRes] = await Promise.all([
        apiClient.get(`https://openlibrary.org${doc.key}.json`),
        apiClient
          .get(`https://openlibrary.org${doc.key}/ratings.json`)
          .catch(() => ({ data: null })),
      ]);

      // NORMALIZATION
      const baseInfo = BookOverallNormalizer.normalize(doc);
      const detailedInfo = BookDetailsNormalizer.normalize(detailsRes.data);
      const stats = BookDetailsNormalizer.normalizeRatings(ratingsRes.data);
      await sleep(1000);

      // FETCHING EDITIONS (for ISBNs)
      const { data: editionsData } = await apiClient.get(
        `https://openlibrary.org${doc.key}/editions.json`,
      );

      let latestYear: number | null = null;
      const pageNumbers: number[] = [];
      const isbnSet = new Set<string>();
      let originalPublisher: string | null = null;

      if (editionsData.size && editionsData.entries) {
        editionsData.entries.forEach((edition: any) => {
          // Capture the original publisher from the first edition that has it
          const firstWithPub = editionsData.entries.find(
            (e: any) => e.publishers?.length > 0,
          );
          if (firstWithPub) originalPublisher = firstWithPub.publishers[0];
          // Collect page numbers if available
          if (
            edition.number_of_pages &&
            typeof edition.number_of_pages === 'number'
          ) {
            pageNumbers.push(edition.number_of_pages);
          }
          // Collect ISBNs
          if (edition.isbn_10) {
            edition.isbn_10.forEach((isbn: string) => isbnSet.add(isbn));
          }
          if (edition.isbn_13) {
            edition.isbn_13.forEach((isbn: string) => isbnSet.add(isbn));
          }

          // Determine latest publish year
          if (edition.publish_date) {
            const yearMatch = edition.publish_date.match(/\d{4}/);
            if (yearMatch) {
              const year = parseInt(yearMatch[0], 10);
              if (!latestYear || year > latestYear) {
                latestYear = year;
              }
            }
          }
        });
      }

      const finalIsbns = Array.from(isbnSet);
      let averagePageNumber: number | null = null;
      if (pageNumbers.length > 0) {
        const sum = pageNumbers.reduce((a, b) => a + b, 0);
        averagePageNumber = Math.round(sum / pageNumbers.length);
      }

      // AUTHOR HANDLING
      let authorId: string | null = null;
      if (doc.author_key?.[0]) {
        // Check if the author already exists to save an API call
        const existingAuthor = await prisma.author.findUnique({
          where: { openLibraryId: doc.author_key[0] },
        });

        if (!existingAuthor) {
          const { data: authorRaw } = await apiClient.get(
            `https://openlibrary.org/authors/${doc.author_key[0]}.json`,
          );
          const normalizedAuthor = AuthorNormalizer.normalize(authorRaw);

          authorId = (
            await prisma.author.create({
              data: { ...normalizedAuthor, approveStatus: true },
            })
          ).id;
        } else {
          authorId = existingAuthor.id;
        }
      }

      // SEEDING
      await prisma.book.upsert({
        where: { openLibraryId: baseInfo.openLibraryId },
        update: {
          pageNumber: averagePageNumber ?? undefined,
          latestPublicationYear: latestYear ?? undefined,
          originalPublisher: originalPublisher ?? undefined,
          isbns: {
            connectOrCreate: finalIsbns.map((isbnNum: string) => ({
              where: { isbnNumber: isbnNum },
              create: { isbnNumber: isbnNum },
            })),
          },
          statistics: {
            update: {
              averageRating: stats.averageRating,
              ratingCount: stats.ratingCount,
            },
          },
        },
        create: {
          title: baseInfo.title,
          openLibraryId: baseInfo.openLibraryId,
          description: detailedInfo.description,
          originalPublicationYear: baseInfo.publishYear,
          originalPublisher: originalPublisher,
          smallerCoverPic: baseInfo.coverUrlSmall,
          biggerCoverPic: baseInfo.coverUrlBigger,
          approveStatus: true,
          authorId: authorId,
          latestPublicationYear: latestYear,
          pageNumber: averagePageNumber,
          isbns: {
            create: finalIsbns.map((isbnNum: string) => ({
              isbnNumber: isbnNum,
            })),
          },
          statistics: {
            create: {
              averageRating: stats.averageRating,
              ratingCount: stats.ratingCount,
              readersCount: 0,
              wantToReadCount: 0,
              reviewCount: 0,
            },
          },
          genres: {
            create: detailedInfo.subjects.map((s) => ({
              genre: {
                connectOrCreate: {
                  where: { name: s.substring(0, 30) },
                  create: { name: s.substring(0, 30) },
                },
              },
            })),
          },
        },
      });
    } catch (err) {
      // In case of an error, do not break the progress bar, just print the error below
      if (err.code === 'P2002') {
        // Prisma Unique constraint error
        process.stdout.write(
          `⚠️ Kihagyva (Duplikált ISBN vagy Könyv): ${doc.title}`,
        );
      } else {
        process.stdout.write(`\n❌ Error (${doc.title}): ${err.message}\n`);
      }
    }
  }

  console.log('\n\n✨ Seeding successfully completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
