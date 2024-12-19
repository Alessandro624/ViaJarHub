package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserAlreadyExistsException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.UserDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements IUserService {
    // TODO possibilità di reinvio mail nei termini di 15 minuti
    // TODO sostituire link email con link frontend che poi richiamerà endpoint del backend
    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;
    private static final int TOKEN_EXPIRATION_MINUTES = 15;
    private static final String FRONTEND_URL = "http://localhost:8080/api/open/v1";

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
    public User createUser(String firstName, String lastName, LocalDate birthDate, String email, String password, UserRole role, AuthProvider provider) {
        checkNotNullFields(firstName, lastName, birthDate, email, password, role, provider);
        checkPasswordValidity(password, provider);
        checkEmailValidity(email, provider);
        checkNotDuplicate(email);
        boolean isEnabled = provider != AuthProvider.LOCAL;
        String token = !isEnabled ? generateVerificationToken() : null;
        LocalDateTime tokenCreationTime = !isEnabled ? LocalDateTime.now() : null;
        userDAO.save(new User(firstName, lastName, birthDate, email, passwordEncoder.encode(password), role, provider, isEnabled, token, tokenCreationTime, null, null, null));
        Optional<User> savedUser = findByEmail(email, provider);
        if (provider == AuthProvider.LOCAL && savedUser.isPresent()) {
            sendVerificationEmail(savedUser.get());
        }
        return savedUser.orElse(null);
    }

    @Override
    public User updateUser(String email, User user) {
        if (user == null) {
            throw new InvalidInputException("User cannot be null");
        }
        checkNotNullFields(user.getFirstName(), user.getLastName(), user.getBirthDate(), email, user.getPassword(), user.getRole(), user.getAuthProvider());
        checkUserExistence(email);
        user.setEmail(user.getEmail());
        userDAO.save(user);
        return userDAO.findByEmail(email);
    }

    @Override
    public void forgotPassword(String email) {
        User user = userDAO.findByEmail(email);
        if (user == null) {
            throw new InvalidInputException("User cannot be null");
        }
        if (user.getAuthProvider() != AuthProvider.LOCAL || user.getPasswordResetToken() != null) {
            throw new InvalidInputException("Cannot send password reset email");
        }
        String token = generateVerificationToken();
        userDAO.updatePasswordResetToken(email, token);
        sendPasswordResetEmail(email, token);
    }

    @Override
    public User resetPassword(String token, String newPassword) {
        User user = userDAO.findByPasswordResetToken(token);
        if (user == null || !isTokenValid(user.getPasswordResetTokenCreationTime())) {
            throw new InvalidInputException("Invalid password reset token");
        }
        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new InvalidInputException("User cannot reset password");
        }
        checkPasswordValidity(newPassword, user.getAuthProvider());
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenCreationTime(null);
        userDAO.save(user);
        return userDAO.findByEmail(user.getEmail());
    }

    @Override
    public boolean validateVerificationToken(String token) {
        User user = userDAO.findByToken(token);
        if (user == null || !isTokenValid(user.getVerificationTokenCreationTime())) {
            return false;
        }
        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setVerificationTokenCreationTime(null);
        userDAO.save(user);
        return true;
    }

    private void checkNotNullFields(String firstName, String lastName, LocalDate birthDate, String email, String password, UserRole role, AuthProvider provider) {
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
        if (birthDate == null) {
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

    private boolean isTokenValid(LocalDateTime tokenCreationTime) {
        return tokenCreationTime != null && tokenCreationTime.plusMinutes(TOKEN_EXPIRATION_MINUTES).isAfter(LocalDateTime.now());
    }

    private void sendVerificationEmail(User user) {
        String confirmationURL = FRONTEND_URL + "/verify-email?token=" + user.getVerificationToken();
        emailService.sendEmail(user.getEmail(), "Verify Your Email", "Click the link to verify your email: " + confirmationURL);
    }

    private void sendPasswordResetEmail(String email, String token) {
        String resetURL = FRONTEND_URL + "/reset-password?token=" + token;
        emailService.sendEmail(email, "Reset Your Password", "Click the link to reset your password: " + resetURL);
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }
}
