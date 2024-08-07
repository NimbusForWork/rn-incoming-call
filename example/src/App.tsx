import * as React from 'react';
import ramdomUuid from 'uuid-random';
import { StyleSheet, View, Button } from 'react-native';
// @ts-ignore
import BackgroundTimer from 'react-native-background-timer';
import { CallKeepService } from './CallKeepServices';

CallKeepService.instance().setupCallKeep();
BackgroundTimer.start();
export default function App() {
  const [uuid] = React.useState(() => ramdomUuid());
  return (
    <View style={styles.container}>
      <Button
        title="Display Call"
        onPress={() => {
          BackgroundTimer.setTimeout(
            () => CallKeepService.instance().displayCall(uuid),
            3000
          );
        }}
      />

      <Button
        title="End Call"
        onPress={() => CallKeepService.instance().endAllCall()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
