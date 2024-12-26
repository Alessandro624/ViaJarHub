package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC;

import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.ReviewDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ReviewDAOJDBC implements ReviewDAO {
    private final Connection connection;

    public ReviewDAOJDBC() {
        this.connection = DBManager.getInstance().getConnection();
    }

    @Override
    public List<Review> findAll() {
        List<Review> reviews = new ArrayList<>();
        String query = "SELECT * FROM review";
        try (PreparedStatement statement = connection.prepareStatement(query);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                reviews.add(mapRowToReview(resultSet));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;

    }

    @Override
    public List<Review> findByTravel(int id) {
        List<Review> reviews = new ArrayList<>();
        String query = "SELECT * FROM review WHERE idtravel = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    reviews.add(mapRowToReview(resultSet));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;

    }

    @Override
    public List<Review> findByUser(String email) {
        List<Review> reviews = new ArrayList<>();
        String query = "SELECT * FROM review WHERE email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    reviews.add(mapRowToReview(resultSet));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;

    }

    @Override
    public Review findReview(int id, String email) {
        String query = "SELECT * FROM review WHERE idtravel = ? AND email = ?";
        try(PreparedStatement statement=connection.prepareStatement(query)){
            statement.setInt(1, id);
            statement.setString(2, email);
            try (ResultSet resultSet=statement.executeQuery()) {
                if (resultSet.next()) {
                    return mapRowToReview(resultSet);
                }
            }
        }
        catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public int countReviewsByUser(String email) {
        String query = "SELECT COUNT(*) AS count FROM review WHERE email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return resultSet.getInt("count");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
        }


    @Override
    public void save(Review review) {
        String query = "INSERT INTO review (idtravel, email, stars, comment) VALUES (?, ?, ?, ?) " +
                "ON CONFLICT (idtravel, email) DO UPDATE SET stars = EXCLUDED.stars, comment = EXCLUDED.comment";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, review.getIdTravel());
            statement.setString(2, review.getEmailUser());
            statement.setInt(3, review.getStars());
            statement.setString(4, review.getComment());
            statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }


    }

    @Override
    public void delete(Review review) {
        String query = "DELETE FROM review WHERE idtravel = ? AND email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, review.getIdTravel());
            statement.setString(2, review.getEmailUser());
            statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }

    }
    private Review mapRowToReview(ResultSet resultSet) throws SQLException {
        return new Review(
                resultSet.getInt("idtravel"),
                resultSet.getString("email"),
                resultSet.getInt("stars"),
                resultSet.getString("comment")
        );
    }
}
