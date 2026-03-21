package com.example.hackathon.wics.security;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.hackathon.wics.service.UserSessionService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SessionAuthFilter extends OncePerRequestFilter {
    private final UserSessionService userSessionService; 

    public SessionAuthFilter(UserSessionService userSessionService){
        this.userSessionService = userSessionService;
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return path.equals("/user/login")
            || path.equals("/user/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException{
    String authCookie = readCookie(request,"auth");

    if (authCookie != null){
        try{
            var user = userSessionService.getSessionBySessionId(authCookie);
            var auth = new UsernamePasswordAuthenticationToken(
                user, null, List.of()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

        }catch(Exception e){
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return;
        }
    }
    filterChain.doFilter(request, response);
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (var c : request.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }






}
