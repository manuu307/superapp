const express = require('express');
const router = express.Router();
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200' });

router.get('/', async (req, res) => {
    try {
        const { q, type } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Query parameter "q" is required.',
            });
        }

        const indices = type ? type.split(',') : ['users', 'businesses', 'products'];

        const searchBody = {
            query: {
                multi_match: {
                    query: q,
                    fields: ['name', 'description', 'username', 'email'],
                    fuzziness: 'AUTO',
                },
            },
        };

        const { body } = await client.search({
            index: indices,
            body: searchBody,
        });

        const results = body.hits.hits.map(hit => {
            return {
                type: hit._index,
                id: hit._id,
                score: hit._score,
                ...hit._source,
            };
        });

        res.json(results);
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ error: 'An error occurred while searching.' });
    }
});

module.exports = router;