package it.unical.demacs.informatica.viajarhubbackend.model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ContactMessage {
    String subject;
    String body;
}
