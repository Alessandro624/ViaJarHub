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
    public List<Travel> findAllPaginated(int offset, int limit) {
        String query = "SELECT * FROM travel ORDER BY id LIMIT ? OFFSET ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, limit);
            statement.setInt(2, offset);
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
        String query = "INSERT INTO travel (id, destination, iscountry, start_date, end_date, description, old_price, price, max_participants_number, type, images_paths, latitude, longitude) " +
                "VALUES (COALESCE(?, nextval('travel_id_seq')), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON CONFLICT (id) DO UPDATE SET " +
                "destination = EXCLUDED.destination, " +
                "iscountry = EXCLUDED.iscountry, " +
                "start_date = EXCLUDED.start_date, " +
                "end_date = EXCLUDED.end_date, " +
                "description = EXCLUDED.description, " +
                "old_price = EXCLUDED.old_price, " +
                "price = EXCLUDED.price, " +
                "max_participants_number = EXCLUDED.max_participants_number, " +
                "type = EXCLUDED.type, " +
                "images_paths = EXCLUDED.images_paths, " +
                "latitude = EXCLUDED.latitude, " +
                "longitude = EXCLUDED.longitude " +
                "RETURNING id";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            if (travel.getId() != null) {
                statement.setObject(1, travel.getId());
            } else {
                statement.setNull(1, Types.BIGINT);
            }
            statement.setString(2, travel.getDestination());
            statement.setBoolean(3, travel.isCountry());
            statement.setObject(4, travel.getStartDate());
            statement.setObject(5, travel.getEndDate());
            statement.setString(6, travel.getDescription());
            statement.setDouble(7, travel.getOldPrice());
            statement.setDouble(8, travel.getPrice());
            statement.setInt(9, travel.getMaxParticipantsNumber());
            statement.setString(10, travel.getTravelType().toString());
            List<String> imagesPaths = travel.getImagesPaths();
            Array sqlArray = connection.createArrayOf("text", imagesPaths.toArray());
            statement.setArray(11, sqlArray);
            statement.setDouble(12, travel.getLatitude());
            statement.setDouble(13, travel.getLongitude());
            ResultSet rs = statement.executeQuery();
            if (rs.next()) {
                long generatedId = rs.getLong("id");
                travel.setId(generatedId);
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

    @Override
    public int countTravels() {
        String query = "SELECT COUNT(*) FROM travel";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.execute();
            ResultSet resultSet = statement.getResultSet();
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            return 0;
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
