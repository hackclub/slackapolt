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
    const result = await client.views.open({
      trigger_id: payload.trigger_id,
      view: {
        callback_id: "invite_form",
        type: "modal",
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Slackapolt",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            block_id: "section678",
            text: {
              type: "mrkdwn",
              text: "What channels would you like to add your club member to?",
            },
            accessory: {
              action_id: "text1234",
              type: "multi_channels_select",
              placeholder: {
                type: "plain_text",
                text: "Select channels",
              },
              initial_channels: ["C0266FRGV", "C0C78SG9L", "C0266FRGT"],
            },
          },
          {
            type: "input",
            element: {
              type: "email_text_input",
              action_id: "email_text_input-action",
            },
            label: {
              type: "plain_text",
              text: "What's the email of your club member?",
              emoji: true,
            },
          },
          {
            type: "input",  // Add this block for Custom Invite Message
            element: {
              type: "plain_text_input",
              action_id: "custom_invite_message-action",
            },
            label: {
              type: "plain_text",
              text: "Custom Invite Message",
              emoji: true,
            },
          },
        ],
      },
    
    });


    await ack();
  } catch (error) {
    console.error(error);
    // Handle error as needed
  }
});


// Add event listener for view_submission to handle the submitted form
app.view("invite_form", async (args) => {
  const { ack, body, view, say } = args;
  const { user_id, trigger_id } = body.user;
  console.log(view.state.values)

  const channelsSelected = view.state.values.section678.text1234.selected_channels; // Extract selected channels
  
  console.log(channelsSelected)
  
  const emailInput = view.state.values.fAqMv["email_text_input-action"].value; // Extract email input
  console.log(emailInput)
  const customInviteMessage = view.state.values.HmCd9["custom_invite_message-action"].value; // Extract custom invite message
  console.log(customInviteMessage)

  // Move the 'await respond({ text: "Invite Sent" });' here
  await client.chat.postEphemeral({
    text: `Invite Sent to *${emailInput}* with an invite message of *"${customInviteMessage}"*`,
    user: body.user.id,
    channel: body.user.id
  });


  await ack();
});



app.start(process.env.PORT || 3001).then(async () => {
  console.log(transcript("startupLog"));
});

module.exports = { app };