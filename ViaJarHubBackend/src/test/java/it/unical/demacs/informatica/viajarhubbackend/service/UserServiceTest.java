package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserAlreadyExistsException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.UserDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class UserServiceTest {
    @Mock
    private UserDAO userDAO;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private IEmailService emailService;

    @InjectMocks
    private UserService userService;

    private static final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() {
        DBManager.getInstance().getUserDAO().delete(TEST_EMAIL);
    }

    @Test
    void createUser_withValidInput_shouldCreateUser() {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        User createdUser = userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        assertNotNull(createdUser);
        assertEquals(email, createdUser.getEmail());
    }

    @Test
    void createUser_withDuplicateEmail_shouldThrowException() {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        assertThrows(UserAlreadyExistsException.class, () -> userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider));
    }

    @Test
    void createUser_withInvalidFirstName_shouldThrowException() {
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        assertThrows(InvalidInputException.class, () -> userService.createUser("John123", "Doe", LocalDate.of(1990, 1, 1), TEST_EMAIL, password, role, provider));
    }

    @Test
    void createUser_withInvalidLastName_shouldThrowException() {
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        assertThrows(InvalidInputException.class, () -> userService.createUser("John", "Doe123", LocalDate.of(1990, 1, 1), TEST_EMAIL, password, role, provider));
    }

    @Test
    void createUser_withFutureBirthDate_shouldThrowException() {
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        assertThrows(InvalidInputException.class, () -> userService.createUser("John", "Doe", LocalDate.of(2040, 1, 1), TEST_EMAIL, password, role, provider));
    }

    @Test
    void createUser_withInvalidEmailFormat_shouldThrowException() {
        String invalidEmail = "invalid-email";
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        assertThrows(InvalidInputException.class, () -> userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), invalidEmail, password, role, provider));
    }

    @Test
    void createUser_withSimplePassword_shouldThrowException() {
        String password = "password";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        assertThrows(InvalidInputException.class, () -> userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), TEST_EMAIL, password, role, provider));
    }

    @Test
    void createUser_withNullAuthProvider_shouldThrowException() {
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = null;
        assertThrows(InvalidInputException.class, () -> userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), TEST_EMAIL, password, role, provider));
    }

    @Test
    void findByEmail_withExistingUser_shouldReturnUser() {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        Optional<User> result = userService.findByEmail(email, provider);
        assertTrue(result.isPresent());
        assertEquals(email, result.get().getEmail());
    }

    @Test
    void findByEmail_withNonExistingUser_shouldReturnEmpty() {
        Optional<User> result = userService.findByEmail(TEST_EMAIL, AuthProvider.LOCAL);
        assertTrue(result.isEmpty());
    }

    @Test
    void makeAdmin_withValidEmail_shouldPromoteUser() {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        User updatedUser = userService.makeAdmin(email);
        assertEquals(UserRole.ROLE_ADMIN, updatedUser.getRole());
    }

    @Test
    void makeAdmin_withNonExistingUser_shouldThrowException() {
        assertThrows(UserNotFoundException.class, () -> userService.makeAdmin(TEST_EMAIL));
    }

    @Test
    void updateUser_withValidProfileImage_shouldUpdateProfile() throws Exception {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        User user = userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        MultipartFile profileImage = mock(MultipartFile.class);
        when(profileImage.isEmpty()).thenReturn(false);
        when(profileImage.getOriginalFilename()).thenReturn("profile-pic.jpg");
        when(profileImage.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(profileImage.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[]{1, 2, 3}));
        User updatedUser = userService.updateUser(email, user, profileImage);
        assertNotNull(updatedUser);
    }

    @Test
    void forgotPassword_withValidEmail_shouldSendEmail() {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        userService.forgotPassword(email);
    }

    @Test
    void resetPassword_withInvalidToken_shouldThrowException() {
        assertThrows(InvalidInputException.class, () -> userService.resetPassword("invalid-token", "NewPassword1!"));
    }

    @Test
    void validateVerificationToken_withValidToken_shouldActivateUser() {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        User user = userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        String token = user.getVerificationToken();
        assertTrue(userService.validateVerificationToken(token));
        User updatedUser = userService.findByEmail(email, provider).get();
        assertTrue(updatedUser.isEnabled());
    }

    @Test
    void validateVerificationToken_withInvalidToken_shouldReturnFalse() {
        assertFalse(userService.validateVerificationToken("invalid-token"));
    }

    @Test
    void getProfileImage_withValidEmail_shouldReturnProfileImage() throws Exception {
        String email = TEST_EMAIL;
        String password = "Password1!";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        User user = userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), email, password, role, provider);
        MultipartFile profileImage = mock(MultipartFile.class);
        when(profileImage.isEmpty()).thenReturn(false);
        when(profileImage.getOriginalFilename()).thenReturn("profile-pic.jpg");
        when(profileImage.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(profileImage.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[]{1, 2, 3}));
        userService.updateUser(email, user, profileImage);
        byte[] image = userService.getProfileImage(email);
        assertNotNull(image);
        assertEquals(3, image.length);
    }

    @Test
    void getProfileImage_withNonExistentUser_shouldThrowException() {
        assertThrows(UserNotFoundException.class, () -> userService.getProfileImage("nonexistent@example.com"));
    }

    @Test
    void updateUser_withInvalidEmail_shouldThrowException() {
        String invalidEmail = "invalid@example.com";
        UserRole role = UserRole.ROLE_USER;
        AuthProvider provider = AuthProvider.LOCAL;
        User user = userService.createUser("John", "Doe", LocalDate.of(1990, 1, 1), TEST_EMAIL, "Password1!", role, provider);
        assertThrows(UserNotFoundException.class, () -> userService.updateUser(invalidEmail, user, null));
    }
}
