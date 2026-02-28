package com.securezonenavi.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;

@CapacitorPlugin(
    name = "DirectSms",
    permissions = {
        @com.getcapacitor.annotation.Permission(
            alias = "sms",
            strings = {Manifest.permission.SEND_SMS}
        )
    }
)
public class DirectSmsPlugin extends Plugin {

    @PluginMethod
    public void send(PluginCall call) {
        JSArray numbers = call.getArray("numbers");
        String message = call.getString("message");
        
        if (numbers == null || numbers.length() == 0 || message == null || message.isEmpty()) {
            call.reject("Must provide phone numbers array and a message");
            return;
        }

        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Permission to send SMS not granted");
            return;
        }

        try {
            SmsManager smsManager = SmsManager.getDefault();
            
            // Loop through all numbers and send the message
            for (int i = 0; i < numbers.length(); i++) {
                String number = numbers.getString(i);
                
                // If message is long, it needs to be split
                ArrayList<String> parts = smsManager.divideMessage(message);
                smsManager.sendMultipartTextMessage(number, null, parts, null, null);
            }
            
            call.resolve();
        } catch (Exception e) {
            call.reject("Unable to send SMS messages", e);
        }
    }
}
