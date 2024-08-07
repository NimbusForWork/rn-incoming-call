
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNIncomingCallSpec.h"

@interface IncomingCall : NSObject <NativeIncomingCallSpec>
#else
#import <React/RCTBridgeModule.h>

@interface IncomingCall : NSObject <RCTBridgeModule>
#endif

@end
