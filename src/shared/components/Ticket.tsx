import React, { useRef, useState } from 'react';
import { Loader2, Bus } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import QRCode from 'react-qr-code';

interface TicketData {
  id: string;
  passengerName: string;
  contact: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  companyName?: string;
  ticketClass?: 'STANDARD' | 'PREMIUM';
}

interface TicketProps {
  data: TicketData;
}

export const Ticket: React.FC<TicketProps> = ({ data }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const formattedPrice = new Intl.NumberFormat('fr-FR').format(data.price);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setIsDownloading('pdf');

    try {
      console.log('Starting PDF generation...');
      // Attendre le rendu des images
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(ticketRef.current, { cacheBust: true, backgroundColor: '#ffffff' });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [img.width, img.height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`VoyageBj-Ticket-${data.id.substring(0, 8)}.pdf`);
      console.log('PDF saved');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Erreur lors du téléchargement: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    setIsDownloading('image');

    try {
      console.log('Starting Image generation...');
      // Attendre le rendu des images
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(ticketRef.current, { cacheBust: true });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `VoyageBj-Ticket-${data.id.substring(0, 8)}.png`;
      link.click();
      console.log('Image saved');
    } catch (error: any) {
      console.error('Error generating Image:', error);
      alert(`Erreur lors de la création de l'image: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4">
      {/* Horizontal Ticket Container */}
      <div className="w-full overflow-x-auto pb-4">
        <div
          ref={ticketRef}
          className="bg-white min-w-[360px] max-w-[800px] w-full mx-auto h-[260px] sm:h-[300px] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative print:shadow-none flex"
        >
          {/* Left Section: Main Info */}
          <div className="flex-[2.5] p-4 sm:p-8 relative flex flex-col justify-between bg-white">
            {/* Benin Flag Stripe Top */}
            <div className="absolute top-0 left-0 right-0 h-2 flex">
              <div className="flex-1 bg-[#008751]"></div>
              <div className="flex-1 bg-[#FCD116]"></div>
              <div className="flex-1 bg-[#E8112D]"></div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#008751] rounded-lg flex items-center justify-center text-white shadow-md">
                  <Bus size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">VoyageBj</h1>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.companyName || 'Agence Partenaire'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase">CLASSE</p>
                <p className={`text-sm font-black ${data.ticketClass === 'PREMIUM' ? 'text-[#FCD116] drop-shadow-sm' : 'text-[#008751]'}`}>
                  {data.ticketClass || 'STANDARD'}
                </p>
              </div>
            </div>

            {/* Route Info */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">DE</p>
                <h2 className="text-3xl font-black text-gray-800">{data.origin.substring(0, 3).toUpperCase()}</h2>
                <p className="text-xs font-medium text-gray-500 max-w-[100px] truncate">{data.origin}</p>
              </div>

              <div className="flex-1 px-6 flex flex-col items-center">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-[2px] bg-gray-200 flex-1"></div>
                  <div className={`bg-white border-2 p-1 rounded-full ${data.ticketClass === 'PREMIUM' ? 'border-[#FCD116]' : 'border-[#008751]'}`}>
                    <Bus size={14} className={data.ticketClass === 'PREMIUM' ? 'text-[#FCD116]' : 'text-[#008751]'} />
                  </div>
                  <div className="h-[2px] bg-gray-200 flex-1"></div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-1 bg-gray-100 px-2 py-0.5 rounded-full">{data.date}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">À</p>
                <h2 className="text-3xl font-black text-gray-800">{data.destination.substring(0, 3).toUpperCase()}</h2>
                <p className="text-xs font-medium text-gray-500 max-w-[100px] truncate ml-auto">{data.destination}</p>
              </div>
            </div>

            {/* Passenger & Timing */}
            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">PASSAGER</p>
                <p className="text-sm font-bold text-gray-800 truncate">{data.passengerName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">DÉPART</p>
                <p className="text-lg font-black text-[#008751]">{data.departureTime}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ARRIVÉE</p>
                <p className="text-lg font-black text-gray-800">{data.arrivalTime}</p>
              </div>
            </div>

            {/* Decorative holes */}
            <div className="absolute right-[-12px] top-1/2 w-6 h-6 bg-[#008751] rounded-full z-10"></div>
          </div>

          {/* Right Section: Stub */}
          <div className="flex-1 bg-[#008751] p-6 relative flex flex-col justify-between text-white border-l-2 border-dashed border-white/20">
            <div className="absolute left-[-12px] top-1/2 w-6 h-6 bg-[#008751] rounded-full z-10"></div>

            {/* Benin Flag Stripe Right */}
            <div className="absolute top-0 right-0 bottom-0 w-2 flex flex-col">
              <div className="flex-1 bg-[#008751]"></div>
              <div className="flex-1 bg-[#FCD116]"></div>
              <div className="flex-1 bg-[#E8112D]"></div>
            </div>

            <div className="text-center mr-2">
              <h3 className="font-black text-lg tracking-wider">BOARDING PASS</h3>
              <p className="text-[10px] text-green-200 uppercase">Billet de Passage</p>
            </div>

            <div className="bg-white p-2 rounded-xl flex flex-col items-center justify-center mr-2">
              <div style={{ height: "auto", margin: "0 auto", maxWidth: 64, width: "100%" }}>
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={JSON.stringify({
                    id: data.id,
                    name: data.passengerName,
                    route: `${data.origin} -> ${data.destination}`,
                    date: data.date,
                    time: data.departureTime,
                    class: data.ticketClass
                  })}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <p className="text-[8px] font-mono font-bold text-black mt-1">{data.id.substring(0, 8).toUpperCase()}</p>
            </div>

            <div className="text-center mr-2">
              <p className="text-[10px] font-bold text-green-200 uppercase">PRIX TOTAL</p>
              <p className="text-2xl font-black">{formattedPrice} <span className="text-sm">FCFA</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden on Print) */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md no-print" data-html2canvas-ignore="true">
        <button
          onClick={handleDownloadPDF}
          disabled={!!isDownloading}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#008751] text-white rounded-xl text-sm font-bold hover:bg-[#006b40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 w-full sm:w-auto"
        >
          {isDownloading === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>TÉLÉCHARGER PDF</span>}
        </button>
        <button
          onClick={handleDownloadImage}
          disabled={!!isDownloading}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 w-full sm:w-auto"
        >
          {isDownloading === 'image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SAUVER IMAGE</span>}
        </button>
      </div>
    </div>
  );
};