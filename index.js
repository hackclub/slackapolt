require("dotenv").config();
const { inviteUserToChannel } = require("./util/invite-user-to-channel");
const { mirrorMessage } = require("./util/mirror-message");
const { transcript } = require("./util/transcript");
const {
  postWelcomeCommittee,
} = require("./interactions/post-welcome-committee");
const express = require("express");

const { app, client } = require("./app.js");
const { receiver } = require("./express-receiver");
const { getInvite } = require("./util/get-invite");
const { sleep } = require("./util/sleep");
const { prisma } = require("./db");
const { metrics } = require("./util/metrics");
const { upgradeUser } = require("./util/upgrade-user.js");

receiver.router.use(express.json());

receiver.router.get("/ping", require("./endpoints/ping"));

const preselectedChannels = [
  "lounge",
  "scrapbook",
  "happenings",
  "ship",
  "welcome",
];

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
  const { ack, payload, respond } = args;
  const { command, text, user_id, channel_id } = payload;

  try {
    mirrorMessage({
      message: `${command} ${text}`,
      user: user_id,
      channel: channel_id,
      type: "slash-command",
    });

    await ack();

      try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        callback_id: 'invite_form',
        "type": "modal",
  "submit": {
    "type": "plain_text",
    "text": "Submit",
    "emoji": true
  },
  "close": {
    "type": "plain_text",
    "text": "Cancel",
    "emoji": true
  },
  "title": {
    "type": "plain_text",
    "text": "Slackapolt",
    "emoji": true
  },
  "blocks": [
    {
      "type": "section",
      "block_id": "section678",
      "text": {
        "type": "mrkdwn",
        "text": "What channels would you like to add your club member to?"
      },
      "accessory": {
        "action_id": "text1234",
        "type": "multi_channels_select",
        "placeholder": {
          "type": "plain_text",
          "text": "Select channels"
        },
        "initial_channels": [
          "C0266FRGV",
          "C0C78SG9L",
          "C0266FRGT"
        ]
      }
    },
    {
      "type": "input",
      "element": {
        "type": "email_text_input",
        "action_id": "email_text_input-action"
      },
      "label": {
        "type": "plain_text",
        "text": "What's the email of your club member?",
        "emoji": true
      }
    }
  ]
        
    }})
  } catch (error) {
    logger.error(error)
    // Let user know there was an error
    await respond({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Oops, there was an error getting your pizza delivered: \`${error.message}\`. If this keeps happening, message <mailto:pizza@hackclub.com|pizza@hackclub.com>!`
          }
        }
      ]
    })
  }
});

app.start(process.env.PORT || 3001).then(async () => {
  console.log(transcript("startupLog"));
  app.client.apps.connections.open;
});

module.exports = { app };