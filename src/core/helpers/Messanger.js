export default class Messanger {

    static get MAIN_STREAM() {
        return 'MAIN_STREAM';
    }

    constructor(listener) {
        if ( !listener ) throw new Error('listener empty');
        this.listener = listener;
    }

    connect(initSuccess) {
        if (this.websocket) throw new Error('Websocket already exists');

        let reconnect = () => {
            this.websocket = new WebSocket(`${config.wsUrl}/channelHandler`);
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
        this._send({ command: 'subscribe', withUser: chatName  });
    }

    latest(withUserId) {
        this._send({ command: 'getMessages', withUser: withUserId, offset: 0, limit: 500  });
    }

    sendMessage(message) {
        this._send({
            command: 'addMessage',
            message: message
        });
    }

    _send(message) {
        this.websocket.send(JSON.stringify(message));
    }
}
