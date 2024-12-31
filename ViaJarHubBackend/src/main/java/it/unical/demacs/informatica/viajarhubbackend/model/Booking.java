package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Booking {
    private int participantsNumber;
    private double totalAmount;
    private LocalDateTime bookingDate;
}
