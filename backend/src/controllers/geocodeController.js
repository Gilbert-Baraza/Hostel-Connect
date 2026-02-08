const { geocodeAddress } = require('../services/geocodingService');

/**
 * Geocode Controller
 * POST /geocode
 */
exports.geocode = async (req, res) => {
  try {
    const { street, city, county, university, country } = req.body || {};

    const hasInput = [street, city, county, university].some((value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== undefined && value !== null;
    });

    if (!hasInput) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one of street, city, county, or university.'
      });
    }

    const coordinates = await geocodeAddress({
      street,
      city,
      county,
      university,
      country
    });

    if (!coordinates) {
      return res.status(404).json({
        success: false,
        message: 'Location not found.'
      });
    }

    return res.json({
      success: true,
      data: {
        coordinates
      }
    });
  } catch (error) {
    console.error('Geocode error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to geocode location.'
    });
  }
};
