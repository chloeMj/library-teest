/* eslint-disable */
// import { useNotificationStore } from '@/stores/notification';
// import { useOrderStore } from '@/stores/order';
import { useUserStore } from '@/stores/user';
import { shallowRef, type App } from 'vue';

let ws: WebSocket | null = null;
const receiveMessages: boolean = true; // 메시지 수신 플래그
let hbInterval: any;
let sessionID: string = ''; // 서버에서 받은 세션 ID 저장
const rqid = null; // 최근에 보낸 메시지의 rqid 저장
const isAutoReconnect: boolean = false; // 자동 재연결 플래그

let webSocketUrl: string | URL =
  import.meta.env.VITE_WEBSOCKET_URL || 'ws://xforceinsight.imeco.co.kr:9190';

const recconectInterval = 1000;
let reconnectAttempts = 0;
const reconnectMax = 5;

let connectCallbackFns: Function[] = [];

const customMessageHandler: Record<string, Function> = {};

export const websocket = {
  readyState: null,
  wsMsgHandler: shallowRef<any>(null),
  doCustomWsMsgHandler() {
    connectCallbackFns = connectCallbackFns.filter((fn: Function | null | undefined) => {
      return fn;
    });
    connectCallbackFns.forEach((fn: Function, index: number) => {
      if (fn) {
        delete connectCallbackFns[index];
        fn();
      }
    });
  },
  connectWebSocket(callback: Function | null = null) {
    if (callback) {
      connectCallbackFns.push(callback);
    }

    if (ws && ws?.readyState <= 1) {
      // 이미 연결된 ws 있음
      /**
       * readyState
       * 0	CONNECTING	소켓이 생성됐으나 연결은 아직 개방되지 않았습니다.
       * 1	OPEN	연결이 개방되어 통신할 수 있습니다.
       * 2	CLOSING	연결을 닫는 중입니다.
       * 3	CLOSED	연결이 닫혔거나, 개방할 수 없었습니다.
       */
      // console.log('이미 연결된 ws 있음')
      if(ws?.readyState == 1) {
        websocket.doCustomWsMsgHandler();
      }
      return;
    }

    const userStore = useUserStore();
    // ws://192.168.121.202:8083/?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhZG1pbiIsInVzZXJObSI6IkFkbWluaXN0cmF0b3IiLCJpc3MiOiJ4LWZvcmNlLW9tcyIsImlhdCI6MTc2MDkyNDQyNCwiZXhwIjoxNzYwOTI4MDI0fQ.VI_ibYbxfrTCPOaJAKA3XTY2DLefwbIQwq5MYG1OV6U

    const url = webSocketUrl + (import.meta.env.MODE === 'development' ? `?access_token=${userStore?.token}` : '')
    ws = new WebSocket(url);

    ws.onopen = this.handleWebSocketOpen;
    ws.onmessage = this.handleWebSocketMessage;
    ws.onerror = this.handleWebSocketError;
    ws.onclose = this.handleWebSocketClose;
  },

  handleWebSocketOpen(event: Event) {
    reconnectAttempts = 0;
    websocket.readyState = ws?.readyState;
    console.log('WebSocket Connection opened');
  },

  //   addMessageHandler(handlers: any) {
  //     this.wsMsgHandler = handlers;
  //   },
  setMessageHandler(type: string, handler: Function ) {
    customMessageHandler[type] = handler
  },
  handleWebSocketMessage(event: MessageEvent) {
    //  console.log('WebSocket Message received: ' + event.data);
    try {
      const data = JSON.parse(event.data);
      const dataType = data.data?.type || data?.type || '';


      if (dataType === 'connection' || dataType === '_welcome') {
        websocket.doCustomWsMsgHandler();
      } else if(customMessageHandler[dataType]) {
        const fn = customMessageHandler[dataType]
        fn(data)
      }
    } catch (err) {
      console.error('Error parsing message', err);
    }
  },

  handleWebSocketError(event: Event) {
    websocket.readyState = ws?.readyState;
    console.error('WebSocket error observed: ', event);
    if (ws?.close) {
      // 오류로 인한 웹소켓 종료
      ws.close(4001);
    } else {
      websocket.closeWebSocket(4001);
    }
  },

  handleWebSocketClose(event: CloseEvent) {
    websocket.readyState = ws?.readyState;
    console.log('WebSocket Connection closed');
    websocket.closeWebSocket(event.code);
  },

  // 사용자에 의한 웹소켓 종료
  closeWebSocketByUser(code: number) {
    ws?.close(1000);
    ws = null;
  },

  closeWebSocket(code: number) {
    if (code !== 1000) {
      if (isAutoReconnect) {
        websocket.connectWebSocket(); // 자동 재연결
        reconnectAttempts++;
        return;
      }
    }
  },

  sendMessage(message: string) {
    if (ws !== null) {
      // message = JSON.stringify(message);
      ws.send(message);
    }
  },

  connectWebSocketRetry() {
    try {
      if (reconnectAttempts >= reconnectMax) {
        return;
      }

      if (ws) {
        ws.close(4000);
        ws = null;

        if (isAutoReconnect) {
          websocket.connectWebSocket(); // 자동 재연결
          reconnectAttempts++;
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
};

export default {
  install: (app: App) => {
    websocket.connectWebSocket();
    app.config.globalProperties.$ws = websocket;
  },
};
