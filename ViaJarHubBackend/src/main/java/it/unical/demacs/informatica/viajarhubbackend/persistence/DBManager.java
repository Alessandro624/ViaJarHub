package it.unical.demacs.informatica.viajarhubbackend.persistence;

import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.TravelDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.UserDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC.TravelDAOJDBC;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC.UserDAOJDBC;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBManager {
    private static DBManager instance = null;
    private Connection connection = null;
    private UserDAO userDAO = null;
    private TravelDAO travelDAO = null;

    private DBManager() {
    }

    public static DBManager getInstance() {
        if (instance == null) {
            instance = new DBManager();
        }
        return instance;
    }

    public Connection getConnection() {
        if (connection == null) {
            try {
                connection = DriverManager.getConnection("jdbc:postgresql://localhost:5432/viajarhub", System.getenv("POSTGRES_USER"), System.getenv("POSTGRES_PASSWORD"));
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        }
        return connection;
    }

    public UserDAO getUserDAO() {
        if (userDAO == null) {
            userDAO = new UserDAOJDBC();
        }
        return userDAO;
    }

    public TravelDAO getTravelDAO() {
        if (travelDAO == null) {
            travelDAO = new TravelDAOJDBC();
        }
        return travelDAO;
    }
}
