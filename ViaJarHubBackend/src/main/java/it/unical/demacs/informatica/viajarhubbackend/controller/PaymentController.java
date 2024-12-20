package it.unical.demacs.informatica.viajarhubbackend.controller;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.param.ChargeCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.service.EmailService;
import it.unical.demacs.informatica.viajarhubbackend.service.IEmailService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth/v1")
public class PaymentController {
    private final EmailService emailService;

    public PaymentController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostConstruct
    public void init() {
        // Imposta la chiave segreta di Stripe
        Stripe.apiKey = "sk_test_51QXRegAy1mElwXplBtKd1JF5OfVvXMBKbOk3DVRM64FDM9d9cbfuwB8RKM5feK1yOiHwZoyIbxYIw9HTZ4rJ4WPX00QrtOIGao"; // Sostituisci con la tua chiave segreta
    }

    @RequestMapping(value = "/payment", method = RequestMethod.POST)

    public ResponseEntity processPayment(@RequestBody Map<String, Object> paymentData) {
        String stripeApiKey = "sk_test_51QXRegAy1mElwXplBtKd1JF5OfVvXMBKbOk3DVRM64FDM9d9cbfuwB8RKM5feK1yOiHwZoyIbxYIw9HTZ4rJ4WPX00QrtOIGao";
        Stripe.apiKey = stripeApiKey;
        System.out.println(stripeApiKey);
        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            throw new RuntimeException("Chiave API Stripe non configurata.");
        }

        Map<String, Object> response = new HashMap<>();

        try {
            // Validazione dei dati in ingresso
            if (!paymentData.containsKey("amount") || paymentData.get("amount") == null) {
                response.put("success", false);
                response.put("message", "Importo mancante o non valido.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);
            }

            if (!paymentData.containsKey("cardNumber") || paymentData.get("cardNumber") == null) {

                response.put("success", false);
                response.put("message", "Numero di carta mancante.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            if (!paymentData.containsKey("expiryMonth") || paymentData.get("expiryMonth") == null) {
                response.put("success", false);
                response.put("message", "Mese di scadenza mancante.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            if (!paymentData.containsKey("expiryYear") || paymentData.get("expiryYear") == null) {
                response.put("success", false);
                response.put("message", "Anno di scadenza mancante.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            if (!paymentData.containsKey("cvv") || paymentData.get("cvv") == null) {
                response.put("success", false);
                response.put("message", "CVV mancante.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            // Controllo del formato del numero di carta
            String cardNumber=paymentData.get("cardNumber").toString().replaceAll(" ","");
            if (!isValidCardNumber(cardNumber)) {
                System.out.println("sss");
                response.put("success", false);
                response.put("message", "Numero di carta non valido.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            // Controllo del mese di scadenza
            int expiryMonth = (Integer) paymentData.get("expiryMonth");
            if (expiryMonth < 1 || expiryMonth > 12) {
                response.put("success", false);
                response.put("message", "Mese di scadenza non valido.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            // Controllo dell'anno di scadenza
            int expiryYear = (Integer) paymentData.get("expiryYear");
            int currentYear = java.time.Year.now().getValue();
            if (expiryYear < currentYear || expiryYear > currentYear + 20) { // Limite massimo di 20 anni nel futuro
                response.put("success", false);
                response.put("message", "Anno di scadenza non valido.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            // Controllo del formato del CVV
            String cvv = (String) paymentData.get("cvv");
            if (!isValidCVV(cvv)) {
                response.put("success", false);
                response.put("message", "CVV non valido.");
                System.out.println(response.toString());
                return ResponseEntity.badRequest().body(response);

            }

            // Conversione dell'importo in centesimi
            long amount = ((Integer) paymentData.get("amount")) * 100L;

            // Creazione del PaymentIntent
            PaymentIntentCreateParams createParams = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency("eur")
                    .addPaymentMethodType("card")
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(createParams);

            // Conferma del pagamento con un metodo di test
            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod("pm_card_visa") // Metodo di pagamento di test
                    .build();

            paymentIntent = paymentIntent.confirm(confirmParams);

            // Risposta di successo
            response.put("success", true);
            response.put("status", paymentIntent.getStatus());
            System.out.println(response.toString());
            this.sendEmail(paymentData);
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            // Risposta di errore Stripe
            response.put("success", false);
            response.put("message", "Errore durante il pagamento: " + e.getMessage());
            System.out.println(response.toString());
            return ResponseEntity.badRequest().body(response);


        } catch (Exception e) {
            // Risposta di errore generico
            response.put("success", false);
            response.put("message", "Errore generico: " + e.getMessage());
            e.printStackTrace();
            System.out.println(response.toString());
            return ResponseEntity.badRequest().body(response);

        }
    }

    private boolean isValidCardNumber(String cardNumber) {
        // Controllo base per il numero di carta (Luhn Algorithm)
        Pattern pattern = Pattern.compile("^\\d{16}$");
        if (!pattern.matcher(cardNumber).matches()) {
            System.out.println("a");
            return false;
        }
        return luhnCheck(cardNumber);
    }

    private boolean luhnCheck(String cardNumber) {
        int sum = 0;
        boolean alternate = false;
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(cardNumber.substring(i, i + 1));
            if (alternate) {
                n *= 2;
                if (n > 9) {
                    n = (n % 10) + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }

    private boolean isValidCVV(String cvv) {
        // CVV deve essere 3-4 cifre
        Pattern pattern = Pattern.compile("^\\d{3,4}$");
        return pattern.matcher(cvv).matches();
    }

    private void sendEmail( Map<String, Object> paymentData){
        String htmlBody = "<!DOCTYPE html>" +
                "<html>" +
                "<head><title>Conferma Prenotazione</title></head>" +
                "<body style=\"font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 20px;\">" +
                "<img src=\"cid:logo\" alt=\"Logo\" style=\"max-width: 150px; margin-bottom: 20px;\">" +
                "<h2 style=\"color: #333;\">Conferma della tua Prenotazione</h2>" +
                "<p style=\"color: #555;\">Grazie per aver prenotato con noi! Ecco i dettagli della tua prenotazione:</p>" +
                "<table style=\"margin: 0 auto; border-collapse: collapse;\">" +
                "<tr><td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold;\">Destinazione</td><td style=\"padding: 10px; border: 1px solid #ddd;\">" + paymentData.get("destinazione") + "</td></tr>" +
                "<tr><td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold;\">Numero di Partecipanti</td><td style=\"padding: 10px; border: 1px solid #ddd;\">" + paymentData.get("numeroPartecipanti") + "</td></tr>" +
                "<tr><td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold;\">Data di Partenza</td><td style=\"padding: 10px; border: 1px solid #ddd;\">" + paymentData.get("dataPartenza") + "</td></tr>" +
                "<tr><td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold;\">Data di Ritorno</td><td style=\"padding: 10px; border: 1px solid #ddd;\">" + paymentData.get("dataRitorno") + "</td></tr>" +
                "<tr><td style=\"padding: 10px; border: 1px solid #ddd; font-weight: bold;\">Prezzo Totale</td><td style=\"padding: 10px; border: 1px solid #ddd;\">€" +paymentData.get("amount") + "</td></tr>" + "</table>" +
                "<p style=\"margin-top: 20px; font-size: 14px; color: #555;\">Se non hai effettuato questa prenotazione, ignora questo messaggio.</p>" +
                "</body>" +
                "</html>";
        emailService.sendEmail(String.valueOf(paymentData.get("email")), "Reset Your Password",htmlBody);

    }
}

