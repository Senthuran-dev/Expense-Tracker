package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCategoryRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String icon;

    @NotBlank
    private String color;
}
