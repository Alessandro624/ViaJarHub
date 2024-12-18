package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserAlreadyExistsException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.UserDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements IUserService {
    // TODO gestione migliore creazione e update (casi di update dati e casi di update password dovuti a recovery request)
    // TODO eliminazione utente se non conferma l'email o se la conferma dell'email non viene inviata e magari dà errore
    // TODO possibilità di reinvio mail nei termini di 15 minuti
    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;

    public UserService(PasswordEncoder passwordEncoder, IEmailService emailService) {
        this.userDAO = DBManager.getInstance().getUserDAO();
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public Optional<User> findByEmail(String email, AuthProvider provider) {
        User user = userDAO.findByEmail(email);
        if (user == null || user.getAuthProvider() != provider) {
            return Optional.empty();
        }
        return Optional.of(user);
    }

    @Override
    public User createUser(String firstName, String lastName, String telephoneNumber, String email, String password, UserRole role, AuthProvider provider) {
        checkNotNullFields(firstName, lastName, telephoneNumber, email, password, role, provider);
        checkPasswordValidity(password, provider);
        checkEmailValidity(email, provider);
        checkNotDuplicate(email);
        boolean isEnabled = provider != AuthProvider.LOCAL;
        String token = generateVerificationToken();
        userDAO.save(new User(firstName, lastName, telephoneNumber, email, passwordEncoder.encode(password), role, provider, isEnabled, token, null));
        Optional<User> savedUser = findByEmail(email, provider);
        if (provider == AuthProvider.LOCAL && savedUser.isPresent()) {
            String confirmationURL = "http://localhost:8080/api/open/v1/verify-email?token=" + savedUser.get().getVerificationToken();
            emailService.sendEmail(savedUser.get().getEmail(), "ViaJarHub Verifica Email", "Clicca il link per verificare la tua email: " + confirmationURL);
        }
        return savedUser.orElse(null);
    }

    @Override
    public User updateUser(String email, User user) {
        if (user == null) {
            throw new InvalidInputException("User cannot be null");
        }
        checkNotNullFields(user.getFirstName(), user.getLastName(), user.getTelephoneNumber(), email, user.getPassword(), user.getRole(), user.getAuthProvider());
        checkUserExistence(email);
        user.setEmail(user.getEmail());
        userDAO.save(user);
        return userDAO.findByEmail(email);
    }

    @Override
    public void sendPasswordResetEmail(String email) {
        User user = userDAO.findByEmail(email);
        if (user == null) {
            throw new InvalidInputException("User cannot be null");
        }
        if (user.getAuthProvider() != AuthProvider.LOCAL || user.getPasswordResetToken() != null) {
            throw new InvalidInputException("Cannot send password reset email");
        }
        String token = generateVerificationToken();
        userDAO.updatePasswordResetToken(email, token);
        String resetURL = "http://localhost:8080/api/open/v1/reset-password?token=" + token;
        emailService.sendEmail(email, "ViaJarHub Reset Password", "Clicca il link per modificare la tua password: " + resetURL);
    }

    @Override
    public User resetPassword(String token, String newPassword) {
        User user = userDAO.findByPasswordResetToken(token);
        if (user == null) {
            throw new InvalidInputException("Invalid password reset token");
        }
        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new InvalidInputException("User cannot reset password");
        }
        checkPasswordValidity(newPassword, user.getAuthProvider());
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        userDAO.save(user);
        return userDAO.findByEmail(user.getEmail());
    }

    @Override
    public boolean validateVerificationToken(String token) {
        User user = userDAO.findByToken(token);
        if (user == null) {
            return false;
        }
        user.setEnabled(true);
        userDAO.save(user);
        return true;
    }

    private void checkNotNullFields(String firstName, String lastName, String telephoneNumber, String email, String password, UserRole role, AuthProvider provider) {
        if (email == null || email.isEmpty()) {
            throw new InvalidInputException("Email cannot be null");
        }
        if (password == null || password.isEmpty()) {
            throw new InvalidInputException("Password cannot be null");
        }
        if (provider == null) {
            throw new InvalidInputException("Provider cannot be null");
        }
        if (role == null) {
            throw new InvalidInputException("Role cannot be null");
        }
        if (firstName == null || firstName.isEmpty()) {
            throw new InvalidInputException("First name cannot be null");
        }
        if (lastName == null || lastName.isEmpty()) {
            throw new InvalidInputException("Last name cannot be null");
        }
        if (telephoneNumber == null || telephoneNumber.isEmpty()) {
            throw new InvalidInputException("Telephone number cannot be null");
        }
    }

    private void checkPasswordValidity(String password, AuthProvider provider) {
        if (provider == AuthProvider.LOCAL && !isPasswordComplex(password)) {
            throw new InvalidInputException("Password does not meet complexity requirements");
        }
    }

    private void checkEmailValidity(String email, AuthProvider provider) {
        if (provider == AuthProvider.LOCAL && !isValidEmail(email)) {
            throw new InvalidInputException("Incorrect email format");
        }
    }

    private void checkNotDuplicate(String email) {
        if (userDAO.findByEmail(email) != null) {
            throw new UserAlreadyExistsException("User already exists");
        }
    }

    private void checkUserExistence(String email) {
        if (userDAO.findByEmail(email) == null) {
            throw new UserNotFoundException("User not found");
        }
    }

    private boolean isPasswordComplex(String password) {
        return password.length() >= 8 &&
                password.chars().anyMatch(Character::isUpperCase) &&
                password.chars().anyMatch(Character::isLowerCase) &&
                password.chars().anyMatch(Character::isDigit) &&
                password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-z0-9.+_-]+@[A-z0-9._-]+\\.[A-z]{2,6}$");
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }
}
