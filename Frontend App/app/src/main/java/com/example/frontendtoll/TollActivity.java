package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
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
import com.bumptech.glide.Glide;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

public class TollActivity extends AppCompatActivity {
    ImageView profile;
    EditText docId,car,bike,truck,govt;

    @Override
    protected void onStart() {
        super.onStart();
        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
        Log.d("CheckingPay","msg"+shrd.getString("Choice","")+"msg");
        if(shrd.getString("ethAddress","").toString() != null && shrd.getString("ethAddress","").toString() != ""
                && shrd.getString("Choice","").equalsIgnoreCase("Toll")){
            Intent intent = new Intent(TollActivity.this, TollCheck.class);
            startActivity(intent);

        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_toll);

        final String[] ethAddress = new String[1];

        SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
        final String result = shrd.getString("IDUser","");
        final String uri = shrd.getString("purl","");
        final String email = shrd.getString("email","");
        final String urlToll =  "https://tollbotv4.herokuapp.com/toll/createToll";
        profile = findViewById(R.id.imageView);
        Glide.with(this).load(uri).into(profile);
        Log.d("Check","Msg "+ uri);

        TextView textView = findViewById(R.id.textView);
        textView.setText("Welcome "+ result);

        docId = findViewById(R.id.licenseTA);
        car = findViewById(R.id.carTA);
        bike = findViewById(R.id.BikeTA);
        truck = findViewById(R.id.TruckTA);
        govt = findViewById(R.id.govtTA);



        Button btnA = findViewById(R.id.TOLLC);
        btnA.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                final Intent intent = new Intent(TollActivity.this, TollCheck.class);
                final String carP = car.getText().toString();
                final String bikeP = bike.getText().toString();
                final String truckP = truck.getText().toString();
                final String govtP = govt.getText().toString();
                final String docIdP = docId.getText().toString();
               RequestQueue requestQueue = Volley.newRequestQueue(TollActivity.this);
               Log.d("TollChecking"," msg "+ docIdP + carP + bikeP + govtP );
                JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, urlToll, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            Log.d("UserInfoRS","Response is "+response.toString());
                            if(response.getString("success") == "true"){
                                Toast.makeText(TollActivity.this, "Sign in Successfully", Toast.LENGTH_LONG).show();
                                ethAddress[0] = response.getString("ethAddress");
                                SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
                                SharedPreferences.Editor editor = shrd.edit();

                                editor.putString("ethAddress",ethAddress[0]);
                                editor.putString("email",email);
                                editor.putString("purl",uri);
                                editor.putString("IDUser",result);
                                editor.putString("car",carP);
                                editor.putString("bike",bikeP);
                                editor.putString("truck",truckP);
                                editor.putString("govt",govtP);
                                editor.putString("license",docIdP);
                                editor.apply();
                                intent.putExtra("Cool",carP);
                                startActivity(intent);

                            }
                            else{
                                Toast.makeText(TollActivity.this, "Something went wrong.. Pls try again", Toast.LENGTH_LONG).show();
                            }
                        }catch (Exception e){
                            e.getStackTrace();
                        }

                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("UserInfoR", "Error in response Body "+ error.toString());
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
                        HashMap<String, String> hm =new HashMap<>();
                        hm.put("car",carP);
                        hm.put("bike",bikeP);
                        hm.put("truck",truckP);
                        hm.put("govt",govtP);
                        JSONObject js = new JSONObject();
                        JSONObject js1 = new JSONObject(hm);
                        try {
                            js.put("emailAddress",email);
                            js.put("documentId",docIdP);
                            js.put("tollPricing",js1);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        return js.toString().getBytes();
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