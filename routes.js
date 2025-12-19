'use strict';

const routes = [
    require('./routes/user'),
    require('./routes/system'),
    require('./routes/admin'),
    require('./routes/frontend')
];

module.exports = function router(app, db) {
    // سجّل كل الـ routes
    routes.forEach((route) => {
        route(app, db);
    });

    // إضافة endpoint للـ SQL Injection test
    app.get('/v1/search/name/:name', async (req, res) => {
        const name = req.params.name;

        try {
            const result = await db.sequelize.query(
                "SELECT * FROM users WHERE username = '" + name + "'"
            );
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};
