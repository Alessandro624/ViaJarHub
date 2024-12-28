package it.unical.demacs.informatica.viajarhubbackend.controller.review;

import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.service.ReviewService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/auth/v1")
public class AuthReviewController {
    private final ReviewService reviewService;

    public AuthReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }
    @RequestMapping(value = "/create-review", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createReview(@RequestPart Review review, @RequestParam List<MultipartFile> reviewImages) {
        System.out.println(review);
        System.out.println(reviewImages);
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
}
