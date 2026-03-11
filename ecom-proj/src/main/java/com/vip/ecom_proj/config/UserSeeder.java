package com.vip.ecom_proj.config;

import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.model.UserRole;
import com.vip.ecom_proj.user.repo.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserSeeder implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public UserSeeder(UserRepo userRepo,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.seed.admin.email:admin@ecom.local}") String adminEmail,
                      @Value("${app.seed.admin.password:admin12345}") String adminPassword,
                      @Value("${app.seed.admin.name:Admin}") String adminName) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    public void run(String... args) {
        if (userRepo.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }

        AppUser admin = new AppUser();
        admin.setName(adminName);
        admin.setEmail(adminEmail.trim().toLowerCase());
        admin.setRole(UserRole.ADMIN);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));

        userRepo.save(admin);
    }
}
