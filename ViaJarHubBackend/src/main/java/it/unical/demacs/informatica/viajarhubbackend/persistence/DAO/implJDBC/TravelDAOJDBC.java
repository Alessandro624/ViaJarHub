package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelOrder;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelType;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.TravelDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TravelDAOJDBC implements TravelDAO {
    private final Connection connection;

    public TravelDAOJDBC() {
        this.connection = DBManager.getInstance().getConnection();
    }

    @Override
    public List<Travel> findAll(LocalDate startDate) {
        String query = "SELECT * FROM travel";
        if (startDate != null) {
            query += " WHERE start_date >= ?";
        }
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            if (startDate != null) {
                statement.setObject(1, startDate);
            }
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
    public List<Travel> findAllByUserWishlist(String email, LocalDate startDate) {
        String query = "SELECT t.* FROM travel t JOIN wishlist w ON t.id = w.travel_id WHERE w.user_email = ?";
        if (startDate != null) {
            query += " AND start_date >= ?";
        }
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            if (startDate != null) {
                statement.setObject(2, startDate);
            }
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
    public List<Travel> findAllPaginated(int offset, int limit, TravelFilter filters) {
        StringBuilder query = new StringBuilder("SELECT t.* FROM travel t");
        query.append(" JOIN travel_avg_stars tavg ON t.id = tavg.id");
        query.append(" WHERE 1=1");
        List<Object> params = applyFilters(filters, query);
        applyOrderLogic(query, filters.getTravelOrder(), filters.getReverse());
        query.append(" LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);
        try (PreparedStatement statement = connection.prepareStatement(query.toString())) {
            for (int i = 0; i < params.size(); i++) {
                statement.setObject(i + 1, params.get(i));
            }
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
    public Travel findById(Long id, LocalDate startDate) {
        String query = "SELECT * FROM travel WHERE id = ?";
        if (startDate != null) {
            query += " AND start_date >= ?";
        }
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setLong(1, id);
            if (startDate != null) {
                statement.setObject(2, startDate);
            }
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
    public List<String> getSuggestions(TravelFilter filters) {
        StringBuilder query = new StringBuilder("SELECT DISTINCT destination FROM travel WHERE 1=1");
        List<Object> params = applyFilters(filters, query);
        query.append(" LIMIT 10");
        try (PreparedStatement statement = connection.prepareStatement(query.toString())) {
            for (int i = 0; i < params.size(); i++) {
                statement.setObject(i + 1, params.get(i));
            }
            ResultSet resultSet = statement.executeQuery();
            List<String> suggestions = new ArrayList<>();
            while (resultSet.next()) {
                suggestions.add(resultSet.getString("destination"));
            }
            return suggestions;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public double getAvgStars(Long id, LocalDate startDate) {
        String query = "SELECT tavg.avg_stars FROM travel_avg_stars tavg JOIN travel t ON t.id = tavg.id WHERE t.id = ?";
        if (startDate != null) {
            query += " AND t.start_date >= ?";
        }
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setLong(1, id);
            if (startDate != null) {
                statement.setObject(2, startDate);
            }
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getDouble(1);
            }
            return 0;
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
            statement.setBoolean(3, travel.getIsCountry());
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
            resetRelationInWishListTable(id);
            resetRelationInReviewTable(id);
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public int countTravels(TravelFilter filters) {
        StringBuilder query = new StringBuilder("SELECT COUNT(*) FROM travel WHERE 1=1");
        List<Object> params = applyFilters(filters, query);
        try (PreparedStatement statement = connection.prepareStatement(query.toString())) {
            for (int i = 0; i < params.size(); i++) {
                statement.setObject(i + 1, params.get(i));
            }
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getInt(1);
            }
            return 0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public String findNameById(Long id) {
        String query = "SELECT * FROM travel WHERE id = ?";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setLong(1, id);

            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getString("destination");
            }
            return null;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public Long getMaxPrice(boolean isAdmin) {
        String query;

        if (isAdmin) {
            // Query per ottenere il prezzo massimo senza restrizioni
            query = "SELECT MAX(price) AS max_price FROM travel";
        } else {
            // Query per ottenere il prezzo massimo con data di partenza futura
            query = "SELECT MAX(price) AS max_price FROM travel WHERE start_date > CURRENT_DATE";
        }

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            // Non ci sono parametri da settare in questa query
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                // Otteniamo il risultato dalla colonna "max_price"
                return resultSet.getLong("max_price");
            }
            return 0L; // Se non ci sono risultati, restituiamo 0
        } catch (SQLException sqlException) {
            throw new RuntimeException("Errore durante l'esecuzione della query", sqlException);
        }

    }

    private List<Object> applyFilters(TravelFilter filters, StringBuilder query) {
        List<Object> params = new ArrayList<>();
        if (filters.getSearchQuery() != null && !filters.getSearchQuery().isBlank()) {
            query.append(" AND (LOWER(destination) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
            params.add("%" + filters.getSearchQuery() + "%");
            params.add("%" + filters.getSearchQuery() + "%");
        }
        if (filters.getStartDate() != null) {
            query.append(" AND start_date >= ?");
            params.add(filters.getStartDate());
        }
        if (filters.getEndDate() != null) {
            query.append(" AND end_date <= ?");
            params.add(filters.getEndDate());
        }
        if (filters.getMinPrice() > 0) {
            query.append(" AND price >= ?");
            params.add(filters.getMinPrice());
        }
        if (filters.getMaxPrice() > 0) {
            query.append(" AND price <= ?");
            params.add(filters.getMaxPrice());
        }
        if (filters.getTravelType() != null) {
            query.append(" AND type = ?");
            params.add(filters.getTravelType().toString());
        }
        return params;
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

    private void applyOrderLogic(StringBuilder query, TravelOrder order, Boolean reverse) {
        if (order != null) {
            switch (order) {
                case BY_DESTINATION:
                    query.append(" ORDER BY destination");
                    break;
                case BY_PRICE:
                    query.append(" ORDER BY price");
                    break;
                case BY_STARS:
                    query.append(" ORDER BY tavg.avg_stars");
                    break;
                default:
                    query.append(" ORDER BY id");
                    break;
            }
        } else {
            query.append(" ORDER BY id");
        }
        if (reverse != null && reverse) {
            query.append(" DESC");
        } else {
            query.append(" ASC");
        }
    }

    private void resetRelationInWishListTable(Long id) throws SQLException {
        String query = "DELETE FROM wishlist WHERE travel_id = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setLong(1, id);
        statement.execute();
    }

    private void resetRelationInReviewTable(Long id) throws SQLException {
        String query = "DELETE FROM review WHERE idtravel = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setLong(1, id);
        statement.execute();
    }

}
