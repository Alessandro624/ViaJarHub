package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO;

import it.unical.demacs.informatica.viajarhubbackend.model.Booking;
import it.unical.demacs.informatica.viajarhubbackend.model.User;

import java.time.LocalDate;
import java.util.List;

public interface UserDAO {
    User findByEmail(String email);

    User findByToken(String token);

    User findByPasswordResetToken(String token);

    List<User> findUnverifiedUsers(int minutes);

    void save(User user);

    void updatePasswordResetToken(String email, String token);

    void delete(String email);

    void removeExpiredPasswordResetTokens(int minutes);

    void removeTravelFromWishlist(String email, Long travelId);

    void insertTravelInBookingTable(String email, Long travelId, LocalDate startDate, LocalDate endDate, Booking booking);
}
