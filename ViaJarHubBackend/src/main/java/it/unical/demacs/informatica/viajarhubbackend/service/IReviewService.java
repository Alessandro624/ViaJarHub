package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IReviewService {
    List<Review> findAll();
    List<Review> findByTravel(int id);
    List<Review> findByUser(String email);
    int countReviewsByUser(String email);
    List<byte[]> getTravelImages(int id,String email) throws Exception;
    Review updateReview(Long id, Review review, List<MultipartFile> reviewImages) throws Exception;

    Review save(Review review, List<MultipartFile> travelImages) throws Exception;
    void delete(Review review);
}
