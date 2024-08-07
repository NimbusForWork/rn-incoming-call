import {
  NativeModules,
  Platform,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';

const LINKING_ERROR =
  `The package '@nimbus/rn-incoming-call' doesn't seem to be linked. Make sure: \n\n` +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const IncomingCall = NativeModules.IncomingCall
  ? NativeModules.IncomingCall
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const isAndroid = Platform.OS === 'android';

let eventEmitter: any;

if (isAndroid) {
  eventEmitter = new NativeEventEmitter(IncomingCall);
}

enum RNNotificationEvent {
  RNNotificationAnswerAction = 'RNNotificationAnswerAction',
  RNNotificationEndCallAction = 'RNNotificationEndCallAction',
}

enum CallAction {
  ACTION_END_CALL = 'ACTION_END_CALL',
  ACTION_REJECTED_CALL = 'ACTION_REJECTED_CALL',
  ACTION_HIDE_CALL = 'ACTION_HIDE_CALL',
  ACTION_SHOW_INCOMING_CALL = 'ACTION_SHOW_INCOMING_CALL',
  HIDE_NOTIFICATION_INCOMING_CALL = 'HIDE_NOTIFICATION_INCOMING_CALL',
  ACTION_PRESS_ANSWER_CALL = 'ACTION_PRESS_ANSWER_CALL',
  ACTION_PRESS_DECLINE_CALL = 'ACTION_PRESS_DECLINE_CALL',
  ACTION_START_ACTIVITY = 'ACTION_START_ACTIVITY',
}

export interface foregroundOptionsModel {
  channelId: string;
  channelName: string;
  notificationIcon: string; //mipmap
  notificationTitle: string;
  notificationBody: string;
  answerText: string;
  declineText: string;
  notificationColor?: string;
  notificationSound?: string | null; //raw
  mainComponent: string; // must have a component to render Incoming call
  payload?: any; //more info
}

export interface answerPayload {
  callUUID: string;
  payload?: string; // jsonString
}

export interface declinePayload {
  callUUID: string;
  payload?: string; // jsonString
  endAction: 'ACTION_REJECTED_CALL' | 'ACTION_HIDE_CALL'; //ACTION_REJECTED_CALL => press button decline or call function declineCall
}

class RNIncomingCall {
  private _notificationEventHandlers;
  constructor() {
    this._notificationEventHandlers = new Map();
  }

  displayNotification = (
    uuid: string,
    avatar: string | null,
    timeout: number | null,
    foregroundOptions: foregroundOptionsModel
  ) => {
    if (!isAndroid) return;
    IncomingCall.displayNotification(
      uuid,
      avatar,
      timeout ? timeout : 0,
      foregroundOptions
    );
  };

  hideNotification = (hide = true) => {
    if (!isAndroid) return;
    IncomingCall.hideNotification(hide);
  };

  //function only work when open app from quit state
  backToApp = () => {
    if (!isAndroid) return;
    IncomingCall.backToApp();
  };

  addEventListener = (type: string, handler: any) => {
    if (!isAndroid) return;
    let listener;

    switch (type) {
      case 'answer':
        listener = eventEmitter.addListener(
          RNNotificationEvent.RNNotificationAnswerAction,
          (eventPayload: answerPayload) => {
            handler(eventPayload);
          }
        );
        break;

      case 'endCall':
        listener = eventEmitter.addListener(
          RNNotificationEvent.RNNotificationEndCallAction,
          (eventPayload: declinePayload) => {
            handler(eventPayload);
          }
        );
        break;

      default:
        break;
    }

    this._notificationEventHandlers.set(type, listener);
  };

  removeEventListener = (type: any) => {
    if (!isAndroid) return;
    const listener = this._notificationEventHandlers.get(type);
    if (!listener) {
      return;
    }

    listener.remove();
    this._notificationEventHandlers.delete(type);
  };

  declineCall = (uuid: string, payload?: string) => {
    this.hideNotification();
    const data = {
      callUUID: uuid,
      endAction: CallAction.ACTION_REJECTED_CALL,
      payload,
    };
    DeviceEventEmitter.emit(
      RNNotificationEvent.RNNotificationEndCallAction,
      data
    );
  };

  answerCall = (uuid: string, payload?: string) => {
    this.hideNotification(false);
    const data = { callUUID: uuid, payload };
    DeviceEventEmitter.emit(
      RNNotificationEvent.RNNotificationAnswerAction,
      data
    );
  };
}

export default new RNIncomingCall();
