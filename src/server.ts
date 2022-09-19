import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { convertHoursStringToMinutes } from './utils/convert-hours-string-to-minutes';
import { convertMinutesToHoursString } from './utils/convert-minutes-to-hours-string';
const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();


app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({ include: { _count: true } });

    return response.json(games);
})

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const { name, yearsPlaying, discord, weekDays, hourEnd, hourStart, useVoiceChannel } = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name,
            yearsPlaying,
            discord,
            weekDays: weekDays.join(','),
            hourStart: convertHoursStringToMinutes(hourStart.toString()),
            hourEnd: convertHoursStringToMinutes(hourEnd.toString()),
            useVoiceChannel,
        }
    })
    return response.json(ad);

})

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const ads: any = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            createdAt: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'asc',
        }
    });
    return response.json(ads.map((ad: any) => {
        return { ...ad, weekDays: ad.weekDays.split(','), hourStart: convertMinutesToHoursString(ad.hourStart), hourEnd: convertMinutesToHoursString(ad.hourEnd), }
    }));
})

app.get('/ads/:id/discord', async (request, response) => {
    const id = request.params.id;

    const ad = await prisma.ad.findFirstOrThrow({
        select: {
            discord: true,
        },
        where: {
            id,
        }
    })
    return response.json({ discord: ad.discord });
})

app.listen(3333, () => {
    console.log("Servidor rodando na porta: 3333")
});