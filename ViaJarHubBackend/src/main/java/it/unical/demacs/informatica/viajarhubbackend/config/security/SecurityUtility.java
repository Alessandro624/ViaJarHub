package it.unical.demacs.informatica.viajarhubbackend.config.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtility {
    public static UserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                return (UserDetails) principal;
            } else {
                throw new RuntimeException("Authentication principal must be an instance of UserDetails");
            }
        }
        return null;
    }
}
