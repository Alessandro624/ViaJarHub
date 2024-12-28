package it.unical.demacs.informatica.viajarhubbackend.controller.review;

import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.service.ReviewService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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

    @RequestMapping(value = "/create-review", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createReview(@RequestPart Review review, @RequestParam(required = false) List<MultipartFile> reviewImages) {
        System.out.println("prova");
        // System.out.println(review);
        // System.out.println(reviewImages);
        try {
            System.out.println(review);
            Review createdReview = reviewService.save(review, reviewImages);
            System.out.println(createdReview);
            if (createdReview == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
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
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /*

    @RequestMapping(value = "/delete-review", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteReview(@RequestParam("travelId") int travelId, @RequestParam("email") String email) {
        try {
            reviewService.delete(travelId, email);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }*/

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
