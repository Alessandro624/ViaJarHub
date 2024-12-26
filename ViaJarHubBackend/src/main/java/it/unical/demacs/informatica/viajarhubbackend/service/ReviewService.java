package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.*;
import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.ReviewDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService implements IReviewService {
    private final ReviewDAO reviewDAO;

    public ReviewService() {
        this.reviewDAO = DBManager.getInstance().getReviewDAO();
    }

    public List<Review> findAll() {
        return reviewDAO.findAll();
    }

    public List<Review> findByTravel(int travelId) {
        return reviewDAO.findByTravel(travelId);
    }

    public List<Review> findByUser(String email) {
        return reviewDAO.findByUser(email);
    }

    public Optional<Review> findReview(int travelId, String email) {
        Review reviews=reviewDAO.findReview(travelId,email);
        if(reviews==null) {
            return Optional.empty();
        }

        return Optional.of(reviews);
    }



    public int countReviewsByUser(String email) {
        return reviewDAO.countReviewsByUser(email);
    }

    @Override
    public Review save(Review review) {
        checkNotNullFields(review);
        checkNotDuplicate(review);
        reviewDAO.save(review);
        return review;

    }

    @Override
    public void delete(Review review) {
        Review existingReview = checkReviewExistence(review.getIdTravel(), review.getEmailUser());
        reviewDAO.delete(existingReview);

    }

    private void checkNotNullFields(Review review) {
        if (review.getIdTravel() <= 0) {
            throw new InvalidInputException("Travel ID must be greater than 0");
        }
        if (review.getEmailUser() == null || review.getEmailUser().isBlank()) {
            throw new InvalidInputException("Email cannot be null or blank");
        }
        if (review.getStars() < 1 || review.getStars() > 5) {
            throw new InvalidInputException("Stars must be between 1 and 5");
        }
        if (review.getComment() == null || review.getComment().isBlank()) {
            throw new InvalidInputException("Comment cannot be null or blank");
        }
    }

    private void checkNotDuplicate(Review review) {
        Optional<Review> existingReview = findReview(review.getIdTravel(), review.getEmailUser());
        if (existingReview.isPresent()) {
            throw new ReviewAlreadyExistsException("Review already exists for this travel and user");
        }
    }

    private Review checkReviewExistence(int travelId, String email) {
        Optional<Review> existingReview = findReview(travelId, email);
        if (existingReview.isEmpty()) {
            throw new ReviewNotFoundException("Review not found");
        }
        return existingReview.get();
    }
}
