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

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.bumptech.glide.Glide;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class LicenseActivity extends AppCompatActivity {
    ImageView profile;
    Button add;
    EditText license, vehicleN;
    RequestQueue requestQueue;
    String createUsr = "https://tollbotv4.herokuapp.com/toll/createUser" ;

    @Override
    protected void onStart() {
        super.onStart();
        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
        Log.d("CheckingPay","msg"+shrd.getString("Choice","")+"msg");
        if(shrd.getString("ethAddress","").toString() != null && shrd.getString("ethAddress","").toString() != "" &&
                shrd.getString("Choice","").equalsIgnoreCase("User")){
            Intent intent = new Intent(LicenseActivity.this, PaymentCheckSafe.class);
            startActivity(intent);

        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_license);
        SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
        final String result = shrd.getString("IDUser","");
        final String uri = shrd.getString("purl","");
        final String email = shrd.getString("email","");
        profile = findViewById(R.id.imageView);
        Glide.with(this).load(uri).into(profile);
        Log.d("Check","Msg "+ uri);
        final String[] ethAddress = new String[1];

        final TextView textView = findViewById(R.id.textView);
        textView.setText("Welcome "+ result);

        license = findViewById(R.id.license);

        vehicleN = findViewById(R.id.license2);

        add = findViewById(R.id.TOLL);
        add.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                final Intent intent = new Intent(LicenseActivity.this, PaymentCheckSafe.class);
                final String usrLicense = license.getText().toString();
                final String usrVehicle = vehicleN.getText().toString().toUpperCase();
                Log.d("license","License "+usrLicense + createUsr);
                requestQueue = Volley.newRequestQueue(LicenseActivity.this);
                JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, createUsr, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            Log.d("CreateUserResponse","Response is "+response.toString());
                            if(response.getString("success") == "true"){
                                ethAddress[0] = response.getString("ethAddress");
                                SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
                                SharedPreferences.Editor editor = shrd.edit();

                                editor.putString("ethAddress",ethAddress[0]);
                                editor.putString("email",email);
                                editor.putString("purl",uri);
                                editor.putString("IDUser",result);
                                editor.putString("license",usrLicense);
                                editor.putString("vehicle",usrVehicle);
                                editor.apply();
//                                intent.putExtra("ethAddress", ethAddress[0]);
//                                intent.putExtra("email",email);
//                                intent.putExtra("purl",uri);
//                                intent.putExtra("IDUser",result);
//                                intent.putExtra("license",usrLicense);
                                startActivity(intent);
                                Log.d("etR","hhfhf "+ ethAddress[0]);
                            }
                            else{
//                                Toast.makeText(this,"Something went wrong..Pls try it again",Toast.LENGTH_LONG).show();
                                Log.d("creatingUsr", "Error in creating user");
                            }
                        }catch (Exception e){
                            e.getStackTrace();
                            Log.d("creatingUsrE", "Error in creating user");
                        }
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("creatingUsr", "Error in creating user: "+error.toString());
//                        Toast.makeText(this,"Something went wrong while creating a user", Toast.LENGTH_SHORT).show();
                    }
                }){
                    @Override
                    public byte[] getBody() {
                        HashMap<String, String> hm =new HashMap<>();
                        hm.put("emailAddress",email);
                        hm.put("licence",usrLicense);
                        hm.put("numberPlate", usrVehicle);
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