package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.bumptech.glide.Glide;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class TollCheck extends AppCompatActivity {

    TextView textView;
    ImageView imageView;
    ImageButton btnu, btnp, btnc;
    RequestQueue requestQueue;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_toll_check);

        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
        SharedPreferences.Editor editor = shrd.edit();
        editor.putString("Choice","Toll");
        editor.apply();

        final String usr = shrd.getString("IDUser","");
        final String eth = shrd.getString("ethAddress","");

        String purl = shrd.getString("purl","");
        Log.d("EroorDE","ms is "+purl+usr+eth);

        final String urlBalance = "https://tollbotv4.herokuapp.com/erc20/balanceOf";

        Log.d("Checking","msgTT"+shrd.getString("ChlKuriye",""));

        textView = findViewById(R.id.welcomePayTC);
        imageView = findViewById(R.id.imageTC);
        textView.setText("Hello, "+ usr);
        Glide.with(this).load(purl).into(imageView);

        btnu = findViewById(R.id.userTC);
        btnp = findViewById(R.id.generateTC);
        btnc = findViewById(R.id.checkTC);

        btnu.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(TollCheck.this, TollInfo.class);
                intent.putExtra("ethAddress",eth);
                intent.putExtra("usr",usr);

                startActivity(intent);
            }
        });

        btnp.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(TollCheck.this, GenerateQr.class);
                startActivity(intent);
            }
        });

        btnc.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                requestQueue = Volley.newRequestQueue(TollCheck.this);
                final JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, urlBalance, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try{
                            if(response.getString("success")=="true"){
                                JSONArray jsonArray = response.getJSONArray("data");
                                JSONObject jsonObject = jsonArray.getJSONObject(0);
                                Log.d("Balance","Balance is "+ jsonObject);
                                Intent intent = new Intent(TollCheck.this,CheckBalanceToll.class);
                                intent.putExtra("balance",jsonObject.getString("uint256"));
                                startActivity(intent);
                            }
                        }catch (Exception e){
                            e.getStackTrace();
                        }


                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("CheckBalance", "Error in checking balance: "+error.toString());

                    }
                }){
                    @Override
                    public byte[] getBody() {
                        HashMap<String, String> hm =new HashMap<>();
                        hm.put("ethAddress", eth);
                        return new JSONObject(hm).toString().getBytes();
                    }
                    @Override
                    public Map<String, String> getHeaders ()
                            throws AuthFailureError {
                        Map<String, String> params = new HashMap<String,
                                String>();
                        params.put("Content-Type", "application/json");
                        return params;
                    }
                };
                requestQueue.add(jsonObjectRequest);
            }
        });


    }
}