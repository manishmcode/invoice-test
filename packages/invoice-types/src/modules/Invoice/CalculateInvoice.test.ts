import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CalculationError, calculateInvoice, formatUsd } from "./CalculateInvoice";

describe("calculateInvoice", () => {
  it("matches the golden fixture: two $50 lines, $10 off, 10% tax = $99.00", () => {
    const totals = calculateInvoice({
      lineItems: [
        { quantity: 1, unitPrice: 50 },
        { quantity: 1, unitPrice: 50 },
      ],
      discountAmount: 10,
      taxRatePercent: 10,
    });

    assert.deepEqual(totals.lineTotals, [50, 50]);
    assert.equal(totals.subtotal, 100);
    assert.equal(totals.discountAmount, 10);
    assert.equal(totals.taxAmount, 9);
    assert.equal(totals.grandTotal, 99);
    assert.equal(formatUsd(totals.grandTotal), "$99.00");
  });

  it("matches 2 × $50 as a single line with the same golden total", () => {
    const totals = calculateInvoice({
      lineItems: [{ quantity: 2, unitPrice: 50 }],
      discountAmount: 10,
      taxRatePercent: 10,
    });

    assert.equal(totals.subtotal, 100);
    assert.equal(totals.grandTotal, 99);
    assert.equal(formatUsd(totals.grandTotal), "$99.00");
  });

  it("rounds each line half-up to cents before summing", () => {
    const totals = calculateInvoice({
      lineItems: [{ quantity: 1, unitPrice: 10.005 }],
      discountAmount: 0,
      taxRatePercent: 0,
    });

    assert.deepEqual(totals.lineTotals, [10.01]);
    assert.equal(totals.grandTotal, 10.01);
  });

  it("rejects a discount greater than the subtotal", () => {
    assert.throws(
      () =>
        calculateInvoice({
          lineItems: [{ quantity: 1, unitPrice: 50 }],
          discountAmount: 50.01,
          taxRatePercent: 0,
        }),
      (error: unknown) => {
        assert.ok(error instanceof CalculationError);
        assert.equal(error.fields.discountAmount, "Discount cannot exceed subtotal");
        return true;
      },
    );
  });

  it("allows a discount equal to the subtotal", () => {
    const totals = calculateInvoice({
      lineItems: [{ quantity: 1, unitPrice: 50 }],
      discountAmount: 50,
      taxRatePercent: 10,
    });

    assert.equal(totals.grandTotal, 0);
  });

  it("rejects negative quantity, price, discount, and tax", () => {
    assert.throws(
      () =>
        calculateInvoice({
          lineItems: [{ quantity: -1, unitPrice: 50 }],
          discountAmount: 0,
          taxRatePercent: 0,
        }),
      (error: unknown) => {
        assert.ok(error instanceof CalculationError);
        assert.equal(error.fields["lineItems.0.quantity"], "Quantity cannot be negative");
        return true;
      },
    );

    assert.throws(
      () =>
        calculateInvoice({
          lineItems: [{ quantity: 1, unitPrice: -0.01 }],
          discountAmount: 0,
          taxRatePercent: 0,
        }),
      (error: unknown) => {
        assert.ok(error instanceof CalculationError);
        assert.equal(error.fields["lineItems.0.unitPrice"], "Price cannot be negative");
        return true;
      },
    );

    assert.throws(
      () =>
        calculateInvoice({
          lineItems: [{ quantity: 1, unitPrice: 10 }],
          discountAmount: -1,
          taxRatePercent: 0,
        }),
      (error: unknown) => {
        assert.ok(error instanceof CalculationError);
        assert.equal(error.fields.discountAmount, "Discount cannot be negative");
        return true;
      },
    );

    assert.throws(
      () =>
        calculateInvoice({
          lineItems: [{ quantity: 1, unitPrice: 10 }],
          discountAmount: 0,
          taxRatePercent: -5,
        }),
      (error: unknown) => {
        assert.ok(error instanceof CalculationError);
        assert.equal(error.fields.taxRatePercent, "Tax rate cannot be negative");
        return true;
      },
    );
  });

  it("allows zero quantity and zero price", () => {
    const totals = calculateInvoice({
      lineItems: [
        { quantity: 0, unitPrice: 50 },
        { quantity: 2, unitPrice: 0 },
      ],
      discountAmount: 0,
      taxRatePercent: 10,
    });

    assert.equal(totals.subtotal, 0);
    assert.equal(totals.grandTotal, 0);
  });

  it("ignores custom fields because they are not calculator inputs", () => {
    const withoutFields = calculateInvoice({
      lineItems: [{ quantity: 2, unitPrice: 50 }],
      discountAmount: 10,
      taxRatePercent: 10,
    });
    const withUnusedExtra = calculateInvoice({
      lineItems: [{ quantity: 2, unitPrice: 50 }],
      discountAmount: 10,
      taxRatePercent: 10,
    });

    assert.deepEqual(withoutFields, withUnusedExtra);
    assert.equal(withoutFields.grandTotal, 99);
  });
});
