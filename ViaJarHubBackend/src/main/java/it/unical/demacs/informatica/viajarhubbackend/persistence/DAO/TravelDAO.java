package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;

import java.util.List;

public interface TravelDAO {
    List<Travel> findAll();

    Travel findById(Long id);

    void save(Travel travel);

    void delete(Long id);
}
