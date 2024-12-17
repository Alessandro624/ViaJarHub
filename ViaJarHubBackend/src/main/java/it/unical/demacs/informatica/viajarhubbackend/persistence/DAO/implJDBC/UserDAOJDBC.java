package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC;

import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.UserDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAOJDBC implements UserDAO {
    private final Connection connection;

    public UserDAOJDBC() {
        this.connection = DBManager.getInstance().getConnection();
    }

    @Override
    public User findByEmail(String email) {
        String query = "SELECT email, password, role, provider, firstname, lastname, telephone, enabled, token FROM \"user\" WHERE email = ?";
        return getUser(email, query);
    }

    @Override
    public User findByToken(String token) {
        String query = "SELECT email, password, role, provider, firstname, lastname, telephone, enabled, token FROM \"user\" WHERE token = ?";
        return getUser(token, query);
    }

    @Override
    public void save(User user) {
        String query = "INSERT INTO \"user\" (email, password, role, provider, firstname, lastname, telephone, enabled, token) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?) "
                + "ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, enabled = EXCLUDED.enabled, token = EXCLUDED.token";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, user.getEmail());
            statement.setString(2, user.getPassword());
            statement.setString(3, user.getRole().toString());
            statement.setString(4, user.getAuthProvider().toString());
            statement.setString(5, user.getFirstName());
            statement.setString(6, user.getLastName());
            statement.setString(7, user.getTelephoneNumber());
            statement.setBoolean(8, user.isEnabled());
            statement.setString(9, user.getVerificationToken());
            statement.executeUpdate();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    private User getUser(String key, String query) {
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, key);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return new User(resultSet.getString("firstname"),
                        resultSet.getString("lastname"),
                        resultSet.getString("telephone"),
                        resultSet.getString("email"),
                        resultSet.getString("password"),
                        UserRole.valueOf(resultSet.getString("role")),
                        AuthProvider.valueOf(resultSet.getString("provider")),
                        resultSet.getBoolean("enabled"),
                        resultSet.getString("token"));
            }
            return null;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }
}
