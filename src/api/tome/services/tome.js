'use strict';

/**
 * tome service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::tome.tome');
