package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Review {
    private Travel travel;
    private User user;
    private int stars;
    private String comment;
    private List<String> imagesPaths;
    private LocalDate data;
}
