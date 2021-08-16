
const express = require('express');
const app = express();
const { WebClient } = require('@slack/web-api');
const bodyParser = require('body-parser');
const schedule = require('node-schedule')
const viewFile = require('./view');
const signature = require('./verifySignature');
const firebase = require('./firebase')
const utils = require('./utils')
const vault = require('./vault')

// Create a new instance of the WebClient class with the token read from your environment variable

// const { createEventAdapter } = require('@slack/events-api');
// const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
// const apiUrl = 'https://1a102472f1b9.ngrok.io'


schedule.scheduleJob('0 10 * * *', async function(){
  try {
    console.log('before web client');
    let web = new WebClient(await vault.accessSecretVersion('dev-best-practices-bot-token'));

    console.log('after web client');
    let tips = await firebase.getAll()
    let title = utils.getObjectRandomKey(tips)
    let tip = tips[title]
    
    await web.chat.postMessage({
      channel: '#testchannel',
      text: utils.formatMessageTip(title,tip),
    });

    console.log('Message posted!');
  } catch (error) {
    console.log(error);
  }
});

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));


app.get('/', async(req, res) => {
  res.send('There is no web UI for this code sample. To view the source code, click "View Source"');
});

/*
 * Endpoint to receive events from Events API.
 */
app.post('/slack/events', async(req, res) => {
  switch (req.body.type) {
    case 'url_verification': {
      // verify Events API endpoint by returning challenge if present
      res.send({ challenge: req.body.challenge });
      break;
    }
    case 'event_callback': {
      // Verify the signing secret
      if (!signature.isVerified(req)) {
        res.sendStatus(404);
        return;
      } 
      
      // Request is verified --
      else {
        const {type, user, channel, tab, text, subtype} = req.body.event;

        // Triggered when the App Home is opened by a user
        if(type === 'app_home_opened') {
          viewFile.displayHome(user);
        }
      }
      break;
    }
    default: { res.sendStatus(404); }
  }
});

app.post('/slack/actions', async(req, res) => {
  const { token, trigger_id, user, actions, type } = JSON.parse(req.body.payload);
  if(actions && actions[0].action_id.match(/add_/)) {
    res.send(''); // Make sure to respond to the server to avoid an error
    viewFile.addTip(trigger_id);
  } else if(actions && actions[0].action_id.match(/delete_/)) {
    res.send(''); // Make sure to respond to the server to avoid an error
    viewFile.deleteTip(trigger_id);
  } else if(type === 'view_submission') {
    res.send(''); // Make sure to respond to the server to avoid an error
    
    const { user, view } = JSON.parse(req.body.payload);

    if (view.state.values.deleteTitle) {
      let key = view.state.values.deleteTitle.content.selected_option.value
      firebase.deleteTip(key).then(() => {
        console.log('Deleted data in Firebase');
        viewFile.displayHome(user.id);
      });
    }

    if (view.state.values.addTitle) {
      const data = {
        title: view.state.values.addTitle.content.value,
        tip: view.state.values.addTip.content.value,
      }
  
      firebase.store(data.title, data.tip).then(() => {
        console.log('Stored data in Firebase');
        viewFile.displayHome(user.id);
      });
    }
  }
});

/* Running Express server */
const server = app.listen(process.env.PORT, () => {
  console.log('Express web server is running on port %d in %s mode', server.address().port, app.settings.env);
});
