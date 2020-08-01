package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

public class UserOrToll extends AppCompatActivity {
    Button btnU, btnT;

//    @Override
//    protected void onStart() {
//        super.onStart();
//
//        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
//        Log.d("Checking ","msg "+shrd.getString("Choice","")+"cc");
//        if(shrd.getString("Choice","").toString().equalsIgnoreCase("User")){
//            Log.d("Checking","msg"+shrd.getString("ChlKuriye",""));
//            final String result = getIntent().getStringExtra("IDUser");
//            final String uri = getIntent().getStringExtra("purl");
//            final String email = getIntent().getStringExtra("email");
//            Intent intent = new Intent(UserOrToll.this, LicenseActivity.class);
//            intent.putExtra("IDUser", result);
//            intent.putExtra("purl", uri);
//            intent.putExtra("email",email);
//            startActivity(intent);
//
//        }
//        if(shrd.getString("Choice","").toString().equalsIgnoreCase("Toll")){
//            final String result = getIntent().getStringExtra("IDUser");
//            final String uri = getIntent().getStringExtra("purl");
//            final String email = getIntent().getStringExtra("email");
//            Intent intent = new Intent(UserOrToll.this, TollActivity.class);
//            intent.putExtra("IDUser", result);
//            intent.putExtra("purl", uri);
//            intent.putExtra("email",email);
//            startActivity(intent);
//
//        }
//
//    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_or_toll);

        SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);

        final String result = shrd.getString("IDUser","");
        final String uri = shrd.getString("purl","");
        final String email = shrd.getString("email","");
        btnU=findViewById(R.id.USER);
        btnU.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
                SharedPreferences.Editor editor = shrd.edit();
                editor.putString("IDUser",result);
                editor.putString("purl",uri);
                editor.putString("email",email);
                editor.apply();
                Intent intent = new Intent(UserOrToll.this, LicenseActivity.class);
                startActivity(intent);
            }
        });
        btnT=findViewById(R.id.TOLL);
        btnT.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
                SharedPreferences.Editor editor = shrd.edit();

                editor.putString("IDUser",result);
                editor.putString("purl",uri);
                editor.putString("email",email);
                editor.apply();

                Intent intent = new Intent(UserOrToll.this, TollActivity.class);
                startActivity(intent);

            }
        });
    }


}