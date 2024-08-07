import React from 'react';
import { Button, View, Text } from 'react-native';
import RNIncomingCall from '@nimbus/rn-incoming-call';

export { IncomingCall };

function IncomingCall(props: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Incoming Call</Text>
      <Text>{props.uuid}</Text>

      <View style={{ flexDirection: 'row', gap: 15 }}>
        <Button
          title="Decline"
          onPress={() => {
            RNIncomingCall.declineCall(props.uuid);
          }}
        />
        <Button
          title="Decline"
          onPress={() => {
            RNIncomingCall.answerCall(props.uuid);
          }}
        />
      </View>
    </View>
  );
}
