import http from 'k6/http';
import { check } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, WS_URL } from '../config.js';
import { signupUser, loginUser } from '../helpers.js';
import { createSocket, encodeEvent } from '../lib/sio.js';

const connectTime = new Trend('sio_connect_time');
const msgSendConfirm = new Trend('msg_send_confirm');
const msgSent = new Counter('msg_sent');
const msgReceived = new Counter('msg_received');
const msgConfirmTimeout = new Counter('msg_confirm_timeout');
const sioErrors = new Counter('sio_errors');

export const options = {
  scenarios: {
    messaging: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
    },
  },
  thresholds: {
    sio_connect_time: ['p(95)<2000'],
    msg_send_confirm: ['p(95)<2000'],
    msg_confirm_timeout: ['count<10'],
    sio_errors: ['rate<0.01'],
  },
};

function createConversation(wsUrl, jwt, otherUserId) {
  let convId = null;
  createSocket(wsUrl, jwt, {
    onConnect(socket) {
      socket.send(encodeEvent('conversation:create', otherUserId));
    },
    'conversation:create'(socket, conversation) {
      convId = conversation.id;
      socket.close();
    },
    onError(socket) {
      socket.close();
    },
  });
  return convId;
}

export function setup() {
  const users = [];

  for (let i = 0; i < 50; i++) {
    const { username, password } = signupUser(BASE_URL, `msg${i}`);
    const { jwt } = loginUser(BASE_URL, username, password);
    const meRes = http.get(`${BASE_URL}/users/me`, { tags: { name: 'me' } });
    const userId = meRes.json('data.id');
    users.push({ username, password, jwt, userId });
  }

  for (let i = 0; i < 50; i += 2) {
    const userA = users[i];
    const userB = users[i + 1];

    const convId = createConversation(WS_URL, userA.jwt, userB.userId);

    check(convId, { 'conversation created': (id) => id !== null });

    users[i].convId = convId;
    users[i].partnerUsername = userB.username;
    users[i + 1].convId = convId;
    users[i + 1].partnerUsername = userA.username;
  }

  return users;
}

export default function (data) {
  const user = data[(__VU - 1) % data.length];
  const connectStart = Date.now();
  const pendingSends = {};

  createSocket(WS_URL, user.jwt, {
    onConnect(socket) {
      connectTime.add(Date.now() - connectStart);

      function sendNext() {
        const tempId = 'tmp_' + __VU + '_' + Date.now() + '_' + Math.random();
        socket.send(encodeEvent('message:create', { body: 'Msg from ' + user.username + ' at ' + Date.now() }, user.convId, tempId));
        msgSent.add(1);

        const timeoutId = setTimeout(() => {
          msgConfirmTimeout.add(1);
          delete pendingSends[tempId];
        }, 5000);

        pendingSends[tempId] = { ts: Date.now(), timeoutId };
      }

      sendNext();

      setTimeout(() => {
        socket.close();
      }, 295000);
    },

    'message:create:confirm'(socket, convId, message, tempId) {
      msgReceived.add(1);
      const pending = pendingSends[tempId];
      if (pending) {
        clearTimeout(pending.timeoutId);
        msgSendConfirm.add(Date.now() - pending.ts);
        delete pendingSends[tempId];
      }
    },

    'message:create'(socket, convId, message, tempId) {
      msgReceived.add(1);

      const replyTempId = 'tmp_' + __VU + '_' + Date.now() + '_' + Math.random();
      socket.send(encodeEvent('message:create', { body: 'Reply from ' + user.username + ' at ' + Date.now() }, user.convId, replyTempId));
      msgSent.add(1);

      const timeoutId = setTimeout(() => {
        msgConfirmTimeout.add(1);
        delete pendingSends[replyTempId];
      }, 5000);

      pendingSends[replyTempId] = { ts: Date.now(), timeoutId };
    },

    onDisconnect() {
      for (const id in pendingSends) {
        clearTimeout(pendingSends[id].timeoutId);
        delete pendingSends[id];
      }
    },

    onError(socket) {
      sioErrors.add(1);
      socket.close();
    },
  });
}
