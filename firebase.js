
const admin = require('firebase-admin');
const utils = require('./utils')

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function store(document, key, tip) {
  // add a new tip in firestore
  try {
    const tipUpdated = await db.collection('devTips').doc(document).update({
      [key]: tip,
    });
    console.log(`Tip ${key} created.`);
  } catch (error) {
    console.log(`Error creating tip: ${error}`);
  }
}

async function deleteTip(key) {
  // add a new tip in firestore
  try {
    const tipUpdated = await db.collection('devTips').doc("pmitc").update({
      [key]: admin.firestore.FieldValue.delete(),
    });
    console.log(`Tip ${key} Deleted.`);
  } catch (error) {
    console.log(`Error Deleting tip: ${error}`);
  }
}

async function getAll() {
  var tips
  try {
    data = await (await db.collection('devTips').doc("pmitc").get()).data();
    tips = utils.sortObjectByKey(data);
  } catch (error) {
    console.log(error);
  }

  return tips
}

async function getLastTip() {
  var lastTip
  try {
    data = await (await db.collection('devTips').doc("pmitc-last-tip").get()).data();
    return data['lastTip']
  } catch (error) {
    console.log(error);
  }

  return lastTip
}

module.exports = { store, getAll, deleteTip, getLastTip };