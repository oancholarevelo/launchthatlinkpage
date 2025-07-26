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
   * Downloads the generated QR code as a PNG image.
   */
  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
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
