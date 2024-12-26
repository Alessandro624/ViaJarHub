package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class TravelRequest {
    private int offset;
    private int limit;
    private TravelFilter filters;
}
