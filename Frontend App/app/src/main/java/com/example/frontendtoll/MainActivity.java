package com.example.frontendtoll;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.SignInButton;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import java.net.URI;

public class MainActivity extends AppCompatActivity {
    SignInButton signInButton;
    GoogleSignInClient mGoogleSignInClient;
    private static final int REQ_SIGN_IN = 100;
    private int alreadyLogIn;

    @Override
    protected void onStart() {
        super.onStart();
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        alreadyLogIn = 1;
        updateUI(account, alreadyLogIn);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        frontendMain();
    }

    private void frontendMain() {
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this,gso);
        signInButton = (SignInButton)findViewById(R.id.sign_in_button);
        signInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                signIn();
            }
        });
    }

    private void signIn(){
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent,100);

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == 100){
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            Log.d("signD","Data "+data);
            Log.d("signT","task "+task);
            handleSigInResult(task);
        }
    }

    private void handleSigInResult(Task<GoogleSignInAccount> task) {
        try {
            alreadyLogIn = 3;
            GoogleSignInAccount account = task.getResult(ApiException.class);
            updateUI(account, alreadyLogIn);
        }catch (ApiException e){
            alreadyLogIn = 0;
            Log.d("exception","Exception Thrown "+e.getStatusCode());
            updateUI(null, alreadyLogIn);
        }
    }

    private void updateUI(GoogleSignInAccount account, int lg) {
        if(account == null){
            Log.d("signIn","Failed ");
            frontendMain();
        }
        else if(account != null && lg == 1 ){
            newPage(account.getGivenName(), account.getPhotoUrl().toString(), account.getEmail());
        }
        else{
            frontendMain();
            Toast.makeText(this,"SignIn Successfully",Toast.LENGTH_LONG).show();
            Log.d("signIn","Success ");
            newPage(account.getGivenName(),account.getPhotoUrl().toString(), account.getEmail());
        }

    }

    private void newPage(String str, String purl, String email) {
        SharedPreferences shrd = getSharedPreferences("StoringEth", MODE_PRIVATE);
        SharedPreferences.Editor editor = shrd.edit();
        editor.putString("IDUser",str);
        editor.putString("purl",purl);
        editor.putString("email",email);
        editor.apply();
        Intent intent = new Intent(MainActivity.this,UserOrToll.class);
        startActivity(intent);
    }

}