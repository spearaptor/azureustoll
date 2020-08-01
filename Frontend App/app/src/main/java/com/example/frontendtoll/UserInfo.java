package com.example.frontendtoll;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class UserInfo extends AppCompatActivity {
    TextView name,ethA,lic,fstatus,vehNo;
    ImageButton btnS;
    RequestQueue requestQueue;
    GoogleSignInClient mGoogleSignInClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_info);
        final String urlSignOut = "https://tollbotv4.herokuapp.com/toll/revokeUser";
        final String eth = getIntent().getStringExtra("ethAddress");
        String license = getIntent().getStringExtra("license");
        String idUsr = getIntent().getStringExtra("usr");
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this,gso);
        SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
        String vehicle = shrd.getString("vehicle","");

        name = findViewById(R.id.name);
        ethA = findViewById(R.id.eth);
        lic = findViewById(R.id.license);
        fstatus = findViewById(R.id.fstatus);
        btnS = findViewById(R.id.signUI);
        vehNo = findViewById(R.id.vehNo);

        name.setText(idUsr);
        ethA.setText(eth);
        lic.setText(license);
        fstatus.setText("Completed");
        vehNo.setText(vehicle);

        btnS.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                requestQueue = Volley.newRequestQueue(UserInfo.this);
                JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, urlSignOut, null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            Log.d("UserInfoR","Response is "+response.toString());
                            if(response.getString("success") == "true"){

                                SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
                                SharedPreferences.Editor editor = shrd.edit();
                                editor.clear();
                                editor.apply();
                                mGoogleSignInClient.signOut()
                                        .addOnCompleteListener(UserInfo.this, new OnCompleteListener<Void>() {
                                            @Override
                                            public void onComplete(@NonNull Task<Void> task) {
                                                Log.d("msgTask","Msg "+task);
                                                Toast.makeText(UserInfo.this, "Sign Out Successfully", Toast.LENGTH_LONG).show();
                                            }
                                        });

                                Intent intent = new Intent(UserInfo.this, MainActivity.class);
                                startActivity(intent);
                            }
                            else{
                                Toast.makeText(UserInfo.this, "Something went wrong.. Pls try again", Toast.LENGTH_LONG).show();
                            }
                        }catch (Exception e){
                            e.getStackTrace();
                        }

                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("UserInfoR", "Error in response Body "+ error.toString());

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