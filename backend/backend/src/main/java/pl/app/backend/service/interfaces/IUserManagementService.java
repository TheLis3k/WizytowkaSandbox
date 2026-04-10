package pl.app.backend.service.interfaces;

import pl.app.backend.dto.UserResponse;

import java.util.List;

public interface IUserManagementService {
    List<UserResponse> getAllUsers(int page, int size);
    void inviteSuperUser(String email);
    void deleteSuperUser(Long id);
}