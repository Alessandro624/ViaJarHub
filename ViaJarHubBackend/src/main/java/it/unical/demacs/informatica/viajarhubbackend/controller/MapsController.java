package it.unical.demacs.informatica.viajarhubbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MapsController {

        private String apiKey="AIzaSyB_MjRfLP2aXTTxyDxQ64QxkPnQhKqzB4A";

        @RequestMapping("/open/v1/map")
        public ResponseEntity<String> getMap(@RequestBody Map<String, Double> coordinates) throws Exception {
            double lat = coordinates.get("latitude");
            double lng = coordinates.get("longitude");
            System.out.println(lat + " " + lng);
            String urlStr = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=" + apiKey;
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            conn.disconnect();
            System.out.println(content.toString());
            return ResponseEntity.ok(content.toString());
        }
    }

