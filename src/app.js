import express from 'express'
import { readFile } from 'fs/promises';

const app = express()

export default app

const json = JSON.parse(
    await readFile(
        new URL('./public/anime-offline-database/anime-offline-database-minified.json', import.meta.url)
    )
);

app.get('/', (req, res) => {
    res.send('Anima API')
})

// Middleware to handle missing pagination queries
app.use("/anime", (req, res, next) => {
    if (!req.query.page) {
        req.query.page = 1;
    } else {
        req.query.page = parseInt(req.query.page, 10);
        if (!Number.isInteger(req.query.page)) {
            req.query.page = 1;
        }
    }

    if (!req.query.limit) {
        req.query.limit = 10;
    } else {
        req.query.limit = parseInt(req.query.limit, 10);
        if (!Number.isInteger(req.query.limit)) {
            req.query.limit = 10;
        }
    }

    next();
});

app.get('/anime', (req, res) => {
    const objects = Object.entries(json['data'])

    const filter = req.query.search?.toLowerCase()
    let filteredObjects = objects

    if (filter) {
        filteredObjects = objects.filter(([key, value]) =>
            value.title.toLowerCase().includes(filter) ||
            value.synonyms.some((synonym) => synonym.toLowerCase().includes(filter))
        )
    }

    // pagination
    const page = req.query.page
    const limit = req.query.limit
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const result = filteredObjects.slice(startIndex, endIndex)

    res.json(result)
})

app.get('/anime/:id', (req, res) => {
    let result = null
    for (const [key, value] of Object.entries(json['data'])) {
        if (key == req.params.id) {
            result = value
            break
        }
    }

    if (!result) {
        res.status(404).send('Anime not found.')
    } else {
        res.json(result)
    }
})