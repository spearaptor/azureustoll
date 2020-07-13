package com.example.toll;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import tech.gusavila92.websocketclient.WebSocketClient;

public class MainActivity extends AppCompatActivity {



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        doTransaction();
        //getTransaction();

    }
    private void doTransaction(){
        RequestQueue requestQueue;
        requestQueue = Volley.newRequestQueue(this);
        JsonObjectRequest jsonObjectRequest1 = new JsonObjectRequest(Request.Method.POST,
                "https://beta-api.ethvigil.com/v0.1/contract/0xaa0e3fc7e84301d6a087a7bea7f001d19facbe7c/incrementCounter", null,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            Log.d("post", "The response is" + response.toString());
                        } catch (Exception e) {
                            e.getStackTrace();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Log.d("tollResponse","Something went wrong in response");
            }
        }){    //this is the part, that adds the header to the request
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> params = new HashMap<String, String>();
                params.put("X-API-KEY", "");
                return params;
            }

            @Override
            public byte[] getBody() {
                HashMap<String,String> para = new HashMap<>();
                para.put("inc","4");
                return new JSONObject(para).toString().getBytes();
            }
        };
        requestQueue.add(jsonObjectRequest1);
    }

    private void getTransaction(){
        RequestQueue requestQueue;
        requestQueue = Volley.newRequestQueue(this);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET,
                "https://beta-api.ethvigil.com/v0.1/contract/0xaa0e3fc7e84301d6a087a7bea7f001d19facbe7c/getPubCounter",
                null, new Response.Listener<JSONObject>() {
            @Override
            public void onResponse(JSONObject response) {
                JSONArray jsonArray ;
                try {
                    Log.d("myapp", "The response is" + response.getString("data"));
                    jsonArray = response.getJSONArray("data");
                    for(int i=0; i<jsonArray.length(); i++){
                        JSONObject jsonObject = jsonArray.getJSONObject(i);
                        Log.d("myapp1", "The response is" + jsonObject.getString("uint256"));
                    }
                } catch (Exception e) {
                    e.getStackTrace();
                }
            }
        },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d("tollResponse","Something went wrong");
                    }
                });

        requestQueue.add(jsonObjectRequest);
    }

    private void onCreateWebSocket(){
        URI uri;
        try {
            uri = new URI("");
        } catch (URISyntaxException e) {
            e.printStackTrace();
            return;
        }
        WebSocketClient webSocketClient = new WebSocketClient(uri) {
            @Override
            public void onOpen() {

            }

            @Override
            public void onTextReceived(String message) {

            }

            @Override
            public void onBinaryReceived(byte[] data) {

            }

            @Override
            public void onPingReceived(byte[] data) {

            }

            @Override
            public void onPongReceived(byte[] data) {

            }

            @Override
            public void onException(Exception e) {

            }

            @Override
            public void onCloseReceived() {

            }
        };
    }
}
