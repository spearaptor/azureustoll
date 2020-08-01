package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

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

public class PaymentCheckSafe extends AppCompatActivity {

    TextView textView;
    ImageView imageView;
    ImageButton btnu, btnp, btnc, btna;
    RequestQueue requestQueue;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment_check_safe);
        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
        SharedPreferences.Editor editor = shrd.edit();
        editor.putString("Choice","User");
        editor.apply();

        final String usr = shrd.getString("IDUser","");
        final String eth = shrd.getString("ethAddress","");
        final String license = shrd.getString("license","");
        final String vehicleInfo = shrd.getString("vehicle","");
        String purl = shrd.getString("purl","");

        final String urlBalance = "https://tollbotv4.herokuapp.com/erc20/balanceOf";

        Log.d("Checking","msg"+shrd.getString("ChlKuriye",""));

        textView = findViewById(R.id.welcomePay);
        imageView = findViewById(R.id.imagePay);
        textView.setText("Hello, "+ usr);
        Glide.with(this).load(purl).into(imageView);

        btnu = findViewById(R.id.userPC);
        btnp = findViewById(R.id.payPC);
        btnc = findViewById(R.id.checkPC);
        btna = findViewById(R.id.addPC);

        btnu.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(PaymentCheckSafe.this, UserInfo.class);
                intent.putExtra("ethAddress",eth);
                intent.putExtra("usr",usr);
                intent.putExtra("license",license);
                intent.putExtra("vehicle",vehicleInfo);
                startActivity(intent);
            }
        });

        btnp.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(PaymentCheckSafe.this, QrCode.class);
                startActivity(intent);
            }
        });

        btnc.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                requestQueue = Volley.newRequestQueue(PaymentCheckSafe.this);
                final JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, urlBalance, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try{
                            if(response.getString("success")=="true"){
                                JSONArray jsonArray = response.getJSONArray("data");
                                JSONObject jsonObject = jsonArray.getJSONObject(0);
                                Log.d("Balance","Balance is "+ jsonObject);
                                Intent intent = new Intent(PaymentCheckSafe.this,CheckBalance.class);
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

        btna.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(PaymentCheckSafe.this, AddMoney.class);
                startActivity(intent);
            }
        });

    }

}