import React, { useState } from "react";
import { MapPin, Search, Navigation, Info } from "lucide-react";

interface GoogleMapsSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function GoogleMapsSelector({ value, onChange }: GoogleMapsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [mapQuery, setMapQuery] = useState(value || "서울특별시 중구 태평로1가 31 (서울시청)");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onChange(searchQuery);
      setMapQuery(searchQuery);
    }
  };

  const handleQuickLocation = (loc: string) => {
    setSearchQuery(loc);
    onChange(loc);
    setMapQuery(loc);
  };

  const encodedQuery = encodeURIComponent(mapQuery);
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-800">공사 현장 위치 검색 및 위치도 지정</h3>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="예: 서울특별시 서초구 반포동 1-1, 부산 해운대구 우동"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg pl-8 pr-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <button
          type="submit"
          className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          위치 반영
        </button>
      </form>

      {/* Embedded Map Visual */}
      <div className="w-full h-56 bg-slate-200 rounded-lg border border-slate-300 overflow-hidden relative mb-3">
        <iframe
          title="Google Map Location Selector"
          src={embedUrl}
          width="100%"
          height="100%"
          className="border-0"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer"
        ></iframe>
        <div className="absolute bottom-2 left-2 bg-slate-950/85 text-white text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono shadow-sm">
          <Navigation className="w-3 h-3 text-blue-400 animate-pulse" />
          <span>위치도 연동 활성화</span>
        </div>
      </div>

      {/* Suggested locations / quick helper */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="text-slate-500 font-medium flex items-center gap-1">
          <Info className="w-3 h-3" />
          빠른 주소 예시:
        </span>
        <button
          type="button"
          onClick={() => handleQuickLocation("서울특별시 서초구 서초동 1308-22")}
          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer transition-colors"
        >
          강남 서초 현장
        </button>
        <button
          type="button"
          onClick={() => handleQuickLocation("부산광역시 해운대구 우동 1408")}
          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer transition-colors"
        >
          부산 우동 현장
        </button>
        <button
          type="button"
          onClick={() => handleQuickLocation("인천광역시 연수구 송도동 10-1")}
          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer transition-colors"
        >
          송도 아파트 현장
        </button>
      </div>
    </div>
  );
}
