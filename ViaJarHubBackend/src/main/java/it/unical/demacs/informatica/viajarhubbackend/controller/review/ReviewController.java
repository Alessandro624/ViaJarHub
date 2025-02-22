package it.unical.demacs.informatica.viajarhubbackend.controller.review;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/open/v1")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @RequestMapping(value = "/reviews", method = RequestMethod.GET)
    public ResponseEntity<List<Review>> getAllReviews() {
        try {
            List<Review> reviews = reviewService.findAll();
            return ResponseEntity.ok().body(reviews);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/reviews-by-travel", method = RequestMethod.GET)
    public ResponseEntity<List<Review>> getReviewsByTravel(@RequestParam("travelId") int travelId) {
        try {
            List<Review> reviews = reviewService.findByTravel(travelId);
            return ResponseEntity.ok().body(reviews);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/review", method = RequestMethod.GET)
    public ResponseEntity<Review> getReview(@RequestParam("travelId") int travelId, @RequestParam("email") String email) {

        try {
            Optional<Review> review = reviewService.findReview(travelId, email);
            return review.map(value -> ResponseEntity.ok().body(value))
                    .orElseGet(() -> ResponseEntity.badRequest().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/review-images", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<byte[]>> getTravelImages(@RequestParam("id") int id,
                                                        @RequestParam("email") String email) {
        try {
            List<byte[]> imagesBytes = reviewService.getTravelImages(id, email);
            return ResponseEntity.ok()
                    .body(imagesBytes);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (TravelNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/reviews-count", method = RequestMethod.GET)
    public ResponseEntity<Integer> getReviewCountByUser(@RequestParam("email") String email) {
        try {
            int reviewCount = reviewService.countReviewsByUser(email);
            return ResponseEntity.ok().body(reviewCount);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
