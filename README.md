# @nimbus/rn-incoming-call

**React Native Notification Incoming Call For Android** This library works based on android display time-sensitive notifications
For more information about **Display time-sensitive notifications** (https://developer.android.com/training/notify-user/time-sensitive).

⚠️ **This library only work for Android** .

## Installation

```sh
npm install @nimbus/rn-incoming-call
```

### Addition installation step
In `AndroidManifest.xml`:

```java
// ...
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.DISABLE_KEYGUARD" />
    <application ....>
      <activity android:name="com.incomingcall.IncomingCallActivity"
        android:launchMode="singleTask"
        android:excludeFromRecents="true"
        android:exported="true"
        android:showWhenLocked="true"
        android:turnScreenOn="true"
      />

      <activity android:name="com.incomingcall.NotificationReceiverActivity"
        android:launchMode="singleTask"
        android:excludeFromRecents="true"
        android:exported="true"
        android:showWhenLocked="true"
        android:turnScreenOn="true"
      />

      <service
        android:name="com.incomingcall.IncomingCallService"
        android:enabled="true"
        android:stopWithTask="false"
        android:exported="true" />

     .....
      </application>
```

## Usage

```js
import RNIncomingCall, { type foregroundOptionsModel } from '@nimbus/rn-incoming-call';

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

RNIncomingCall.displayNotification(callUUID, null, 30000, options);

// ...

// index.js
AppRegistry.registerComponent('IncomingCall', () => YOUR_CUSTOM_COMPONENT);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
