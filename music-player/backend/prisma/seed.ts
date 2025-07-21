import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.song.createMany({
    data: [
      {
        title: 'Pink Venom',
        artist: 'BLACKPINK',
        album: 'Born Pink',
        year: 2022,
        coverUrl: 'https://i.imgur.com/9OYF2Ek.jpeg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
      },
      {
        title: 'Feel Special',
        artist: 'TWICE',
        album: 'Feel Special',
        year: 2019,
        coverUrl: 'https://i.imgur.com/1xkX8l6.jpeg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      },
      {
        title: 'Shut Down',
        artist: 'BLACKPINK',
        album: 'Born Pink',
        year: 2022,
        coverUrl: 'https://i.imgur.com/Yff2aQq.jpeg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
      },
      {
        title: 'Dream',
        artist: 'I.O.I',
        album: 'Single',
        year: 2016,
        coverUrl: 'https://i.imgur.com/wuuVEOF.jpeg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
      },
      {
        title: 'Tell Me',
        artist: 'WONDER GIRLS',
        album: 'The Wonder Years',
        year: 2007,
        coverUrl: 'https://i.imgur.com/U6i3mGZ.jpeg',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
      }
    ]
  });

  console.log('🌱 Seed done');
}

main().finally(() => prisma.$disconnect());
