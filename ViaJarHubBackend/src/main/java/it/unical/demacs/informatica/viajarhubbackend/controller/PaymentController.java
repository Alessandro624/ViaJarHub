package it.unical.demacs.informatica.viajarhubbackend.controller;
import com.stripe.Stripe;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.param.ChargeCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/v1")
public class PaymentController {
    @PostConstruct
    public void init() {
        // Imposta la chiave segreta di Stripe
        Stripe.apiKey = "sk_test_51QXRegAy1mElwXplBtKd1JF5OfVvXMBKbOk3DVRM64FDM9d9cbfuwB8RKM5feK1yOiHwZoyIbxYIw9HTZ4rJ4WPX00QrtOIGao"; // Sostituisci con la tua chiave segreta
    }

    @RequestMapping(value = "/payment",method = RequestMethod.POST)

    public Map<String, Object> processPayment(@RequestBody Map<String, Object> paymentData) {
        String stripeApiKey = "sk_test_51QXRegAy1mElwXplBtKd1JF5OfVvXMBKbOk3DVRM64FDM9d9cbfuwB8RKM5feK1yOiHwZoyIbxYIw9HTZ4rJ4WPX00QrtOIGao";
        System.out.println(stripeApiKey);


        //TODO aggiungere i controlli prima di inviare

        if (stripeApiKey == null) {
            throw new RuntimeException("Chiave API Stripe non configurata.");
        }
        Stripe.apiKey = stripeApiKey;

        try {
            PaymentIntentCreateParams createParams = PaymentIntentCreateParams.builder()
                    .setAmount(((Integer) paymentData.get("amount")) * 100L) // Converti in centesimi
                    .setCurrency("eur")
                    .addPaymentMethodType("card")
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(createParams);

            // Conferma il pagamento
            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod("pm_card_visa") // Metodo di pagamento di test
                    .build();

            paymentIntent = paymentIntent.confirm(confirmParams);
            Map<String, Object> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("status", paymentIntent.getStatus());


            return response;


        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Errore durante il pagamento: " + e.getMessage());
        }

    }
}
