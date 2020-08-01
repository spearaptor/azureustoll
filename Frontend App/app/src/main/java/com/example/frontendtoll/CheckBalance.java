package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

public class CheckBalance extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_check_balance);
        TextView textView;
        textView = findViewById(R.id.balanceCB);
        String balance = getIntent().getStringExtra("balance");
        textView.setText("Ç"+balance);
        Button btn = findViewById(R.id.checkTra);
        btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(CheckBalance.this,WebClass.class);
                startActivity(intent);
            }
        });

    }
}