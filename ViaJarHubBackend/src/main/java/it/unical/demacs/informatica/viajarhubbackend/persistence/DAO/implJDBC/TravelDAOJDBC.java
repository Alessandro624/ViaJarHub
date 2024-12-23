package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelType;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.TravelDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TravelDAOJDBC implements TravelDAO {
    private final Connection connection;

    public TravelDAOJDBC() {
        this.connection = DBManager.getInstance().getConnection();
    }

    @Override
    public List<Travel> findAll() {
        String query = "SELECT * FROM travel";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            ResultSet resultSet = statement.executeQuery();
            List<Travel> travels = new ArrayList<>();
            while (resultSet.next()) {
                travels.add(mapResultSetToTravel(resultSet));
            }
            return travels;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public Travel findById(Long id) {
        String query = "SELECT * FROM travel WHERE id = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setLong(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return mapResultSetToTravel(resultSet);
            }
            return null;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public void save(Travel travel) {
        String insertQuery = "INSERT INTO travel (destination, iscountry, start_date, end_date, description, old_price, price, max_participants_number, type, images_paths, latitude, longitude) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        String updateQuery = "INSERT INTO travel (destination, iscountry, start_date, end_date, description, old_price, price, max_participants_number, type, images_paths, latitude, longitude, id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        String query = travel.getId() != null ? updateQuery : insertQuery
                + "ON CONFLICT (id) DO UPDATE SET destination = EXCLUDED.destination, iscountry = EXCLUDED.iscountry, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, description = EXCLUDED.description, old_price = EXCLUDED.old_price, price = EXCLUDED.price, max_participants_number = EXCLUDED.max_participants_number, type = EXCLUDED.type, images_paths = EXCLUDED.images_paths, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude RETURNING id ";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, travel.getDestination());
            statement.setBoolean(2, travel.isCountry());
            statement.setObject(3, travel.getStartDate());
            statement.setObject(4, travel.getEndDate());
            statement.setString(5, travel.getDescription());
            statement.setDouble(6, travel.getOldPrice());
            statement.setDouble(7, travel.getPrice());
            statement.setInt(8, travel.getMaxParticipantsNumber());
            statement.setString(9, travel.getTravelType().toString());
            List<String> imagesPaths = travel.getImagesPaths();
            Array sqlArray = connection.createArrayOf("text", imagesPaths.toArray());
            statement.setArray(10, sqlArray);
            statement.setDouble(11, travel.getLatitude());
            statement.setDouble(12, travel.getLongitude());
            if (travel.getId() != null) {
                statement.setObject(13, travel.getId());
                statement.executeUpdate();
            } else {
                try (ResultSet rs = statement.executeQuery()) {
                    if (rs.next()) {
                        long generatedId = rs.getLong("id");
                        travel.setId(generatedId);
                    }
                }
            }
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public void delete(Long id) {
        String query = "DELETE FROM travel WHERE id = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setLong(1, id);
            statement.executeUpdate();
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    private Travel mapResultSetToTravel(ResultSet resultSet) throws SQLException {
        Array array = resultSet.getArray("images_paths");
        List<String> imagesPaths = new ArrayList<>();
        if (array != null) {
            Collections.addAll(imagesPaths, (String[]) array.getArray());
        }
        return new Travel(resultSet.getLong("id"),
                resultSet.getString("destination"),
                resultSet.getBoolean("iscountry"),
                resultSet.getDate("start_date").toLocalDate(),
                resultSet.getDate("end_date").toLocalDate(),
                resultSet.getString("description"),
                resultSet.getDouble("old_price"),
                resultSet.getDouble("price"),
                resultSet.getInt("max_participants_number"),
                TravelType.valueOf(resultSet.getString("type")),
                imagesPaths,
                resultSet.getDouble("latitude"),
                resultSet.getDouble("longitude"));
    }
}
