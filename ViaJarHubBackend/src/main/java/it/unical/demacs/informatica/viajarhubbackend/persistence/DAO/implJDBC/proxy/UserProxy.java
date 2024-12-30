package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC.proxy;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@Getter
public class UserProxy {
    private final User user;

    public List<Travel> getWishlist() {
        if (user.getWishlist() == null) {
            this.setWishlist();
        }
        return user.getWishlist();
    }

    private void setWishlist() {
        user.setWishlist(DBManager.getInstance().getTravelDAO().findAllByUserWishlist(user.getEmail(), !(user.getRole() == UserRole.ROLE_ADMIN) ? LocalDate.now() : null));
    }

    public void addToWishlist(Long travelId, LocalDate startDate) {
        Travel travel = DBManager.getInstance().getTravelDAO().findById(travelId, startDate);
        this.getWishlist().add(travel);
        DBManager.getInstance().getUserDAO().save(user);
    }

    public void removeFromWishlist(Long travelId) {
        DBManager.getInstance().getUserDAO().removeTravelFromWishlist(user.getEmail(), travelId);
        this.setWishlist();
    }
}
