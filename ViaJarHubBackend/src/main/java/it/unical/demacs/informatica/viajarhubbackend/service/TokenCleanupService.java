package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.UserDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TokenCleanupService {
    private final UserDAO userDAO;

    public TokenCleanupService() {
        this.userDAO = DBManager.getInstance().getUserDAO();
    }

    @Scheduled(fixedRate = 60000)
    public void deleteUnverifiedUsers() {
        List<User> unverifiedUsers = userDAO.findUnverifiedUsers(15);
        for (User user : unverifiedUsers) {
            userDAO.delete(user.getEmail());
        }
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredPasswordResetTokens() {
        userDAO.removeExpiredPasswordResetTokens(15);
    }
}
