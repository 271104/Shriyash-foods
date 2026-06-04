import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiDownload, FiLoader, FiFilePdf, FiFile } from 'react-icons/fi';
import './OrderDownloads.css';

const OrderDownloads = ({ order }) => {
  const [loading, setLoading] = useState({ invoice: false, label: false });

  // Download invoice
  const handleDownloadInvoice = async () => {
    try {
      setLoading(prev => ({ ...prev, invoice: true }));

      // If URL already exists, download directly
      if (order.invoiceUrl) {
        window.open(order.invoiceUrl, '_blank');
        toast.success('Invoice downloaded! ✅');
        return;
      }

      // Otherwise, generate new invoice
      const response = await axios.post(
        `/shipping/generate-invoice`,
        { orderId: order.orderId },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${order.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Invoice downloaded! ✅');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download invoice');
      console.error('Invoice download error:', error);
    } finally {
      setLoading(prev => ({ ...prev, invoice: false }));
    }
  };

  // Download label
  const handleDownloadLabel = async () => {
    try {
      setLoading(prev => ({ ...prev, label: true }));

      // If URL already exists, download directly
      if (order.labelUrl) {
        window.open(order.labelUrl, '_blank');
        toast.success('Label downloaded! ✅');
        return;
      }

      // Otherwise, generate new label
      const response = await axios.post(
        `/shipping/generate-label`,
        { orderId: order.orderId },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Label-${order.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Label downloaded! ✅');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download label');
      console.error('Label download error:', error);
    } finally {
      setLoading(prev => ({ ...prev, label: false }));
    }
  };

  // Check if downloads are available
  const invoiceAvailable = order.invoiceUrl || order.status !== 'PENDING';
  const labelAvailable = order.labelUrl || order.awbCode;

  if (!invoiceAvailable && !labelAvailable) {
    return null;
  }

  return (
    <div className="order-downloads">
      <h3 className="downloads-title">📥 Downloads</h3>

      <div className="downloads-grid">
        {/* Invoice Download */}
        {invoiceAvailable && (
          <button
            className={`download-button invoice ${loading.invoice ? 'loading' : ''}`}
            onClick={handleDownloadInvoice}
            disabled={loading.invoice}
            title="Download Order Invoice"
          >
            <div className="download-icon">
              {loading.invoice ? (
                <FiLoader className="spinner" size={24} />
              ) : (
                <FiFilePdf size={24} />
              )}
            </div>
            <div className="download-content">
              <p className="download-label">Invoice</p>
              <p className="download-desc">
                {loading.invoice ? 'Generating...' : 'PDF Document'}
              </p>
            </div>
            <div className="download-action">
              <FiDownload size={16} />
            </div>
          </button>
        )}

        {/* Shipping Label Download */}
        {labelAvailable && (
          <button
            className={`download-button label ${loading.label ? 'loading' : ''}`}
            onClick={handleDownloadLabel}
            disabled={loading.label}
            title="Download Shipping Label"
          >
            <div className="download-icon">
              {loading.label ? (
                <FiLoader className="spinner" size={24} />
              ) : (
                <FiFile size={24} />
              )}
            </div>
            <div className="download-content">
              <p className="download-label">Shipping Label</p>
              <p className="download-desc">
                {loading.label ? 'Generating...' : 'PDF Document'}
              </p>
            </div>
            <div className="download-action">
              <FiDownload size={16} />
            </div>
          </button>
        )}
      </div>

      {/* Info Message */}
      {!labelAvailable && (
        <div className="downloads-info">
          💡 Shipping label will be available once your order is confirmed and AWB is assigned
        </div>
      )}
    </div>
  );
};

export default OrderDownloads;
