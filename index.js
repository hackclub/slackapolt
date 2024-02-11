require('dotenv').config()
const { inviteUserToChannel } = require('./util/invite-user-to-channel')
const { mirrorMessage } = require('./util/mirror-message')
const { transcript } = require('./util/transcript')
const {
  postWelcomeCommittee,
} = require('./interactions/post-welcome-committee')
const express = require('express')

const { app, client } = require('./app.js')
const { receiver } = require('./express-receiver')
const { getInvite } = require('./util/get-invite')
const { sleep } = require('./util/sleep')
const { prisma } = require('./db')
const { metrics } = require('./util/metrics')
const { upgradeUser } = require('./util/upgrade-user.js')

receiver.router.use(express.json())

receiver.router.get('/ping', require('./endpoints/ping'))

const preselectedChannels = ['lounge', 'scrapbook', 'happenings', 'ship', 'welcome']

// const addToChannels = async (user, event) => {
//   await upgradeUser(user)
//   await sleep(1000) // timeout to prevent race-condition during channel invites
//   const invite = await getInvite({ user })
//   let channelsToInvite = defaultChannels
//   if (event) {
//     channelsToInvite.push(event)
//     defaultChannels.push(event)
//   }
//   await Promise.all(
//     channelsToInvite.map((c) =>
//       inviteUserToChannel(user, transcript(`channels.${c}`))
//     )
//   )

//   await client.chat.postMessage({
//     text: transcript('house.added-to-channels', { suggestion }),
//     blocks: [
//       transcript('block.text', {
//         text: transcript('house.added-to-channels', { suggestion }),
//       }),
//     ],
//     channel: user,
//   })

//   // TODO weigh by reactions or just do something else entirely
//   const history = await client.conversations.history({
//     channel: transcript('channels.ship'),
//     limit: 10,
//   })
//   const message = history.messages[Math.floor(Math.random() * 10)]
//   const link = (
//     await client.chat.getPermalink({
//       channel: transcript('channels.ship'),
//       message_ts: message.ts,
//     })
//   ).permalink
// }

app.command(/.*?/, async (args) => {
  const { ack, payload, respond } = args
  const { command, text, user_id, channel_id } = payload

  try {
    mirrorMessage({
      message: `${command} ${text}`,
      user: user_id,
      channel: channel_id,
      type: 'slash-command',
    })

    await ack()

    await respond({
      blocks: [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `${command} ${text}`,
            },
          ],
        },
      ],
    })

    switch (command) {
      case '/slackapolt':
        await require(`./commands/slackapolt`)(args)
        break

      default:
        await require('./commands/not-found')(args)
        break
    }
  } catch (e) {
    console.error(e)
  }
})

app.start(process.env.PORT || 3001).then(async () => {
  console.log(transcript('startupLog'))
})

module.exports = { app }
