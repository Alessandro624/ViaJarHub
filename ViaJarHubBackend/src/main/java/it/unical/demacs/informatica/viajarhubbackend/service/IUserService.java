package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Optional;

public interface IUserService {
    Optional<User> findByEmail(String email, AuthProvider provider);

    User createUser(String firstName, String lastName, LocalDate birthDate, String email, String password, UserRole role, AuthProvider provider);

    User updateUser(String email, User user, MultipartFile profileImage) throws Exception;

    void forgotPassword(String email);

    User resetPassword(String token, String newPassword);

    boolean validateVerificationToken(String token);

    boolean validateResetPasswordToken(String token);

    byte[] getProfileImage(String email) throws Exception;
}
