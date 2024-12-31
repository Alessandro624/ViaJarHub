package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC;

import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.TravelDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.UserDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAOJDBC implements UserDAO {
    private final Connection connection;

    public UserDAOJDBC() {
        this.connection = DBManager.getInstance().getConnection();
    }

    @Override
    public User findByEmail(String email) {
        String query = "SELECT email, password, role, provider, firstname, lastname, birthdate, profile_image_path, enabled, verification_token, token_creation_time, password_reset_token, password_reset_token_creation_time FROM \"user\" WHERE email = ?";
        return getUser(email, query);
    }

    @Override
    public User findByToken(String token) {
        String query = "SELECT email, password, role, provider, firstname, lastname, birthdate, profile_image_path, enabled, verification_token, token_creation_time, password_reset_token, password_reset_token_creation_time FROM \"user\" WHERE verification_token = ?";
        return getUser(token, query);
    }

    @Override
    public User findByPasswordResetToken(String token) {
        String query = "SELECT email, password, role, provider, firstname, lastname, birthdate, profile_image_path, enabled, verification_token, token_creation_time, password_reset_token, password_reset_token_creation_time FROM \"user\" WHERE password_reset_token = ?";
        return getUser(token, query);
    }

    @Override
    public List<User> findUnverifiedUsers(int minutes) {
        String query = "SELECT * FROM \"user\" WHERE enabled = FALSE AND now()-token_creation_time > (? * INTERVAL '1 minute')";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, minutes);
            ResultSet resultSet = statement.executeQuery();
            List<User> users = new ArrayList<>();
            while (resultSet.next()) {
                users.add(mapResultSetToUser(resultSet));
            }
            return users;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public void save(User user) {
        String query = "INSERT INTO \"user\" (email, password, role, provider, firstname, lastname, birthdate, profile_image_path, enabled, verification_token, token_creation_time, password_reset_token, password_reset_token_creation_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
                + "ON CONFLICT (email) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname, password = EXCLUDED.password, birthdate = EXCLUDED.birthdate, profile_image_path = EXCLUDED.profile_image_path, role = EXCLUDED.role, enabled = EXCLUDED.enabled, verification_token = EXCLUDED.verification_token, token_creation_time = EXCLUDED.token_creation_time, password_reset_token = EXCLUDED.password_reset_token, password_reset_token_creation_time = EXCLUDED.password_reset_token_creation_time";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, user.getEmail());
            statement.setString(2, user.getPassword());
            statement.setString(3, user.getRole().toString());
            statement.setString(4, user.getAuthProvider().toString());
            statement.setString(5, user.getFirstName());
            statement.setString(6, user.getLastName());
            statement.setObject(7, user.getBirthDate());
            statement.setString(8, user.getProfileImagePath());
            statement.setBoolean(9, user.isEnabled());
            statement.setString(10, user.getVerificationToken());
            statement.setTimestamp(11, user.getVerificationTokenCreationTime() != null ? Timestamp.valueOf(user.getVerificationTokenCreationTime()) : null);
            statement.setString(12, user.getPasswordResetToken());
            statement.setTimestamp(13, user.getPasswordResetTokenCreationTime() != null ? Timestamp.valueOf(user.getPasswordResetTokenCreationTime()) : null);
            statement.executeUpdate();
            List<Travel> wishlistTravels = user.getWishlist();
            if (wishlistTravels == null || wishlistTravels.isEmpty()) {
                return;
            }
            resetRelationInWishListTable(user.getEmail());
            TravelDAO travelDAO = DBManager.getInstance().getTravelDAO();
            for (Travel travel : wishlistTravels) {
                travelDAO.save(travel);
                insertRelationInWishlistTable(user.getEmail(), travel.getId());
            }
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public void updatePasswordResetToken(String email, String token) {
        String query = "UPDATE \"user\" SET password_reset_token = ?, password_reset_token_creation_time = now() WHERE email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, token);
            statement.setString(2, email);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void delete(String email) {
        String query = "DELETE FROM \"user\" WHERE email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            statement.executeUpdate();
            resetRelationInWishListTable(email);
            resetRelationInReviewTable(email);
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public void removeExpiredPasswordResetTokens(int minutes) {
        String query = "UPDATE \"user\" SET password_reset_token = NULL, password_reset_token_creation_time = NULL WHERE password_reset_token IS NOT NULL AND now()-password_reset_token_creation_time > (? * INTERVAL '1 minute')";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, minutes);
            statement.executeUpdate();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public void removeTravelFromWishlist(String email, Long travelId) {
        String query = "DELETE FROM wishlist WHERE user_email = ?  AND travel_id = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            statement.setLong(2, travelId);
            statement.execute();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    private User getUser(String key, String query) {
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, key);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return mapResultSetToUser(resultSet);
            }
            return null;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    private User mapResultSetToUser(ResultSet resultSet) throws SQLException {
        Timestamp tokenCreationTime = resultSet.getTimestamp("token_creation_time");
        Timestamp passwordResetTokenCreationTime = resultSet.getTimestamp("password_reset_token_creation_time");
        return new User(resultSet.getString("firstname"),
                resultSet.getString("lastname"),
                resultSet.getDate("birthdate").toLocalDate(),
                resultSet.getString("email"),
                resultSet.getString("password"),
                UserRole.valueOf(resultSet.getString("role")),
                AuthProvider.valueOf(resultSet.getString("provider")),
                resultSet.getBoolean("enabled"),
                resultSet.getString("verification_token"),
                tokenCreationTime != null ? tokenCreationTime.toLocalDateTime() : null,
                resultSet.getString("password_reset_token"),
                passwordResetTokenCreationTime != null ? passwordResetTokenCreationTime.toLocalDateTime() : null,
                resultSet.getString("profile_image_path"));
    }

    private void insertRelationInWishlistTable(String email, Long travelId) throws SQLException {
        String query = "INSERT INTO wishlist(user_email, travel_id) VALUES(?, ?)";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setString(1, email);
        statement.setLong(2, travelId);
        statement.execute();
    }

    private void resetRelationInWishListTable(String email) throws SQLException {
        String query = "DELETE FROM wishlist WHERE user_email = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setString(1, email);
        statement.execute();
    }

    private void resetRelationInReviewTable(String email) throws SQLException {
        String query = "DELETE FROM review WHERE email = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setString(1, email);
        statement.execute();
    }
}
