package com.incomingcall;

import android.annotation.SuppressLint;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.facebook.react.ReactFragment;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;


public class IncomingCallActivity extends AppCompatActivity implements DefaultHardwareBackBtnHandler {
  private static final String TAG = "MessagingService";
  private static final String TAG_KEYGUARD = "Incoming:unLock";

  private Button lnDeclineCall;
  private Button lnAcceptCall;

  private String uuid = "";
  static boolean active = false;

  static IncomingCallActivity instance;

  public static IncomingCallActivity getInstance() {
    return instance;
  }

  @Override
  public void onStart() {
    super.onStart();
    active=true;
    instance = this;
  }

  @Override
  public void onStop() {
    super.onStop();
  }

  @Override
  public void onDestroy() {
    Log.d(TAG, "onDestroy: ");
    if(active){
      dismissIncoming(Constants.ACTION_REJECTED_CALL);
    }
    super.onDestroy();
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);


    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true);
      setTurnScreenOn(true);
      //Some devices need the code below to work when the device is locked
      KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
      if (keyguardManager.isDeviceLocked()) {
        KeyguardManager.KeyguardLock keyguardLock = keyguardManager.newKeyguardLock(TAG_KEYGUARD);
        keyguardLock.disableKeyguard();
      }
    }

    getWindow().addFlags(
      WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        | WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON);

    Bundle bundle = getIntent().getExtras();

    if (bundle.containsKey("mainComponent") && bundle.getString("mainComponent")!=null) {
      setContentView(R.layout.custom_incoming_call_rn);
      Fragment reactNativeFragment = new ReactFragment.Builder()
        .setComponentName(bundle.getString("mainComponent"))
        .setLaunchOptions(bundle)
        .setFabricEnabled(false)
        .build();


      getSupportFragmentManager()
        .beginTransaction()
        .add(R.id.reactNativeFragment, reactNativeFragment)
        .commit();

      return;
    } else{
      setContentView(R.layout.activity_call_incoming);
    }

    if (bundle != null) {
      if (bundle.containsKey("uuid")) {
        uuid = bundle.getString("uuid");
      }
    }

    lnDeclineCall = findViewById(R.id.lnDeclineCall);
    lnAcceptCall = findViewById(R.id.lnAcceptCall);

    lnAcceptCall.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View view) {
        acceptDialing();
      }
    });

    lnDeclineCall.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View view) {
        dismissDialing(Constants.ACTION_REJECTED_CALL);
      }
    });
  }

  public void dismissIncoming(String action) {
    dismissDialing(action);
  }

  private void acceptDialing() {
    active=false;
    WritableMap params = Arguments.createMap();
    Bundle bundle = getIntent().getExtras();
    if(bundle.containsKey("payload")){
      params.putString("payload",bundle.getString("payload"));
    }
    params.putString("callUUID", uuid);
    IncomingCallModule.sendEventToJs(Constants.RNNotificationAnswerAction, params);
    stopService(new Intent(this, IncomingCallService.class));
    finishAndRemoveTask();
  }

  private void dismissDialing(String action) {
    active=false;
    WritableMap params = Arguments.createMap();
    Bundle bundle = getIntent().getExtras();
    if(bundle.containsKey("payload")){
      params.putString("payload",bundle.getString("payload"));
    }
    params.putString("callUUID", uuid);
    params.putString("endAction",action);
    IncomingCallModule.sendEventToJs(Constants.RNNotificationEndCallAction, params);
    stopService(new Intent(this, IncomingCallService.class));
    finishAndRemoveTask();
  }

  public void destroyActivity(Boolean isReject) {
    active=isReject;
    finishAndRemoveTask();
  }

  @Override
  public void onBackPressed() {
    // Dont back
  }

  @Override
  public void invokeDefaultOnBackPressed() {
    super.onBackPressed();
  }
}
