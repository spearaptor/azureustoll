package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.widget.TextView;

public class CheckBalanceToll extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_check_balance_toll);
        TextView textView;
        String balance = getIntent().getStringExtra("balance");
        textView = findViewById(R.id.balanceCBT);
        textView.setText("Ç"+balance);
    }
}