package pl.app.backend.service.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.app.backend.dto.contact.AdminReplyRequest;
import pl.app.backend.dto.contact.ContactMessageRequest;
import pl.app.backend.dto.contact.ContactMessageResponse;
import pl.app.backend.enums.ContactMessageStatus;

public interface IContactMessageService {

    void submit(ContactMessageRequest request);

    void verify(String token);

    Page<ContactMessageResponse> getAll(ContactMessageStatus statusFilter, Pageable pageable);

    ContactMessageResponse getById(Long id);

    ContactMessageResponse reply(Long id, AdminReplyRequest request);

    void delete(Long id);

    long countUnread();
}
