const { transcript } = require('../util/transcript')

async function notFound({ respond }) {
  await respond()
}
module.exports = notFound
