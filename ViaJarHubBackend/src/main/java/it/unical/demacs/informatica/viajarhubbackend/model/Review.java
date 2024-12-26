package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;
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
}
