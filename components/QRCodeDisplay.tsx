'use client';

import { useEffect, useRef } from 'react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
}

export default function QRCodeDisplay({
  data,
  size = 300,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    // Dynamically import qrcode to avoid SSR issues
    import('qrcode').then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          data,
          {
            errorCorrectionLevel: 'H',
            width: size,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          },
          (error: Error | null | undefined) => {
            if (error) {
              console.error('Error generating QR code:', error);
            }
          }
        );
      }
    });
  }, [data, size]);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
