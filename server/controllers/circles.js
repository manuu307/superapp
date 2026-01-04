const Circle = require('../models/Circle');

/**
 * Controller to find nearby Circles and Public Events based on geographic coordinates.
 *
 * This function implements a geospatial search combined with a custom ranking algorithm.
 * The ranking score is a weighted value combining a business's "energy" and its
 * distance from the user. The formula is `Score = Energy / (DistanceInKm + 1)`.
 *
 * @route GET /api/v1/circles/nearby?lat=<latitude>&lng=<longitude>&radius=<distance_in_km>
 * @access Public
 */
const getNearbyEntities = async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameters: lat and lng.',
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusInKm = parseFloat(radius);

  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid values for latitude, longitude, or radius.',
    });
  }

  try {
    const results = await Circle.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'dist.calculated',
          maxDistance: radiusInKm * 1000,
          distanceMultiplier: 0.001,
          spherical: true,
        },
      },
      {
        $addFields: {
          score: {
            $divide: [
              { $ifNull: ['$energyBalance', 0] },
              { $add: ['$dist.calculated', 1] },
            ],
          },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Geospatial search error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while searching for nearby entities.',
    });
  }
};

module.exports = {
  getNearbyEntities,
};
