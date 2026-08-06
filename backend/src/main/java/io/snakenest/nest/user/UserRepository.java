package io.snakenest.nest.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT u FROM User u
            WHERE u.id <> :excludedUserId
            AND (:needle = '' OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :needle, '%')))
            ORDER BY u.displayName
            """)
    List<User> searchExcludingUser(@Param("excludedUserId") UUID excludedUserId, @Param("needle") String needle);

    @Query("""
            SELECT u FROM User u
            WHERE u.id NOT IN (SELECT m.userId FROM NestMembership m WHERE m.nestId = :nestId)
            AND (:needle = '' OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :needle, '%')))
            ORDER BY u.displayName
            """)
    List<User> searchNotInNest(@Param("nestId") UUID nestId, @Param("needle") String needle);
}
