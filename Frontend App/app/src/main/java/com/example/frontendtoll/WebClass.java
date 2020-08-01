package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class WebClass extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_class);
        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
        String url = shrd.getString("turl","");

        WebView theWebPage = new WebView(this);
        theWebPage.getSettings().setJavaScriptEnabled(true);
        theWebPage.getSettings().setPluginState(WebSettings.PluginState.ON);
        setContentView(theWebPage);
        theWebPage.loadUrl(url);
    }
}