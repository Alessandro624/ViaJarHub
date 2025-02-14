package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class User implements UserDetails {
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String email;
    private String password;
    private UserRole role;
    private AuthProvider authProvider;
    private boolean enabled;
    private String verificationToken;
    private LocalDateTime verificationTokenCreationTime;
    private String passwordResetToken;
    private LocalDateTime passwordResetTokenCreationTime;
    private String profileImagePath;
    private List<Travel> wishlist;
    private List<Travel> bookedTravels;

    public User(String firstName, String lastName, LocalDate birthDate, String email, String password,
                UserRole role, AuthProvider authProvider, boolean enabled, String verificationToken,
                LocalDateTime verificationTokenCreationTime, String passwordResetToken, LocalDateTime passwordResetTokenCreationTime,
                String profileImagePath) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.email = email;
        this.password = password;
        this.role = role;
        this.authProvider = authProvider;
        this.enabled = enabled;
        this.verificationToken = verificationToken;
        this.verificationTokenCreationTime = verificationTokenCreationTime;
        this.passwordResetToken = passwordResetToken;
        this.passwordResetTokenCreationTime = passwordResetTokenCreationTime;
        this.profileImagePath = profileImagePath;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of((GrantedAuthority) role::toString);
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
