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
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements IUserService {
    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;
    private static final int TOKEN_EXPIRATION_MINUTES = 15;
    private static final String FRONTEND_URL = "http://localhost:4200";
    private static final String PROFILE_IMAGE_DIR = "profileImages/";

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
    public List<String> getAllUsersEmails() {
        return userDAO.findAllUsersEmails();
    }

    @Override
    public User createUser(String firstName, String lastName, LocalDate birthDate, String email, String password, UserRole role, AuthProvider provider) {
        checkNotNullFields(firstName, lastName, birthDate, email, password, role, provider);
        checkPasswordValidity(password, provider);
        checkEmailValidity(email, provider);
        checkNameValidity(firstName);
        checkNameValidity(lastName);
        checkDateValidity(birthDate);
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
    public User updateUser(String email, User user, MultipartFile profileImage) throws Exception {
        if (user == null) {
            throw new InvalidInputException("User cannot be null");
        }
        User existingUser = checkUserExistence(email);
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            checkNameValidity(user.getFirstName());
            existingUser.setFirstName(user.getFirstName());
        }
        if (user.getLastName() != null && !user.getLastName().isBlank()) {
            checkNameValidity(user.getLastName());
            existingUser.setLastName(user.getLastName());
        }
        if (profileImage != null && !profileImage.isEmpty())
            saveProfileImage(existingUser, profileImage);
        else
            deleteProfileImage(existingUser);
        userDAO.save(existingUser);
        return userDAO.findByEmail(email);
    }

    @Override
    public User makeAdmin(String email) {
        User existingUser = checkUserExistence(email);
        if (existingUser.getRole() != UserRole.ROLE_ADMIN) {
            existingUser.setRole(UserRole.ROLE_ADMIN);
            userDAO.save(existingUser);
        }
        return userDAO.findByEmail(email);
    }

    @Override
    public void forgotPassword(String email) {
        User existingUser = checkUserExistence(email);
        if (existingUser.getAuthProvider() != AuthProvider.LOCAL || existingUser.getPasswordResetToken() != null) {
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

    @Override
    public boolean validateResetPasswordToken(String token) {
        User user = userDAO.findByPasswordResetToken(token);
        return user != null && isTokenValid(user.getPasswordResetTokenCreationTime());
    }

    @Override
    public byte[] getProfileImage(String email) throws Exception {
        User user = userDAO.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        String profileImagePath = user.getProfileImagePath();
        if (profileImagePath == null || profileImagePath.isEmpty()) {
            throw new InvalidInputException("Profile image path cannot be null or empty");
        }
        Path imagePath = Path.of(PROFILE_IMAGE_DIR + profileImagePath);
        return Files.readAllBytes(imagePath);
    }

    private void checkNotNullFields(String firstName, String lastName, LocalDate birthDate, String email, String password, UserRole role, AuthProvider provider) {
        if (email == null || email.isBlank()) {
            throw new InvalidInputException("Email cannot be null");
        }
        if (password == null || password.isBlank()) {
            throw new InvalidInputException("Password cannot be null");
        }
        if (provider == null) {
            throw new InvalidInputException("Provider cannot be null");
        }
        if (role == null) {
            throw new InvalidInputException("Role cannot be null");
        }
        if (firstName == null || firstName.isBlank()) {
            throw new InvalidInputException("First name cannot be null");
        }
        if (lastName == null || lastName.isBlank()) {
            throw new InvalidInputException("Last name cannot be null");
        }
        if (birthDate == null) {
            throw new InvalidInputException("Birthdate cannot be null");
        }
    }

    private void checkDateValidity(LocalDate birthDate) {
        if (birthDate.isAfter(LocalDate.now())) {
            throw new InvalidInputException("Birth date cannot be after today");
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

    private void checkNameValidity(String name) {
        if (!name.matches("^[a-zA-Zà-üÀ-Ü ]*$")) {
            throw new InvalidInputException("Invalid name");
        }
    }

    private void checkNotDuplicate(String email) {
        if (userDAO.findByEmail(email) != null) {
            throw new UserAlreadyExistsException("User already exists");
        }
    }

    private User checkUserExistence(String email) {
        User existingUser = userDAO.findByEmail(email);
        if (existingUser == null) {
            throw new UserNotFoundException("User not found");
        }
        return existingUser;
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
        String confirmationURL = FRONTEND_URL + "/verify-email/" + user.getVerificationToken();
        emailService.sendVerificationEmail(user.getEmail(), confirmationURL);

    }

    private void sendPasswordResetEmail(String email, String token) {
        String resetURL = FRONTEND_URL + "/reset-password/" + token;
        emailService.sendPasswordResetEmail(email, resetURL);
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    private void saveProfileImage(User user, MultipartFile profileImage) throws Exception {
        String baseFileName = user.getEmail();
        String fileName = baseFileName + Objects.requireNonNull(profileImage.getOriginalFilename()).substring(profileImage.getOriginalFilename().lastIndexOf("."));
        Path path = Path.of(PROFILE_IMAGE_DIR, fileName);
        deleteProfileImage(user);
        Files.copy(profileImage.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        user.setProfileImagePath(fileName);
    }

    private void deleteProfileImage(User user) throws Exception {
        File directory = new File(PROFILE_IMAGE_DIR);
        if (!directory.exists() && !directory.mkdirs()) {
            throw new Exception("Could not create directory");
        }
        deleteExistingFiles(directory.listFiles((dir, name) -> name.startsWith(user.getEmail())));
        user.setProfileImagePath(null);
    }

    private void deleteExistingFiles(File[] existingFiles) throws Exception {
        if (existingFiles != null) {
            for (File existingFile : existingFiles) {
                if (!existingFile.delete()) {
                    throw new Exception("Could not delete existing file: " + existingFile.getName());
                }
            }
        }
    }
}
