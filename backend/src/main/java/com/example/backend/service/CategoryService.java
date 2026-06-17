package com.example.backend.service;

import com.example.backend.dto.request.CreateCategoryRequest;
import com.example.backend.dto.response.CategoryResponse;
import com.example.backend.model.Category;
import com.example.backend.model.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ExpenseRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> getCategories(String email) {
        User user = getUser(email);
        return categoryRepository.findByUserIdOrUserIsNull(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(String email, CreateCategoryRequest request) {
        User user = getUser(email);
        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .isDefault(false)
                .build();
        return mapToResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(String email, Long id, CreateCategoryRequest request) {
        Category category = getCategoryIfOwned(email, id);
        if (category.isDefault()) {
            throw new IllegalArgumentException("Cannot edit default categories");
        }
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        return mapToResponse(categoryRepository.save(category));
    }

    public void deleteCategory(String email, Long id) {
        Category category = getCategoryIfOwned(email, id);
        if (category.isDefault()) {
            throw new IllegalArgumentException("Cannot delete default categories");
        }
        if (expenseRepository.existsByCategoryId(id)) {
            throw new IllegalStateException("Cannot delete category as it is currently associated with expenses.");
        }
        categoryRepository.delete(category);
    }

    private Category getCategoryIfOwned(String email, Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (category.getUser() != null && !category.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not have permission to access this category");
        }
        return category;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.isDefault())
                .build();
    }
}
