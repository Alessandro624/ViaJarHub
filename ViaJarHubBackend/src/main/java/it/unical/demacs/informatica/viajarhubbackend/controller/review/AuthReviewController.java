package it.unical.demacs.informatica.viajarhubbackend.controller.review;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/auth/v1")
public class AuthReviewController {
    private final ReviewService reviewService;

    public AuthReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @RequestMapping(value = "/create-review", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createReview(@RequestPart Review review, @RequestParam(required = false) List<MultipartFile> reviewImages) {
        try {
            if (!Objects.equals(SecurityUtility.getCurrentUser().getUsername(), review.getUser().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Review createdReview = reviewService.save(review, reviewImages);
            if (createdReview == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/delete-review", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteReview(@RequestBody Review review) {
        try {
            if (!Objects.equals(SecurityUtility.getCurrentUser().getUsername(), review.getUser().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            reviewService.delete(review);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/reviews-by-user", method = RequestMethod.GET)
    public ResponseEntity<List<Review>> getReviewsByUser(@RequestParam("email") String email) {
        try {
            List<Review> reviews = reviewService.findByUser(email);
            return ResponseEntity.ok().body(reviews);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
