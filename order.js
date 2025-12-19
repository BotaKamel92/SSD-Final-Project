'use strict';

const fs = require('fs');
const path = require('path');

module.exports = (app, db) => {

    /**
     * ======================================
     * V4 – Excessive Data Exposure (FIXED)
     * GET /v1/order
     * ======================================
     */
    app.get('/v1/order', async (req, res) => {
        try {
            let beers = await db.beer.findAll({
                attributes: ['id', 'name'], 
                include: {
                    model: db.user, 
                    attributes: ['id'] 
                }
            });

            if (!beers || beers.length === 0) {
                beers = [
                    {
                        id: 1,
                        name: "Heineken (Test Data)",
                        users: [{ id: 1, name: "Admin User" }]
                    },
                    {
                        id: 2,
                        name: "Stella Artois (Test Data)",
                        users: [{ id: 2, name: "Shahd Maher" }]
                    }
                ];
            }

            res.status(200).json(beers);
        } catch (err) {
            console.error("Order Route Error:", err);
            res.status(500).send('Server error: ' + err.message);
        }
    });


    /**
     * ======================================
     * V5 – Path Traversal (FIXED)
     * GET /v1/beer-pic/?picture=
     * ======================================
     */
    app.get('/v1/beer-pic/', (req, res) => {
        const filename = req.query.picture;

        if (!filename || filename.includes('..')) {
            return res.status(400).send('Invalid filename');
        }

        const safePath = path.join(
            __dirname,
            '../../../uploads',
            path.basename(filename)
        );

        fs.readFile(safePath, (err, data) => {
            if (err) {
                return res.status(404).send('File not found');
            }
            res.type('image/jpeg');
            res.send(data);
        });
    });


    /**
     * ======================================
     * V1 – SQL Injection (FIXED)
     * GET /v1/search/:filter/:query
     * ======================================
     */
    app.get('/v1/search/:filter/:query', async (req, res) => {
        const filter = req.params.filter;
        const query = req.params.query;

        const allowedFilters = ['id', 'name']; 
        if (!allowedFilters.includes(filter)) {
            return res.status(400).send('Invalid filter. Use "id" or "name".');
        }

        const sql = `SELECT id, name FROM beers WHERE ${filter} = ?`;

        try {
            const result = await db.sequelize.query(sql, {
                replacements: [query],
                type: db.sequelize.QueryTypes.SELECT
            });

            res.status(200).json(result);
        } catch (err) {
            console.error("Search Route Error:", err);
            res.status(500).send('Query failed');
        }
    });

};