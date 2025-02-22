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
    public List<Travel> findAllByUserBooking(String email) {
        String query = "SELECT t.*, " +
                "b.start_date AS booking_start_date, " +
                "b.end_date AS booking_end_date " +
                "FROM travel t " +
                "JOIN booking b ON t.id = b.travel_id " +
                "WHERE b.user_email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            ResultSet resultSet = statement.executeQuery();
            List<Travel> travels = new ArrayList<>();
            while (resultSet.next()) {
                Travel travel = mapResultSetToTravel(resultSet);
                travel.setStartDate(resultSet.getDate("booking_start_date").toLocalDate());
                travel.setEndDate(resultSet.getDate("booking_end_date").toLocalDate());
                travels.add(travel);
            }
            return travels;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public List<Travel> getMostRated() {
        String query = """
                    SELECT t.*
                    FROM travel t
                    WHERE t.id IN (
                        SELECT id
                        FROM travel_avg_stars
                        ORDER BY avg_stars DESC
                        LIMIT 3
                    );
                """;
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
    public int getTravelNumber() {
        String query = "SELECT COUNT(*) AS num_travels FROM travel WHERE start_date >= CURRENT_DATE";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getInt("num_travels");
            }
            return 0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public double getDailyIncome() {
        String query = "SELECT SUM(total_amount) AS daily_revenue " +
                "FROM booking " +
                "WHERE DATE(booking_date) = CURRENT_DATE";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getDouble("daily_revenue");
            }
            return 0.0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public double getMonthly() {
        String query = "SELECT SUM(total_amount) AS monthly_revenue " +
                "FROM booking " +
                "WHERE EXTRACT(YEAR FROM booking_date) = EXTRACT(YEAR FROM CURRENT_DATE) " +
                "AND EXTRACT(MONTH FROM booking_date) = EXTRACT(MONTH FROM CURRENT_DATE)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getDouble("monthly_revenue");
            }
            return 0.0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public double getAllIncome() {
        String query = "SELECT SUM(total_amount) AS total_revenue FROM booking";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getDouble("total_revenue");
            }
            return 0.0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public double getAnnualIncome() {
        String query = "SELECT SUM(total_amount) AS annual_revenue " +
                "FROM booking " +
                "WHERE EXTRACT(YEAR FROM booking_date) = EXTRACT(YEAR FROM CURRENT_DATE)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getDouble("annual_revenue");
            }
            return 0.0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
        }
    }

    @Override
    public int getMonthlyBooking(int month) {
        String query = "SELECT COUNT(*) FROM booking WHERE EXTRACT(MONTH FROM booking_date) = ? AND EXTRACT(YEAR FROM booking_date) = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, month);
            statement.setInt(2, LocalDate.now().getYear());
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
    public List<Travel> findAllReviewable(String email) {
        String query = "SELECT DISTINCT t.* " +
                "FROM travel t " +
                "JOIN booking b ON t.id = b.travel_id " +
                "WHERE b.end_date <= CURRENT_DATE AND b.user_email = ? " +
                "AND NOT EXISTS (" +
                "    SELECT 1 FROM review r WHERE r.idtravel = t.id AND r.email = b.user_email)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
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
            resetRelationInBookingTable(id);
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


    public double getMaxPrice(LocalDate startDate) {
        String query = "SELECT MAX(price) FROM travel";
        if (startDate != null) {
            query += " WHERE start_date >= ?";
        }
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            if (startDate != null) {
                statement.setObject(1, startDate);
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
    public int getAvailableSeats(Long id, LocalDate startDate, LocalDate endDate) {
        String query = "SELECT available_seats FROM available_seats WHERE travel_id = ? AND start_date = ? AND end_date = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setLong(1, id);
            statement.setObject(2, startDate);
            statement.setObject(3, endDate);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return resultSet.getInt("available_seats");
            }
            return 0;
        } catch (SQLException sqlException) {
            throw new RuntimeException(sqlException);
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

    private void resetRelationInBookingTable(Long id) throws SQLException {
        String query = "DELETE FROM booking WHERE travel_id = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setLong(1, id);
        statement.execute();
    }
}
