package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class AddMoney extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_money);
        final String urlAddMoney = "https://tollbotv4.herokuapp.com/erc20/mint";
        final EditText editText = findViewById(R.id.mintAM);
        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
        final String eth = shrd.getString("ethAddress","");
        Button btnA = findViewById(R.id.buttonAM);

        btnA.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                RequestQueue requestQueue;
                final String mint = editText.getText().toString();
                requestQueue = Volley.newRequestQueue(AddMoney.this);
                final JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, urlAddMoney, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try{
                            if(response.getString("success")=="true"){
                                JSONArray jsonArray = response.getJSONArray("data");
                                JSONObject jsonObject = jsonArray.getJSONObject(0);
                                Log.d("AddMoney","Balance is "+ jsonObject);
                                Toast.makeText(AddMoney.this,"Money added succesfully", Toast.LENGTH_SHORT).show();
                                Intent intent = new Intent(AddMoney.this,PaymentCheckSafe.class);
                                startActivity(intent);
                            }
                        }catch (Exception e){
                            e.getStackTrace();
                            Toast.makeText(AddMoney.this,"Something went wrong", Toast.LENGTH_SHORT).show();
                        }


                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("CheckBalance", "Error in checking balance: "+error.toString());
                        Toast.makeText(AddMoney.this,"Something went wrong", Toast.LENGTH_SHORT).show();

                    }
                }){
                    @Override
                    public byte[] getBody() {
                        HashMap<String, String> hm =new HashMap<>();
                        hm.put("ethAddress", eth);
                        hm.put("amount", mint);
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