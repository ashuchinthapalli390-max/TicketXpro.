import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface BookingQRCodeProps {
  transactionId: string;
  ticketData: {
    title: string;
    amount: number;
    category: string;
    [key: string]: any;
  };
}

export const BookingQRCode: React.FC<BookingQRCodeProps> = ({ transactionId, ticketData }) => {
  const [hash, setHash] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateHash = async () => {
      try {
        const rawData = `${transactionId}:${ticketData.title}:${ticketData.amount}:${ticketData.category}`;
        const enc = new TextEncoder();
        const signatureBuffer = await crypto.subtle.digest('SHA-256', enc.encode(rawData));
        const signatureHex = Array.from(new Uint8Array(signatureBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .substring(0, 16).toUpperCase();
        
        setHash(signatureHex);
      } catch (err) {
        console.error('Hash generation error:', err);
      } finally {
        setLoading(false);
      }
    };

    generateHash();
  }, [transactionId, ticketData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  const qrValue = JSON.stringify({
    txId: transactionId,
    hash: hash,
    v: '1.0'
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-4 bg-white rounded-3xl shadow-xl">
        <QRCodeSVG 
          value={qrValue}
          size={180}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "/favicon.ico",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
        <div className="absolute inset-0 border-4 border-primary/10 rounded-3xl pointer-events-none" />
      </div>
      
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full">
          <ShieldCheck size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Verified 0x{hash}</span>
        </div>
        <p className="text-[8px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Scan for entry verification</p>
      </div>
    </div>
  );
};
