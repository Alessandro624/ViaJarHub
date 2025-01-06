package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.*;
import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.ReviewDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService implements IReviewService {
    private final ReviewDAO reviewDAO;
    private static final String REVIEW_IMAGES_DIR = "reviewImages/";

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
        Review reviews = reviewDAO.findReview(travelId, email);
        if (reviews == null) {
            return Optional.empty();
        }
        return Optional.of(reviews);
    }

    public int countReviewsByUser(String email) {
        return reviewDAO.countReviewsByUser(email);
    }

    @Override
    public List<byte[]> getTravelImages(int id, String email) throws Exception {
        Review review = checkReviewExistence(id, email);
        List<String> reviewImagesPaths = review.getImagesPaths();
        if (reviewImagesPaths == null || reviewImagesPaths.isEmpty()) {
            return List.of();
        }
        List<byte[]> reviewImages = new ArrayList<>();
        for (String imagePath : reviewImagesPaths) {
            Path path = Path.of(REVIEW_IMAGES_DIR + id + '-' + email + '/' + imagePath);
            reviewImages.add(Files.readAllBytes(path));
        }
        return reviewImages;
    }

    @Override
    public Review save(Review review, List<MultipartFile> reviewImages) throws Exception {
        checkNotNullFields(review);
        checkNotDuplicate(review);
        if (reviewImages != null && !reviewImages.isEmpty()) {
            List<String> reviewImagesPaths = new ArrayList<>();
            for (MultipartFile multipartFile : reviewImages) {
                reviewImagesPaths.add(multipartFile.getOriginalFilename());
            }
            review.setImagesPaths(reviewImagesPaths);
        }
        reviewDAO.save(review);
        Optional<Review> savedReview = findReview(review.getTravel().getId().intValue(), review.getUser().getEmail());
        if (reviewImages != null && !reviewImages.isEmpty() && savedReview.isPresent()) {
            saveReviewImages(savedReview.get(), reviewImages);
            reviewDAO.save(savedReview.get());
        }
        return review;
    }

    @Override
    public void delete(Review review) {
        Review existingReview = checkReviewExistence(review.getTravel().getId().intValue(), review.getUser().getEmail());
        reviewDAO.delete(existingReview);
    }

    private void checkNotNullFields(Review review) {
        if (review.getTravel().getId().intValue() <= 0) {
            throw new InvalidInputException("Travel ID must be greater than 0");
        }
        if (review.getUser().getEmail() == null || review.getUser().getEmail().isBlank()) {
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
        Optional<Review> existingReview = findReview(review.getTravel().getId().intValue(), review.getUser().getEmail());
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

    private void saveReviewImages(Review review, List<MultipartFile> reviewImages) throws Exception {
        String reviewDirectory = String.valueOf(review.getTravel().getId()) + '-' + review.getUser().getEmail();
        File directory = new File(REVIEW_IMAGES_DIR + reviewDirectory);
        if (!directory.exists() && !directory.mkdirs()) {
            throw new Exception("Could not create directory");
        }
        deleteExistingFiles(directory.listFiles());
        List<String> imagesPaths = new ArrayList<>();
        for (MultipartFile reviewImage : reviewImages) {
            String fileName = String.valueOf(review.getTravel().getId()) + '-' + review.getUser().getEmail() + '-' + reviewImage.getOriginalFilename();
            Path path = Path.of(REVIEW_IMAGES_DIR + reviewDirectory, fileName);
            Files.copy(reviewImage.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            imagesPaths.add(fileName);
        }
        review.setImagesPaths(imagesPaths);
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
