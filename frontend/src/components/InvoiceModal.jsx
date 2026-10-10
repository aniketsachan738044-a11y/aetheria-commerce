import React from 'react';
import { formatINR } from '../utils/formatCurrency';
import { sanitize } from '../utils/sanitize';
import { Printer, X, ShieldCheck, CheckCircle } from 'lucide-react';

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-2026-${order._id ? order._id.slice(-6).toUpperCase() : '98412'}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const address = order.shippingAddress || {};
  const items = order.items || [];
  const itemsPrice = order.itemsPrice || 0;
  const discountPrice = order.discountPrice || 0;
  const taxableAmount = Math.max(0, itemsPrice - discountPrice);
  const cgst = Math.round(taxableAmount * 0.09);
  const sgst = Math.round(taxableAmount * 0.09);
  const shipping = order.shippingPrice || 0;
  const grandTotal = order.totalPrice || taxableAmount + cgst + sgst + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-8 border border-slate-200">
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
              Æ
            </span>
            <span className="font-bold text-sm tracking-wide">Tax Invoice Viewer</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 sm:p-10 text-slate-800 text-xs leading-relaxed print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-800 gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Aetheria Commerce Pvt. Ltd.
              </h1>
              <p className="text-slate-500 mt-1">Curated Gear & Modern Lifestyle Essentials</p>
              <p className="text-slate-500">Cyber City, DLF Phase 2, Gurugram, HR - 122002</p>
              <p className="font-mono text-slate-700 mt-1">
                <strong>GSTIN:</strong> 07AAAAA0000A1Z5 | <strong>PAN:</strong> AAAAA0000A
              </p>
              <p className="text-slate-500">support@aetheria.in | +91 1800 200 4884</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded text-xs uppercase tracking-wider mb-2">
                Original For Recipient
              </span>
              <p className="text-sm font-bold text-slate-900">TAX INVOICE</p>
              <p className="font-mono text-slate-700 mt-1">
                <strong>Invoice No:</strong> {invoiceNumber}
              </p>
              <p className="text-slate-500"><strong>Date:</strong> {orderDate}</p>
              <p className="text-slate-500"><strong>Place of Supply:</strong> {address.state || 'India'}</p>
            </div>
          </div>

          {/* Bill To & Dispatch Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200">
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 text-indigo-600">
                Bill To & Ship To:
              </p>
              <p className="font-bold text-slate-900">{order.user?.name || 'Valued Customer'}</p>
              <p className="text-slate-600">{sanitize(address.street || '')}</p>
              <p className="text-slate-600">
                {sanitize(address.city || '')}, {sanitize(address.state || '')} - {sanitize(address.postalCode || '')}
              </p>
              <p className="text-slate-600">{sanitize(address.country || 'India')}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 text-indigo-600">
                Order & Payment Info:
              </p>
              <p><span className="text-slate-500">Order ID:</span> <span className="font-mono font-medium">{order._id}</span></p>
              <p><span className="text-slate-500">Payment Status:</span> <span className="font-bold text-emerald-600">PAID</span></p>
              <p><span className="text-slate-500">Mode:</span> {order.paymentMethod || 'Simulated Indian Gateway'}</p>
              <p><span className="text-slate-500">Txn Ref:</span> <span className="font-mono">{order.paymentResult?.id || 'TXN_SIM'}</span></p>
              <p><span className="text-slate-500">Tracking AWB:</span> <span className="font-mono font-semibold text-slate-800">{order.trackingNumber || 'DEL-88392193'}</span></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 font-bold">#</th>
                  <th className="py-2.5 font-bold">Item Description</th>
                  <th className="py-2.5 font-bold text-center">HSN</th>
                  <th className="py-2.5 font-bold text-center">Qty</th>
                  <th className="py-2.5 font-bold text-right">Rate</th>
                  <th className="py-2.5 font-bold text-right">Taxable</th>
                  <th className="py-2.5 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 font-medium text-slate-900">
                        {sanitize(item.name || 'Product')}
                      </td>
                      <td className="py-3 text-center text-slate-500 font-mono">8471</td>
                      <td className="py-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 text-right">{formatINR(item.price)}</td>
                      <td className="py-3 text-right">{formatINR(lineTotal)}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatINR(lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
            <div className="text-slate-500 max-w-sm space-y-2">
              <p className="font-semibold text-slate-700 flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GST Compliance Declaration</span>
              </p>
              <p className="text-[11px]">
                This is a computer-generated tax invoice and conforms to the Indian Goods and Services Tax Act 2017. 
                Reverse charge is not applicable.
              </p>
              {order.couponCode && (
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold">
                  Applied Promo Coupon: {order.couponCode} (Saved {formatINR(discountPrice)})
                </div>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Total Taxable:</span>
                <span>{formatINR(taxableAmount)}</span>
              </div>
              {discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>- {formatINR(discountPrice)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span>{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span>{formatINR(sgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pan-India Delivery:</span>
                <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-300">
                <span>Total Amount:</span>
                <span className="text-indigo-600">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Signatory Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-400">
            <div>
              <p>Thank you for choosing Aetheria Commerce!</p>
              <p>For return or warranty claims, keep this invoice for reference.</p>
            </div>
            <div className="text-right">
              <div className="h-10 w-28 border-b border-slate-300 ml-auto mb-1 flex items-center justify-center text-slate-300 italic text-[10px]">
                Authorized Signatory
              </div>
              <p className="font-semibold text-slate-700">For Aetheria Commerce Pvt. Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
