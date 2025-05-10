'use strict';

/**
 * user-template service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-template.user-template');
