package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC;

import it.unical.demacs.informatica.viajarhubbackend.model.Review;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.ReviewDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.Collections;
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
            return reviews;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
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
            return reviews;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
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
            return reviews;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public Review findReview(int id, String email) {
        String query = "SELECT * FROM review WHERE idtravel = ? AND email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, id);
            statement.setString(2, email);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return mapRowToReview(resultSet);
                }
            }
            return null;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
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
            return 0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }


    @Override
    public void save(Review review) {
        String query = "INSERT INTO review (idtravel, email, stars, comment,images_paths,data) VALUES (?, ?, ?, ?,?,?) " +
                "ON CONFLICT (idtravel, email) DO UPDATE SET stars = EXCLUDED.stars, comment = EXCLUDED.comment,images_paths = EXCLUDED.images_paths,data=EXCLUDED.data";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, review.getTravel().getId().intValue());
            statement.setString(2, review.getUser().getEmail());
            statement.setInt(3, review.getStars());
            statement.setString(4, review.getComment());
            List<String> imagesPaths = review.getImagesPaths();
            if (imagesPaths != null) {
                Array sqlArray = connection.createArrayOf("text", imagesPaths.toArray());
                statement.setArray(5, sqlArray);
            } else {
                statement.setArray(5, null);
            }
            statement.setObject(6, review.getData());
            statement.executeUpdate();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public void delete(Review review) {
        String query = "DELETE FROM review WHERE idtravel = ? AND email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, review.getTravel().getId().intValue());
            statement.setString(2, review.getUser().getEmail());
            statement.executeUpdate();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    private Review mapRowToReview(ResultSet resultSet) throws SQLException {
        Array array = resultSet.getArray("images_paths");
        List<String> imagesPaths = new ArrayList<>();
        if (array != null) {
            Collections.addAll(imagesPaths, (String[]) array.getArray());
        }
        return new Review(
                DBManager.getInstance().getTravelDAO().findById((long) resultSet.getInt("idtravel"), null),
                DBManager.getInstance().getUserDAO().findByEmail(resultSet.getString("email")),
                resultSet.getInt("stars"),
                resultSet.getString("comment"),
                imagesPaths,
                resultSet.getDate("data").toLocalDate()
        );
    }
}
