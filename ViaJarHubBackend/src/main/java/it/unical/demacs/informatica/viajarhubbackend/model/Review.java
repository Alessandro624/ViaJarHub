package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Review {
    private int idTravel;
    private String emailUser;
    private int stars;
    private String comment;
    private List<String> imagesPaths;
}
