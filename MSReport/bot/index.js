import TelegramBot from 'node-telegram-bot-api';
import admin from 'firebase-admin';
import cron from 'node-cron';
import { readFileSync } from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(readFileSync(path.resolve('./credentials.json')));

const firebaseConfig = {
  apiKey: "AIzaSyBH7yxf4KaHJQJVsURxTHHW7OsvCb3hTeo",
    authDomain: "msreport-97313.firebaseapp.com",
    projectId: "msreport-97313",
    storageBucket: "msreport-97313.appspot.com",
    messagingSenderId: "1000155786014",
    appId: "1:1000155786014:web:627bf75e3bb62a662a770f"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL
});

const db = admin.firestore();
const bot = new TelegramBot('7186885697:AAGTQlL3Mb5wmTTMyYQw_8OtSahxlNBjo9U', { polling: true });

let current = null;

const job = (message, time, ids) => {
  if (current) {
    current.stop();
  }

  const [hour, minute] = time.split(':');
  const exp = `${minute} ${hour} * * *`;

  current = cron.schedule(exp, async () => {
    for (const chatId of ids) {
      try {
        await bot.sendMessage(chatId, message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
}

const listen = () => {
  db.collection('notification').limit(1).onSnapshot(snapshot => {
    if (snapshot.empty) {
      console.log('No new notifications.');
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const { message, time, ids } = data;

      job(message, time, ids);
    });
  }, error => {
    console.error('Error listening to Firestore changes:', error);
  });
}

listen();

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Приветствую! Я бот для заполнения ежедневного отчёта.');
});