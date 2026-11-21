package com.personalfinance.finance.controller;

import com.personalfinance.finance.entity.Bill;
import com.personalfinance.finance.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    @PostMapping
    public Bill createBill(@RequestBody Bill bill) {
        return billService.createBill(bill);
    }

    @PutMapping("/{id}")
    public Bill updateBill(@PathVariable Long id, @RequestBody Bill bill) {
        return billService.updateBill(id, bill);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.ok(Map.of("message", "Bill deleted successfully"));
    }

    @PostMapping("/{id}/pay")
    public Bill recordPayment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload) {

        BigDecimal amount = null;
        String date = null;

        if (payload != null) {
            if (payload.get("amount") != null) {
                amount = new BigDecimal(payload.get("amount").toString());
            }
            if (payload.get("date") != null) {
                date = payload.get("date").toString();
            }
        }

        return billService.recordPayment(id, amount, date);
    }
}
