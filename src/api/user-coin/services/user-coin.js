'use strict';

/**
 * user-coin service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-coin.user-coin');
