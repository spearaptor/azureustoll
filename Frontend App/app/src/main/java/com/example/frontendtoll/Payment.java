package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.ServerError;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

public class Payment extends AppCompatActivity {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);
        final String json = getIntent().getStringExtra("data");
            try {
                JSONObject jsonObject = new JSONObject(json);
                final String emailT = jsonObject.getString("email");
                final String car = jsonObject.getString("car");
                final String bike = jsonObject.getString("bike");
                final String truck = jsonObject.getString("truck");
                final String govt = jsonObject.getString("govt");
                SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
                final String emailU = shrd.getString("email","");
                final  String vehicle = shrd.getString("vehicle","");
                result(vehicle,emailT,emailU,car,bike,truck,govt);

            } catch (JSONException e) {
                e.printStackTrace();
            }
    }
    private void result(final String vehicle, final String emailT, final String emailU, final String car, final String bike, final String truck, final String govt){

        String urlPay = "https://tollbotv4.herokuapp.com/toll/payToll";
        RequestQueue requestQueue = Volley.newRequestQueue(Payment.this);
        final JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, urlPay, null, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {
                try{
                    Log.d("responsePay","msg "+response);
                    if(response.getString("success")=="true"){
                        JSONArray jsonArray = response.getJSONArray("data");
                        JSONObject jsonObject = jsonArray.getJSONObject(0);
                        String url = "https://goerli.etherscan.io/tx/"+jsonObject.getString("txHash");
                        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
                        SharedPreferences.Editor editor = shrd.edit();
                        editor.putString("turl",url);
                        editor.apply();
                        Log.d("PaySafe","REsponse "+ response);
                        Intent intent = new Intent(Payment.this, PaymentCheckSafe.class);
                        Toast.makeText(Payment.this,"Payment made successfully",Toast.LENGTH_LONG).show();
                        startActivity(intent);
                    }
                }catch (Exception e){
                    Toast.makeText(Payment.this,"Payment was unsuccessful",Toast.LENGTH_LONG).show();
                    e.getStackTrace();
                }


            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d("Payment", "Error in making payment: "+error.toString());
                NetworkResponse response = error.networkResponse;
                if (error instanceof ServerError && response != null) {
                    try {
                        String res = new String(response.data,
                                HttpHeaderParser.parseCharset(response.headers, "utf-8"));
                        // Now you can use any deserializer to make sense of data
                        JSONObject obj = new JSONObject(res);
                        Log.d("Payment", "Error in making payment: "+res);
                    } catch (UnsupportedEncodingException e1) {
                        // Couldn't properly decode data to string
                        Log.d("Payment", "Error in making payment1: "+e1.getMessage());
                        e1.printStackTrace();
                    } catch (JSONException e2) {
                        // returned data is not JSONObject?
                        Log.d("Payment", "Error in making payment2: "+e2.getMessage());
                        e2.printStackTrace();
                    }
                }

            }
        }){
            @Override
            public byte[] getBody() {
                JSONObject hm = new JSONObject();
                JSONObject js = new JSONObject();

                String pass = null;
                try {
                    hm.put("car", car);
                    hm.put("bike", bike);
                    hm.put("truck", truck);
                    hm.put("govt", govt);
                    js.put("UseremailAddress", emailU);
                    js.put("UserCarNumber", vehicle);
                    js.put("TollemailAddress", emailT);
                    js.put("TollPricing", hm);
                    pass = js.toString();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                Log.d("pass",pass);
                return pass.getBytes();

            }
            @Override
            public Map<String, String> getHeaders ()
                    throws AuthFailureError {
                Map<String, String> params = new HashMap<String,
                        String>();
                params.put("Content-Type", "application/json; charset=utf-8");
                return params;
            }
        };
        requestQueue.add(jsonObjectRequest);

    }
}