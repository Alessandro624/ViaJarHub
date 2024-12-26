package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class TravelFilter {
    private LocalDate startDate;
    private LocalDate endDate;
    private double minPrice;
    private double maxPrice;
    private TravelType travelType;
}
