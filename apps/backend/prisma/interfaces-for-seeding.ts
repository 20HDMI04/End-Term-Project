// --- INTERFACES ---

export interface OLValue {
  type: string;
  value: string;
}

export interface OLRatings {
  summary: {
    average: number;
    count: number;
  };
  counts: {
    [key: string]: number;
  };
}

export interface AuthorDetails {
  key: string;
  name: string;
  bio?: string | OLValue;
  birth_date?: string;
  photos?: number[];
}

export interface BookOverall {
  key: string;
  title: string;
  author_key?: string[];
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
}

export interface BookDetails {
  key: string;
  title: string;
  description?: string | OLValue;
  subjects?: string[];
  excerpts?: { excerpt: string }[];
}

// --- NORMALIZERS ---

export class AuthorNormalizer {
  static normalize(data: AuthorDetails) {
    const olid = data.key.split('/').pop() || '';
    const bioText =
      typeof data.bio === 'object'
        ? data.bio.value
        : data.bio || 'No biography available.';

    let parsedDate: Date | null = null;
    if (data.birth_date) {
      const d = new Date(data.birth_date);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    const defaultAvatar =
      process.env.PLACEHOLDER_FOR_AUTHOR_IMAGE ||
      'https://placehold.co/200x300/e2e8f0/475569?text=No+Photo';

    let photoUrl = defaultAvatar;
    if (data.photos?.[0]) {
      photoUrl = `https://covers.openlibrary.org/b/id/${data.photos[0]}-L.jpg`;
    } else {
      photoUrl = `https://covers.openlibrary.org/a/olid/${olid}-L.jpg?default=false`;
    }

    return {
      openLibraryId: olid,
      name: data.name,
      bio: bioText,
      birthDate: parsedDate,
      smallerProfilePic: photoUrl.replace('-L.jpg', '-M.jpg'),
      biggerProfilePic: photoUrl,
    };
  }
}

export class BookDetailsNormalizer {
  private static readonly BLACKLIST = [
    'nyt:',
    'series:',
    'collectionid:',
    'lccn:',
    'oclc:',
    'id:',
    'place:',
    'time:',
    'person:',
    'accessible',
    'protected',
  ];
  static normalize(details: BookDetails) {
    let desc =
      typeof details.description === 'object'
        ? details.description.value
        : details.description || '';

    // Itt kezeltük a hibát: safe check az excerpts-re
    if (!desc && details.excerpts?.length) {
      desc =
        'Notable Excerpts:\n' +
        details.excerpts.map((e) => `"${e.excerpt}"`).join('\n\n');
    }

    const rawSubjects = details.subjects || [];
    const cleanSubjects = rawSubjects
      .map((s) => s.toLowerCase().trim())
      .filter((s) => s.length > 2 && s.length < 30)
      .filter((s) => !this.BLACKLIST.some((bad) => s.includes(bad)))
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

    return {
      description: desc || 'No description available.',
      subjects: [...new Set(cleanSubjects)],
    };
  }

  static normalizeRatings(ratings?: OLRatings) {
    return {
      averageRating: ratings?.summary?.average
        ? parseFloat(ratings.summary.average.toFixed(2))
        : 0,
      ratingCount: ratings?.summary?.count || 0,
    };
  }
}

export class BookOverallNormalizer {
  static normalize(overall: BookOverall) {
    const olid = overall.key.split('/').pop() || '';

    const allIsbns = Array.isArray(overall.isbn) ? overall.isbn : [];
    const cleanIsbns = [
      ...new Set(
        allIsbns.filter((isbn) => typeof isbn === 'string' && isbn.length > 5),
      ),
    ];

    const defaultCover =
      process.env.PLACEHOLDER_FOR_COVER_IMAGE ||
      'https://placehold.co/200x300/e2e8f0/475569?text=No+Cover';

    let coverUrl = defaultCover;
    if (overall.cover_i) {
      coverUrl = `https://covers.openlibrary.org/b/id/${overall.cover_i}-L.jpg`;
    } else if (olid) {
      coverUrl = `https://covers.openlibrary.org/b/olid/${olid}-L.jpg?default=false`;
    }

    return {
      openLibraryId: overall.key,
      title: overall.title,
      publishYear: overall.first_publish_year || 0,
      isbns: cleanIsbns || [],
      coverUrlBigger: coverUrl,
      coverUrlSmall: coverUrl.replace('-L.jpg', '-M.jpg'),
    };
  }
}
