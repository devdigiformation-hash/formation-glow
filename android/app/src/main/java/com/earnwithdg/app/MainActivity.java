package com.earnwithdg.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://project--decc67c2-b397-453a-98ef-1296404f6cba.lovable.app";

  @Override
    protected void onCreate(Bundle savedInstanceState) {
          super.onCreate(savedInstanceState);
          openAppInBrowser();
          finish();
    }

  private void openAppInBrowser() {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(APP_URL));
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        try {
                startActivity(intent);
        } catch (Exception error) {
                Toast.makeText(this, "Unable to open Earn with DG", Toast.LENGTH_LONG).show();
        }
  }
}
