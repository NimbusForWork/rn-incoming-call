import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import {
  check,
  PERMISSIONS,
  RESULTS,
  requestMultiple,
} from 'react-native-permissions';
import RNIncomingCall, {
  type foregroundOptionsModel,
} from '@nimbus/rn-incoming-call';

const appName = 'Incoming-Test';
const options: foregroundOptionsModel = {
  channelId: 'com.incomingcallexample',
  channelName: 'Incoming video call',
  notificationIcon: 'ic_launcher', //mipmap
  notificationBody: 'Hello',
  notificationTitle: 'Someone calling',
  answerText: 'Answer',
  declineText: 'Decline',
  notificationColor: 'colorAccent', //path color in android
  notificationSound: null, //raw
  mainComponent: 'IncomingCall',
};

export class CallKeepService {
  private static _instance?: CallKeepService;

  static instance(): CallKeepService {
    if (!CallKeepService._instance) {
      CallKeepService._instance = new CallKeepService();
    }
    return CallKeepService._instance;
  }

  async setupCallKeep() {
    await new Promise((resolve) => {
      console.log('setup call keep done in promise');
      this.setupCallKeepFunc().then(resolve);
    });
  }

  async setupCallKeepFunc() {
    const granted = await requestMultiple([
      PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
      PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    ]);
    if (granted[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS] !== RESULTS.GRANTED)
      return;
    //only setup when granted permission
    await this.setup();
    //setup done
    if (Platform.OS === 'android') {
      RNCallKeep.setAvailable(true);
    }
    this.registerEvent();
  }

  async setup() {
    try {
      await RNCallKeep.setup({
        ios: {
          appName: appName,
          maximumCallGroups: '1',
          maximumCallsPerCallGroup: '1',
          includesCallsInRecents: false,
          imageName: 'callkitIcon', //image name from ios
        },
        android: {
          alertTitle: 'Permissions required',
          alertDescription:
            'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          okButton: 'ok',
          selfManaged: true,
          additionalPermissions: [],
        },
      });
      return {
        result: 'setupDone',
      };
    } catch (error) {
      console.log('error setup callkeep', error);
      return error;
    }
  }

  registerEvent() {
    RNCallKeep.addEventListener('answerCall', this.onCallKeepAnswerCallAction);
    RNCallKeep.addEventListener('endCall', this.onCallKeepEndCallAction);

    if (Platform.OS === 'android') {
      RNCallKeep.addEventListener(
        'createIncomingConnectionFailed',
        this.onFailCallAction
      );

      RNCallKeep.addEventListener(
        'showIncomingCallUi',
        ({ callUUID, name }) => {
          console.log(name);
          RNIncomingCall.displayNotification(callUUID, null, 30000, options);
        }
      );
    }
  }

  onFailCallAction() {
    RNCallKeep.endAllCalls();
  }

  //handle event
  onCallKeepAnswerCallAction(answerData: any) {
    const { callUUID } = answerData;
    console.log('onCallKeepAnswerCallAction: ', callUUID);
  }

  onCallKeepEndCallAction(answerData: any) {
    const { callUUID } = answerData;
    console.log('onCallKeepEndCallAction: ', callUUID);
    RNCallKeep.endCall(callUUID);
  }

  async displayCall(uuid: string) {
    const granted = await check(PERMISSIONS.ANDROID.READ_PHONE_NUMBERS);
    //only display call when permission granted
    if (granted !== RESULTS.GRANTED) return;
    console.log('display call', uuid);
    RNCallKeep.displayIncomingCall(
      uuid,
      'Someone',
      'Someone',
      'number',
      true,
      undefined
    );
  }

  endAllCall() {
    RNCallKeep.endAllCalls();
    RNIncomingCall.hideNotification();
  }
}
