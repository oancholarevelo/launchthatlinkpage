// src/components/QRCodeModal.tsx
'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  username: string;
}

const QRCodeModal = ({ isOpen, onClose, url, username }: QRCodeModalProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  /**
   * Downloads the generated QR code as a PNG image with styling.
   */
  const downloadQRCode = () => {
    const qrCanvas = qrRef.current?.querySelector('canvas');
    if (qrCanvas) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 2; // Scale for higher resolution
      const qrSize = 200 * scale;
      const padding = 20 * scale;
      const headerHeight = 50 * scale;
      const footerHeight = 40 * scale;
      
      canvas.width = qrSize + (padding * 2);
      canvas.height = qrSize + (padding * 2) + headerHeight + footerHeight;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${24 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Launch That Linkpage', canvas.width / 2, padding + (headerHeight / 2));

      // QR Code
      ctx.drawImage(qrCanvas, padding, padding + headerHeight, qrSize, qrSize);
      
      // Footer
      ctx.fillStyle = '#4f46e5';
      ctx.font = ` ${14 * scale}px sans-serif`;
      ctx.fillText(url, canvas.width / 2, canvas.height - padding - (footerHeight / 2) + 10);


      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${username}-linkpage-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Share Your Page</h2>
        <p className="text-slate-500 mb-6">Scan this QR code to open your linkpage.</p>
        <div ref={qrRef} className="p-4 border-4 border-slate-100 rounded-lg inline-block">
          <QRCodeCanvas 
            value={url} 
            size={200} 
            bgColor={"#ffffff"} 
            fgColor={"#000000"} 
            level={"L"} 
            includeMargin={false} 
          />
        </div>
        <p className="text-sm text-indigo-600 font-semibold mt-4 break-all">{url}</p>
        <button
          onClick={downloadQRCode}
          className="mt-6 w-full py-2.5 px-6 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-lg border-transparent bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg"
        >
          <Download size={16} />
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;