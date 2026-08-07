import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial media entries for Kino...');

  await prisma.vote.deleteMany();
  await prisma.post.deleteMany();

  const posts = [
    {
      slug: 'interstellar-2014',
      title: 'Interstellar',
      mediaType: 'MOVIE',
      releaseYear: 2014,
      genre: 'Sci-Fi, Drama, Adventure',
      director: 'Christopher Nolan',
      cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
      plot: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      posterUrl: 'https://m.media-amazon.com/images/M/MVB0NmEwOWI4NDgtZGNjNi00Y2VmLWEzM2UtNzNmYjhkMDU3MmVlXkEyXkFqcGc@._V1_SX300.jpg',
      imdbRating: '8.7/10',
      userRating: 5.0,
      isFeatured: true,
      isPublished: true,
      tags: 'Masterpiece,SciFi,Emotional,HansZimmer',
      likesCount: 142,
      dislikesCount: 3,
      review: `Christopher Nolan's *Interstellar* is not merely a sci-fi epic; it is a profound meditation on human endurance, love, and time across the vast void of space.

Hans Zimmer's pipe-organ score echoes like a cosmic hymn, elevating every scene into pure awe. From the terrifying silence of the wormhole near Saturn to the heart-wrenching time dilation on Miller's wave planet where every hour equals seven years on Earth, Nolan grounds astronomical physics in visceral human emotion.

Matthew McConaughey delivers a career-defining performance as Cooper. The scene where he watches 23 years of video logs from his children in a single sitting remains one of the most heartbreaking sequences in modern cinema history. A true 5-star cinematic monument.`,
    },
    {
      slug: 'severance-2022',
      title: 'Severance',
      mediaType: 'TV',
      releaseYear: 2022,
      genre: 'Drama, Mystery, Sci-Fi, Thriller',
      director: 'Ben Stiller, Aoife McArdle',
      cast: 'Adam Scott, Zach Cherry, Britt Lower, Patricia Arquette, John Turturro',
      plot: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.',
      posterUrl: 'https://m.media-amazon.com/images/M/MVB0NmU4MWU0MTctNWJkYy00ZjZhLTg1NWEtNGEwNTJiMmI5MzZjXkEyXkFqcGc@._V1_SX300.jpg',
      imdbRating: '8.7/10',
      userRating: 4.5,
      isFeatured: false,
      isPublished: true,
      tags: 'MindBending,Thriller,MustWatch,Dystopian',
      likesCount: 98,
      dislikesCount: 2,
      review: `*Severance* is a masterclass in atmospheric tension, corporate satire, and psychological horror. Ben Stiller's direction turns sterile white office hallways into a haunting labyrinth.

The concept—surgically separating work memories ("Innie") from personal life ("Outie")—raises dark philosophical questions about identity, trauma, and bodily autonomy. Adam Scott leads a stellar cast, supported by unforgettable turns from John Turturro and Christopher Walken.

The Season 1 finale remains one of the most tense, edge-of-your-seat cliffhangers in modern television history.`,
    },
    {
      slug: 'my-octopus-teacher-2020',
      title: 'My Octopus Teacher',
      mediaType: 'DOCUMENTARY',
      releaseYear: 2020,
      genre: 'Documentary, Wildlife',
      director: 'Pippa Ehrlich, James Reed',
      cast: 'Craig Foster',
      plot: 'A filmmaker forged an unusual friendship with an octopus living in a South African kelp forest, learning as the animal shares the mysteries of her world.',
      posterUrl: 'https://m.media-amazon.com/images/M/MVB0NWQ2MDFmNTgtMmY3OC00ZGNmLWFkMzctZTZmYmMxOTAzMGIyXkEyXkFqcGc@._V1_SX300.jpg',
      imdbRating: '8.1/10',
      userRating: 4.5,
      isFeatured: false,
      isPublished: true,
      tags: 'Documentary,Nature,Poetic,OscarWinner',
      likesCount: 76,
      dislikesCount: 1,
      review: `An extraordinary, deeply touching documentary that transforms an underwater kelp forest in False Bay into a sanctuary of wonder and healing.

Craig Foster's daily dives without a wetsuit or oxygen tank foster an intimate, year-long connection with a wild octopus. The intelligence, curiosity, and emotional depth demonstrated by this sea creature redefine how we perceive animal consciousness. Underwater photography is breathtakingly sublime.`,
    },
    {
      slug: 'spirited-away-2001',
      title: 'Spirited Away',
      mediaType: 'ANIME',
      releaseYear: 2001,
      genre: 'Animation, Adventure, Family, Fantasy',
      director: 'Hayao Miyazaki',
      cast: 'Rumi Hiiragi, Miyu Irano, Mari Natsuki, Takashi Naito',
      plot: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
      posterUrl: 'https://m.media-amazon.com/images/M/MVB0MzlkNWVhNWQtZWE2NC00NWQ2LWIwZGUtMmRkNWQ2NTBkOWFiXkEyXkFqcGc@._V1_SX300.jpg',
      imdbRating: '8.6/10',
      userRating: 5.0,
      isFeatured: false,
      isPublished: true,
      tags: 'Ghibli,Animation,Classic,Fantasy',
      likesCount: 215,
      dislikesCount: 4,
      review: `Hayao Miyazaki's *Spirited Away* is hand-drawn animation elevated to sacred art. Chihiro's journey through the bathhouse of spirits is rich with Japanese mythology, environmental themes, and coming-of-age vulnerability.

Every frame overflows with vivid color, detail, and imagination—from No-Face's silent melancholy to Haku's majestic dragon form. Joe Hisaishi's piano score (*One Summer's Day*) remains pure magic.`,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: post,
    });
    console.log(`Created entry: ${post.title}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
