import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { IncomingCall } from './src/IncomingCall';

AppRegistry.registerComponent('IncomingCall', () => IncomingCall);
AppRegistry.registerComponent(appName, () => App);
