package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.model.Review;

import java.util.List;

public interface IReviewService {
    List<Review> findAll();
    List<Review> findByTravel(int id);
    List<Review> findByUser(String email);
    int countReviewsByUser(String email);
    Review save(Review review);
    void delete(Review review);
}
