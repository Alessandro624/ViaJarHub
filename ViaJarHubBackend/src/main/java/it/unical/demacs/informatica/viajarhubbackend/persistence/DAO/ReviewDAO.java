package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO;

import it.unical.demacs.informatica.viajarhubbackend.model.Review;

import java.util.List;

public interface ReviewDAO {
    List<Review> findAll();
    List<Review> findByTravel(int id);
    List<Review> findByUser(String email);
    Review findReview(int id,String email);
    int countReviewsByUser(String email);
    void save(Review review);
    void delete(Review review);
}
