export default class Messenger {

    constructor(listener) {
        if ( !listener ) throw new Error('listener empty');
        this.listener = listener;
    }

    connect(initSuccess) {
        if (this.websocket) throw new Error('Websocket already exists');

        let reconnect = () => {
            this.websocket = new WebSocket(`${config.wsUrl}/messageHandler`);
            this.websocket.onopen = () => {
                initSuccess();
            };
            this.websocket.onmessage = (e) => {
                let messages = JSON.parse(e.data);
                this.listener(messages);
            };
        };

        reconnect();
        this.websocket.onerror = (e) => {
            console.error(e);
           reconnect();
        };
    }

    close() {
        if (!this.websocket) throw new Error('Websocket not initialize');
        this.websocket.close();
    }

    subscribe(chatName) {
        if (!chatName) throw new Error('chatName empty');
        this._send({ command: 'subscribe', withUser: chatName  });
    }

    getMessages(userId, offset, limit) {
        this._send({ command: 'getMessages', userId: userId, offset: offset, limit: limit });
    }

    sendMessage(message) {
        this._send({
            command: 'addMessage',
            message: message
        });
    }

    makeRead(userId) {
        this._send({
            command: 'makeRead',
            userId: userId
        });
    }

    _send(message) {
        this.websocket.send(JSON.stringify(message));
    }
}
