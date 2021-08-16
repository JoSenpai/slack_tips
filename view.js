const constants = require("./constants");
const axios = require('axios'); 
const firebase = require('./firebase')
const utils = require('./utils')
const vault = require('./vault')

const displayHome = async(user) => {
  console.log(`User ${user} opened home`);
  const args = {
    user_id: user,
    view: await updateView(user)
  };

  try {
    const result = await axios.post(`${constants.slackApiUrl}/views.publish`, 
    JSON.stringify(args),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${await vault.accessSecretVersion('dev-best-practices-bot-token')}`
      }
    })
  } catch (error) {
    console.log(error);
  }
};

const updateView = async(user) => {

  let blocks = [ 
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome!*:wave: \nThis is a home for Dev Best Practices app. You can add and remove tips here!"
      },
      accessory: {
        type: "button",
        action_id: "add_tip", 
        text: {
          type: "plain_text",
          text: "Add a Tip"
        }
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Tips added here should be the *team agreed* :one-team: patterns to follow.\n\nThe goal of this is to help ensure *consistency* and *reduce cognitive load* :brain: for developers across teams when working across multiple codebases.\n\nIf a pattern here is not the widely agreed on pattern, it should be removed. :x:\n`
      },
      accessory: {
        type: "button",
        action_id: "delete_tip",
        style: "danger",
        text: {
          type: "plain_text",
          text: "Delete a Tip"
        }
      },
    },
  ];

  let allTips = await firebase.getAll()
  for(var key in allTips){
    blocks.push(
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: utils.formatMessageTip(key, allTips[key]),
        },
      }
    )
  }

  let view = {
    type: "home",
    title: {
      type: "plain_text",
      text: "Keep notes!"
    },
    blocks: blocks
  }

  return JSON.stringify(view);
};

const addTip = async(trigger_id) => {
  
  const modal = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Add a tip'
    },
    submit: {
      type: 'plain_text',
      text: 'Create'
    },
    blocks: [
      {
        "type": "input",
        "block_id": "addTitle",
        "label": {
          "type": "plain_text",
          "text": "Tip title"
        },
        "element": {
          "action_id": "content",
          "type": "plain_text_input",
        }
      },
      {
        "type": "input",
        "block_id": "addTip",
        "label": {
          "type": "plain_text",
          "text": "Tip in markdown"
        },
        "element": {
          "action_id": "content",
          "type": "plain_text_input",
          "placeholder": {
            "type": "plain_text",
            "text": "Take a note... "
          },
          "multiline": true
        }
      },
    ]
  };
  
  const args = {
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };
  
  const result = await axios.post('https://slack.com/api/views.open', 
  JSON.stringify(args),
  {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${await vault.accessSecretVersion('dev-best-practices-bot-token')}`
    }
  });
};


const deleteTip = async(trigger_id) => {
  const modal = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Delete a tip'
    },
    submit: {
      type: 'plain_text',
      text: 'Delete',
    },
    blocks: [
      // Drop-down menu      
      {
        "type": "input",
        "block_id": "deleteTitle",
        "label": {
          "type": "plain_text",
          "text": "Tip Title",
        },
        "element": {
          "type": "static_select",
          "action_id": "content",
          "options": []
        }
      }
    ]
  };

  let allTips = await firebase.getAll();
  for(var key in allTips){
    modal.blocks[0].element.options.push(
      {
        "text": {
          "type": "plain_text",
          "text": key
        },
        "value": key
      },
    )
  }
  
  const args = {
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };
  

  try {
    const result = await axios.post('https://slack.com/api/views.open', 
    JSON.stringify(args),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${await vault.accessSecretVersion('dev-best-practices-bot-token')}`
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { displayHome, addTip, deleteTip };