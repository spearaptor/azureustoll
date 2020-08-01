package com.example.frontendtoll;

import androidx.appcompat.app.AppCompatActivity;

import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;

import org.json.JSONObject;

public class GenerateQr extends AppCompatActivity {

    ImageView imageView;
    Button button;
    EditText editText;
    String EditTextValue ;
    Thread thread ;
    public final static int QRcodeWidth = 500 ;
    Bitmap bitmap ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_generate_qr);

        imageView = (ImageView)findViewById(R.id.imageView);


        SharedPreferences shrd = getSharedPreferences("StoringEth",MODE_PRIVATE);
        final String emailT = shrd.getString("email","");
        final String car = shrd.getString("car","");
        final String bike = shrd.getString("bike","");
        final String truck = shrd.getString("truck","");
        final String govt = shrd.getString("govt","");
        Log.d("errorResolve","msg "+emailT + car + bike +truck+govt);
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("email",emailT);
            jsonObject.put("car",car);
            jsonObject.put("truck",truck);
            jsonObject.put("bike",bike);
            jsonObject.put("govt",govt);
            String s = jsonObject.toString();
            Log.d("jsonCheck","msg "+s);
            bitmap = TextToImageEncode(s);
            imageView.setImageBitmap(bitmap);
        }catch (Exception e){
            e.getStackTrace();
        }
    }


    Bitmap TextToImageEncode(String Value) throws WriterException {
        BitMatrix bitMatrix;
        try {
            bitMatrix = new MultiFormatWriter().encode(
                    Value,
                    BarcodeFormat.DATA_MATRIX.QR_CODE,
                    QRcodeWidth, QRcodeWidth, null
            );

        } catch (IllegalArgumentException Illegalargumentexception) {

            return null;
        }
        int bitMatrixWidth = bitMatrix.getWidth();

        int bitMatrixHeight = bitMatrix.getHeight();

        int[] pixels = new int[bitMatrixWidth * bitMatrixHeight];

        for (int y = 0; y < bitMatrixHeight; y++) {
            int offset = y * bitMatrixWidth;

            for (int x = 0; x < bitMatrixWidth; x++) {

                pixels[offset + x] = bitMatrix.get(x, y) ?
                        Color.BLACK :Color.WHITE;
            }
        }
        Bitmap bitmap = Bitmap.createBitmap(bitMatrixWidth, bitMatrixHeight, Bitmap.Config.ARGB_4444);

        bitmap.setPixels(pixels, 0, 500, 0, 0, bitMatrixWidth, bitMatrixHeight);
        return bitmap;
    }



}