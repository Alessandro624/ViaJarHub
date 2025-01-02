package it.unical.demacs.informatica.viajarhubbackend.controller.booking;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.Booking;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC.proxy.UserProxy;
import it.unical.demacs.informatica.viajarhubbackend.service.IEmailService;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth/v1")
public class PaymentController {
    private final IEmailService emailService;
    private final ITravelService travelService;

    public PaymentController(IEmailService emailService, ITravelService travelService) {
        this.emailService = emailService;
        this.travelService = travelService;
    }

    @PostConstruct
    public void init() {
        // Imposta la chiave segreta di Stripe
        Stripe.apiKey = "sk_test_51QXRegAy1mElwXplBtKd1JF5OfVvXMBKbOk3DVRM64FDM9d9cbfuwB8RKM5feK1yOiHwZoyIbxYIw9HTZ4rJ4WPX00QrtOIGao"; // Sostituisci con la tua chiave segreta
    }

    private void addToBooking(Long travelId, Booking booking) {
        UserProxy userProxy = SecurityUtility.getCurrentUserProxy();
        userProxy.addToBookedTravels(travelId, booking);
    }

    @RequestMapping(value = "/payment", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> paymentData) {
        String stripeApiKey = "sk_test_51QXRegAy1mElwXplBtKd1JF5OfVvXMBKbOk3DVRM64FDM9d9cbfuwB8RKM5feK1yOiHwZoyIbxYIw9HTZ4rJ4WPX00QrtOIGao";
        Stripe.apiKey = stripeApiKey;

        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            throw new RuntimeException("Chiave API Stripe non configurata.");
        }

        Map<String, Object> response = new HashMap<>();
        try {
            // Validazione dei dati in ingresso
            if (!checkNotNullPaymentData(paymentData, response) || !validatePaymentData(paymentData, response)) {
                return ResponseEntity.badRequest().body(response);
            }

            // Conversione dell'importo in centesimi
            double amount;
            Object amountObject = paymentData.get("amount");

            if (amountObject instanceof Integer) {
                amount = ((Integer) amountObject).doubleValue(); // Converti Integer in Double
            } else if (amountObject instanceof Double) {
                amount = (Double) amountObject; // Usa direttamente il Double
            } else {
                throw new IllegalArgumentException("Il valore di 'amount' non è valido.");
            }

            // Creazione del PaymentIntent
            PaymentIntentCreateParams createParams = PaymentIntentCreateParams.builder()
                    .setAmount((long) Math.round(amount * 100)) // Converti in centesimi
                    .setCurrency("eur")
                    .addPaymentMethodType("card")
                    .build();
            PaymentIntent paymentIntent = PaymentIntent.create(createParams);

            // Conferma del pagamento con un metodo di test
            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod("pm_card_visa") // Metodo di pagamento di test
                    .build();
            paymentIntent = paymentIntent.confirm(confirmParams);

            Booking booking = new Booking((Integer) paymentData.get("numeroPartecipanti"), amount, LocalDateTime.now());
            this.addToBooking(Long.valueOf((Integer) paymentData.get("travelId")), booking);

            // Risposta di successo
            response.put("success", true);
            response.put("status", paymentIntent.getStatus());
            this.sendEmail(paymentData);

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            // Risposta di errore Stripe
            response.put("success", false);
            response.put("message", "Errore durante il pagamento: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            // Risposta di errore generico
            response.put("success", false);
            response.put("message", "Errore generico: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(response);
        }
    }


    private boolean validatePaymentData(Map<String, Object> paymentData, Map<String, Object> response) {
        // TODO check amount = travel.price * participantsNumber
        // TODO check email = current user.email
        // TODO check travel existence
        // TODO check date
        Long travelId = Long.valueOf((Integer) paymentData.get("travelId"));
        int numberOfParticipants = (Integer) paymentData.get("numeroPartecipanti");
        LocalDate startDate = LocalDate.parse(paymentData.get("dataPartenza").toString());
        LocalDate endDate = LocalDate.parse(paymentData.get("dataRitorno").toString());
        System.out.println("travelId " + travelId);
        System.out.println("participantsNumber " + numberOfParticipants);
        System.out.println("startDate " + startDate);
        System.out.println("endDate " + endDate);
        // Controlla la disponibilità dei posti
        int availableSeats = travelService.getAvailableSeats(travelId, startDate, endDate);
        System.out.println("availableSeats " + availableSeats);
        if (numberOfParticipants > availableSeats) {
            response.put("success", false);
            response.put("message", "Non ci sono abbastanza posti disponibili.");
            System.out.println(response);
            return false;
        }
        // Controllo del formato del numero di carta
        String cardNumber = paymentData.get("cardNumber").toString().replaceAll(" ", "");
        if (!isValidCardNumber(cardNumber)) {
            System.out.println("sss");
            response.put("success", false);
            response.put("message", "Numero di carta non valido.");
            System.out.println(response);
            return false;
        }
        // Controllo del mese di scadenza
        int expiryMonth = (Integer) paymentData.get("expiryMonth");
        if (expiryMonth < 1 || expiryMonth > 12) {
            response.put("success", false);
            response.put("message", "Mese di scadenza non valido.");
            System.out.println(response);
            return false;
        }
        // Controllo dell'anno di scadenza
        int expiryYear = (Integer) paymentData.get("expiryYear");
        int currentYear = java.time.Year.now().getValue();
        if (expiryYear < currentYear || expiryYear > currentYear + 20) { // Limite massimo di 20 anni nel futuro
            response.put("success", false);
            response.put("message", "Anno di scadenza non valido.");
            System.out.println(response);
            return false;
        }
        // Controllo del formato del CVV
        String cvv = (String) paymentData.get("cvv");
        if (!isValidCVV(cvv)) {
            response.put("success", false);
            response.put("message", "CVV non valido.");
            System.out.println(response);
            return false;
        }
        return true;
    }

    private boolean checkNotNullPaymentData(Map<String, Object> paymentData, Map<String, Object> response) {
        if (!paymentData.containsKey("travelId") || paymentData.get("travelId") == null) {
            response.put("success", false);
            response.put("message", "Viaggio mancante o non valido.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("email") || paymentData.get("email") == null) {
            response.put("success", false);
            response.put("message", "Email mancante o non valida.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("numeroPartecipanti") || paymentData.get("numeroPartecipanti") == null) {
            response.put("success", false);
            response.put("message", "Numero partecipanti mancante o non valido.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("dataPartenza") || paymentData.get("dataPartenza") == null) {
            response.put("success", false);
            response.put("message", "Data partenza mancante o non valido.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("dataRitorno") || paymentData.get("dataRitorno") == null) {
            response.put("success", false);
            response.put("message", "Data ritorno mancante o non valido.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("amount") || paymentData.get("amount") == null) {
            response.put("success", false);
            response.put("message", "Importo mancante o non valido.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("cardNumber") || paymentData.get("cardNumber") == null) {
            response.put("success", false);
            response.put("message", "Numero di carta mancante.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("expiryMonth") || paymentData.get("expiryMonth") == null) {
            response.put("success", false);
            response.put("message", "Mese di scadenza mancante.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("expiryYear") || paymentData.get("expiryYear") == null) {
            response.put("success", false);
            response.put("message", "Anno di scadenza mancante.");
            System.out.println(response);
            return false;
        }
        if (!paymentData.containsKey("cvv") || paymentData.get("cvv") == null) {
            response.put("success", false);
            response.put("message", "CVV mancante.");
            System.out.println(response);
            return false;
        }
        return true;
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

    private void sendEmail(Map<String, Object> paymentData) {
        emailService.sendPaymentConfirmationEmail(String.valueOf(paymentData.get("email")), paymentData.get("destinazione").toString(), paymentData.get("numeroPartecipanti").toString(), paymentData.get("dataPartenza").toString(), paymentData.get("dataRitorno").toString(), paymentData.get("amount").toString());
    }
}