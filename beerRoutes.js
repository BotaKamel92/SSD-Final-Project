// src/routes/beerRoutes.js
const express = require('express');
const router = express.Router();
const { Beer } = require('../models'); // assuming sequelize model

// GET /v1/order
router.get('/order', async (req, res) => {
  try {
    const beers = await Beer.findAll({
      attributes: ['id', 'name', 'type'] // فقط البيانات المسموح بعرضها
    });
    res.json(beers);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
