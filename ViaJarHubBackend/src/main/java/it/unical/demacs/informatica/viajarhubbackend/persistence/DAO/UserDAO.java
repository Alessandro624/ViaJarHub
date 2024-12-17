package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO;

import it.unical.demacs.informatica.viajarhubbackend.model.User;

public interface UserDAO {
    User findByEmail(String email);

    User findByToken(String token);

    void save(User user);
}
