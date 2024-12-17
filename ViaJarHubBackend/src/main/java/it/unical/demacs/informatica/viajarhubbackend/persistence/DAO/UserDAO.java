package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO;

import it.unical.demacs.informatica.viajarhubbackend.model.User;

public interface UserDAO {
    User findByEmail(String email);

    void save(User user);
}
