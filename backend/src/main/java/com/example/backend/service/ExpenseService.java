package com.example.backend.service;

import com.example.backend.dto.request.CreateExpenseRequest;
import com.example.backend.dto.response.ExpenseResponse;
import com.example.backend.model.Category;
import com.example.backend.model.Expense;
import com.example.backend.model.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ExpenseRepository;
import com.example.backend.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Page<ExpenseResponse> getExpenses(String email, Long categoryId, LocalDate startDate, LocalDate endDate, String search, Pageable pageable) {
        User user = getUser(email);
        Specification<Expense> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), user.getId()));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("expenseDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expenseDate"), endDate));
            }
            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("description")), "%" + search.trim().toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return expenseRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    public ExpenseResponse getExpenseById(String email, Long id) {
        Expense expense = getExpenseIfOwned(email, id);
        return mapToResponse(expense);
    }

    public ExpenseResponse createExpense(String email, CreateExpenseRequest request) {
        User user = getUser(email);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Category does not belong to you");
        }

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .receiptUrl(request.getReceiptUrl())
                .build();

        return mapToResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse updateExpense(String email, Long id, CreateExpenseRequest request) {
        Expense expense = getExpenseIfOwned(email, id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (category.getUser() != null && !category.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("Category does not belong to you");
        }

        expense.setCategory(category);
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setReceiptUrl(request.getReceiptUrl());

        return mapToResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(String email, Long id) {
        Expense expense = getExpenseIfOwned(email, id);
        expenseRepository.delete(expense);
    }

    public byte[] exportToCsv(String email, LocalDate startDate, LocalDate endDate) {
        User user = getUser(email);
        List<Expense> expenses = getFilteredExpensesList(user.getId(), startDate, endDate);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);
        writer.println("Date,Category,Amount,Description");
        for (Expense e : expenses) {
            writer.printf("%s,%s,%.2f,\"%s\"%n",
                    e.getExpenseDate(),
                    e.getCategory().getName(),
                    e.getAmount(),
                    e.getDescription() == null ? "" : e.getDescription().replace("\"", "\"\""));
        }
        writer.flush();
        return out.toByteArray();
    }

    public byte[] exportToPdf(String email, LocalDate startDate, LocalDate endDate) throws DocumentException {
        User user = getUser(email);
        List<Expense> expenses = getFilteredExpensesList(user.getId(), startDate, endDate);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        font.setSize(18);
        Paragraph title = new Paragraph("Expense Report", font);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 3f, 2f, 5f});

        addTableHeader(table);

        for (Expense e : expenses) {
            table.addCell(e.getExpenseDate().toString());
            table.addCell(e.getCategory().getName());
            table.addCell(e.getAmount().toString());
            table.addCell(e.getDescription() == null ? "" : e.getDescription());
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    private void addTableHeader(PdfPTable table) {
        String[] headers = {"Date", "Category", "Amount", "Description"};
        for (String headerTitle : headers) {
            PdfPCell header = new PdfPCell();
            header.setPhrase(new Phrase(headerTitle));
            table.addCell(header);
        }
    }

    private List<Expense> getFilteredExpensesList(Long userId, LocalDate startDate, LocalDate endDate) {
        Specification<Expense> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("expenseDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expenseDate"), endDate));
            }
            query.orderBy(cb.asc(root.get("expenseDate")));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        return expenseRepository.findAll(spec);
    }

    private Expense getExpenseIfOwned(String email, Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));
        if (!expense.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not have permission to access this expense");
        }
        return expense;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .categoryId(expense.getCategory().getId())
                .categoryName(expense.getCategory().getName())
                .categoryIcon(expense.getCategory().getIcon())
                .categoryColor(expense.getCategory().getColor())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .receiptUrl(expense.getReceiptUrl())
                .build();
    }
}
