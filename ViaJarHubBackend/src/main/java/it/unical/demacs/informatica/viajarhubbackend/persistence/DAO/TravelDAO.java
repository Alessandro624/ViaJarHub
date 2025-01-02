package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;

import java.time.LocalDate;
import java.util.List;

public interface TravelDAO {
    List<Travel> findAll(LocalDate startDate);

    List<Travel> findAllByUserWishlist(String email, LocalDate startDate);

    List<Travel> findAllPaginated(int offset, int limit, TravelFilter filters);

    Travel findById(Long id, LocalDate startDate);

    List<String> getSuggestions(TravelFilter filters);

    double getAvgStars(Long id, LocalDate startDate);

    void save(Travel travel);

    void delete(Long id);

    int countTravels(TravelFilter filters);

    String findNameById(Long id);
    Long getMaxPrice(boolean isAdmin);
    int getAvailableSeats(Long id, LocalDate startDate, LocalDate endDate);

    List<Travel> findAllReviewable(String email);

    List<Travel> findAllByUserBooking(String email);
}
