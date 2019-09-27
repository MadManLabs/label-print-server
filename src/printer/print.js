'use strict';

const server = require('../fastify');

const zebraHttp = require('./protocols/zebraHttp');

async function printNextJob() {
  const jobs = server.mongo.db.collection('jobs');
  const printers = server.mongo.db.collection('printers');
  const { value: nextJob } = await jobs.findOneAndUpdate(
    { status: 'PENDING' },
    { $set: { status: 'PRINTING' } },
    { returnOriginal: false },
  );
  if (nextJob === null) return;
  const printer = await printers.findOne({ _id: nextJob.printer });
  let result;
  switch (printer.protocol) {
    case 'zebra-http':
      result = await zebraHttp.postPrint(printer, nextJob, server);
      break;
    default:
      throw new Error(`unhandled protocol: ${printer.protocol}`);
  }
  let toStore;
  if (result.success) {
    toStore = { status: 'SUCCESS' };
  } else {
    toStore = { status: 'ERROR', statusReason: result.error };
  }
  await jobs.updateOne({ _id: nextJob._id }, { $set: toStore });
}

module.exports = {
  printNextJob,
};