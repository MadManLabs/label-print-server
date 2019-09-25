'use strict';

const { getStatus } = require('../../printer/status');

const { statusSchema, stringSchema } = require('./schemas');

/**
 * @type import('fastify').RouteOptions
 */
const getPrinterStatus = {
  method: 'GET',
  url: '/printers/:id/status',
  schema: {
    params: {
      id: { type: 'string' },
    },
    response: {
      200: {
        type: 'object',
        properties: { status: statusSchema, reason: stringSchema },
        required: ['status', 'reason'],
      },
    },
  },
  async handler(request, response) {
    const printers = this.mongo.db.collection('printers');
    const printer = await printers.findOne({ _id: request.params.id });
    if (!printer) return response.callNotFound();
    const status = await getStatus(printer);
    if (printer.status !== status.status) {
      await printers.updateOne(
        { _id: request.params.id },
        { $set: { status: status.status, statusReason: status.reason } },
      );
    }
    return status;
  },
};

module.exports = getPrinterStatus;