package com.example.hackathon.wics.controller;

import com.example.hackathon.wics.controller.dto.CreateUserReq;
import com.example.hackathon.wics.controller.dto.LoginUserReq;
import com.example.hackathon.wics.model.UserSession;
import com.example.hackathon.wics.model.Users;
import com.example.hackathon.wics.service.UserService;
import com.example.hackathon.wics.service.UserSessionService;
import org.springframework.http.*;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/users", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController {

    private final UserService userService;
    private final UserSessionService userSessionService;

    public UserController(UserService userService, UserSessionService userSessionService) {
        this.userService = userService;
        this.userSessionService = userSessionService;
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserReq createUserReq) {
        Users user = new Users(
                createUserReq.email(),
                createUserReq.username(),
                createUserReq.password(),
                0
        );
        userService.createUser(user);

      return new ResponseEntity<>(HttpStatus.OK);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginUserReq loginUserReq) {
        Users user = userService.verifyUser(loginUserReq.username(), loginUserReq.password());
        UserSession userSession = userSessionService.createSession(user.getId());

        ResponseCookie cookie = ResponseCookie.from("auth", userSession.getSession())
                .httpOnly(true)
                .path("/")
                .secure(true)
                .sameSite("None")
                .build();
        String partitionedCookie = cookie.toString() + "; Partitioned";
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, partitionedCookie)
                .body("login successful");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Users> getUserById(@PathVariable UUID id) {
        Users user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
