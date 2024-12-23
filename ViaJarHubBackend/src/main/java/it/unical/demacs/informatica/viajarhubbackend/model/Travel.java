package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Travel {
    private Long id;
    private String destination;
    private boolean isCountry;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private double oldPrice;
    private double price;
    private int maxParticipantsNumber;
    private TravelType travelType;
    private List<String> imagesPaths;
    private double latitude;
    private double longitude;
}
