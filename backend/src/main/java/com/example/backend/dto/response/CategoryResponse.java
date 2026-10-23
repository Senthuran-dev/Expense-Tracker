package com.example.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private String color;

    @JsonProperty("isDefault")
    private boolean isDefault;
}
