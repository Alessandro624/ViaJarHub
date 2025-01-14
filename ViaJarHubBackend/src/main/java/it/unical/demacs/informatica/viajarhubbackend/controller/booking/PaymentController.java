package it.unical.demacs.informatica.viajarhubbackend.controller.booking;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.param.PaymentIntentCreateParams;
import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.Booking;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
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
import java.util.Objects;
import java.util.Optional;
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
        Stripe.apiKey = System.getenv("STRIPE_VIAJARHUB");
    }

    private void addToBooking(Long travelId, Booking booking) {
        UserProxy userProxy = SecurityUtility.getCurrentUserProxy();
        userProxy.addToBookedTravels(travelId, booking);
    }

    @RequestMapping(value = "/payment", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> paymentData) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (!checkNotNullPaymentData(paymentData, response) || !validatePaymentData(paymentData, response)) {
                return ResponseEntity.badRequest().body(response);
            }
            long amount = Math.round(((Number) paymentData.get("amount")).doubleValue() * 100);
            PaymentIntentCreateParams createParams = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency("eur")
                    .addPaymentMethodType("card")
                    .build();
            PaymentIntent paymentIntent = PaymentIntent.create(createParams);
            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod("pm_card_visa")
                    .build();
            paymentIntent = paymentIntent.confirm(confirmParams);
            Booking booking = new Booking((Integer) paymentData.get("numeroPartecipanti"), ((Number) paymentData.get("amount")).doubleValue(), LocalDateTime.now());
            this.addToBooking(Long.valueOf((Integer) paymentData.get("travelId")), booking);
            response.put("success", true);
            response.put("status", paymentIntent.getStatus());
            this.sendEmail(paymentData);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            response.put("success", false);
            response.put("message", "Errore durante il pagamento: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Errore generico: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private boolean validatePaymentData(Map<String, Object> paymentData, Map<String, Object> response) {
        Long travelId = Long.valueOf((Integer) paymentData.get("travelId"));
        Optional<Travel> travel = travelService.findById(travelId, false);
        if (travel.isEmpty()) {
            response.put("success", false);
            response.put("message", "Viaggio non trovato.");
            return false;
        }
        String email = (String) paymentData.get("email");
        if (!Objects.equals(email, SecurityUtility.getCurrentUser().getUsername())) {
            response.put("success", false);
            response.put("message", "Email non valida.");
            return false;
        }
        Double amount = ((Number) paymentData.get("amount")).doubleValue();
        int numberOfParticipants = (Integer) paymentData.get("numeroPartecipanti");
        double price = travel.get().getPrice();
        if (!Objects.equals(amount, price * numberOfParticipants)) {
            response.put("success", false);
            response.put("message", "Importo non valido.");
            return false;
        }
        LocalDate startDate = LocalDate.parse(paymentData.get("dataPartenza").toString());
        if (!Objects.equals(startDate, travel.get().getStartDate())) {
            response.put("success", false);
            response.put("message", "Data di partenza non valida.");
            return false;
        }
        LocalDate endDate = LocalDate.parse(paymentData.get("dataRitorno").toString());
        if (!Objects.equals(endDate, travel.get().getEndDate())) {
            response.put("success", false);
            response.put("message", "Data di ritorno non valida.");
            return false;
        }
        int availableSeats = travelService.getAvailableSeats(travelId, startDate, endDate);
        if (numberOfParticipants > availableSeats) {
            response.put("success", false);
            response.put("message", "Non ci sono abbastanza posti disponibili.");
            return false;
        }
        String cardNumber = paymentData.get("cardNumber").toString().replaceAll(" ", "");
        if (!isValidCardNumber(cardNumber)) {
            response.put("success", false);
            response.put("message", "Numero di carta non valido.");
            return false;
        }
        int expiryMonth = (Integer) paymentData.get("expiryMonth");
        if (expiryMonth < 1 || expiryMonth > 12) {
            response.put("success", false);
            response.put("message", "Mese di scadenza non valido.");
            return false;
        }
        int expiryYear = (Integer) paymentData.get("expiryYear");
        int currentYear = java.time.Year.now().getValue();
        if (expiryYear < currentYear || expiryYear > currentYear + 20) {
            response.put("success", false);
            response.put("message", "Anno di scadenza non valido.");
            return false;
        }
        String cvv = (String) paymentData.get("cvv");
        if (!isValidCVV(cvv)) {
            response.put("success", false);
            response.put("message", "CVV non valido.");
            return false;
        }
        return true;
    }

    private boolean checkNotNullPaymentData(Map<String, Object> paymentData, Map<String, Object> response) {
        if (!paymentData.containsKey("travelId") || paymentData.get("travelId") == null) {
            response.put("success", false);
            response.put("message", "Viaggio mancante o non valido.");
            return false;
        }
        if (!paymentData.containsKey("email") || paymentData.get("email") == null) {
            response.put("success", false);
            response.put("message", "Email mancante o non valida.");
            return false;
        }
        if (!paymentData.containsKey("numeroPartecipanti") || paymentData.get("numeroPartecipanti") == null) {
            response.put("success", false);
            response.put("message", "Numero partecipanti mancante o non valido.");
            return false;
        }
        if (!paymentData.containsKey("dataPartenza") || paymentData.get("dataPartenza") == null) {
            response.put("success", false);
            response.put("message", "Data partenza mancante o non valido.");
            return false;
        }
        if (!paymentData.containsKey("dataRitorno") || paymentData.get("dataRitorno") == null) {
            response.put("success", false);
            response.put("message", "Data ritorno mancante o non valido.");
            return false;
        }
        if (!paymentData.containsKey("amount") || paymentData.get("amount") == null) {
            response.put("success", false);
            response.put("message", "Importo mancante o non valido.");
            return false;
        }
        if (!paymentData.containsKey("cardNumber") || paymentData.get("cardNumber") == null) {
            response.put("success", false);
            response.put("message", "Numero di carta mancante.");
            return false;
        }
        if (!paymentData.containsKey("expiryMonth") || paymentData.get("expiryMonth") == null) {
            response.put("success", false);
            response.put("message", "Mese di scadenza mancante.");
            return false;
        }
        if (!paymentData.containsKey("expiryYear") || paymentData.get("expiryYear") == null) {
            response.put("success", false);
            response.put("message", "Anno di scadenza mancante.");
            return false;
        }
        if (!paymentData.containsKey("cvv") || paymentData.get("cvv") == null) {
            response.put("success", false);
            response.put("message", "CVV mancante.");
            return false;
        }
        return true;
    }

    private boolean isValidCardNumber(String cardNumber) {
        Pattern pattern = Pattern.compile("^\\d{16}$");
        if (!pattern.matcher(cardNumber).matches()) {
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
        Pattern pattern = Pattern.compile("^\\d{3,4}$");
        return pattern.matcher(cvv).matches();
    }

    private void sendEmail(Map<String, Object> paymentData) {
        emailService.sendPaymentConfirmationEmail(String.valueOf(paymentData.get("email")), paymentData.get("destinazione").toString(), paymentData.get("numeroPartecipanti").toString(), paymentData.get("dataPartenza").toString(), paymentData.get("dataRitorno").toString(), paymentData.get("amount").toString());
    }
}
