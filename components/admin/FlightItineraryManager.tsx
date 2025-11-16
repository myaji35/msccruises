"use client";

import { useState } from "react";
import { Plus, Trash2, Plane } from "lucide-react";

interface FlightItinerary {
  id?: string;
  segmentType: string;
  flightNumber: string;
  airline: string;
  airlineCode?: string;
  departureAirport: string;
  departureCode: string;
  departureCity?: string;
  departureCountry?: string;
  departureTime: string;
  departureDate: string;
  departureTerminal?: string;
  arrivalAirport: string;
  arrivalCode: string;
  arrivalCity?: string;
  arrivalCountry?: string;
  arrivalTime: string;
  arrivalDate: string;
  arrivalTerminal?: string;
  duration?: number;
  aircraft?: string;
  cabinClass?: string;
  stops: number;
  stopoverInfo?: string;
  bookingClass?: string;
  seatInfo?: string;
  baggageAllowance?: string;
  mealService: boolean;
  order: number;
}

interface FlightItineraryManagerProps {
  cruiseId: string;
  initialFlights?: FlightItinerary[];
  onChange?: (flights: FlightItinerary[]) => void;
}

export default function FlightItineraryManager({
  cruiseId,
  initialFlights = [],
  onChange,
}: FlightItineraryManagerProps) {
  const [flights, setFlights] = useState<FlightItinerary[]>(initialFlights);
  const [isExpanded, setIsExpanded] = useState<number | null>(null);

  const addFlight = () => {
    const newFlight: FlightItinerary = {
      segmentType: "outbound",
      flightNumber: "",
      airline: "",
      departureAirport: "",
      departureCode: "",
      departureTime: "",
      departureDate: "",
      arrivalAirport: "",
      arrivalCode: "",
      arrivalTime: "",
      arrivalDate: "",
      stops: 0,
      mealService: true,
      order: flights.length,
    };
    const updated = [...flights, newFlight];
    setFlights(updated);
    onChange?.(updated);
    setIsExpanded(flights.length);
  };

  const updateFlight = (index: number, field: string, value: any) => {
    const updated = flights.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFlights(updated);
    onChange?.(updated);
  };

  const deleteFlight = (index: number) => {
    const updated = flights.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({ ...item, order: i }));
    setFlights(reordered);
    onChange?.(reordered);
    setIsExpanded(null);
  };

  const getSegmentTypeLabel = (type: string) => {
    return type === "outbound" ? "가는편" : "오는편";
  };

  const getSegmentTypeColor = (type: string) => {
    return type === "outbound"
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-purple-100 text-purple-800 border-purple-300";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">항공 경로</h3>
        <button
          type="button"
          onClick={addFlight}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          항공편 추가
        </button>
      </div>

      {flights.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Plane className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">항공편이 없습니다. 항공편을 추가해주세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flights.map((flight, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() =>
                  setIsExpanded(isExpanded === index ? null : index)
                }
              >
                <div className="flex items-center gap-4">
                  <Plane className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${getSegmentTypeColor(
                          flight.segmentType
                        )}`}
                      >
                        {getSegmentTypeLabel(flight.segmentType)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {flight.airline || "항공사 미정"} {flight.flightNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {flight.departureCode} → {flight.arrivalCode}
                      {flight.duration && (
                        <span className="ml-2">
                          ({Math.floor(flight.duration / 60)}시간{" "}
                          {flight.duration % 60}분)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFlight(index);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded === index && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Segment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        구간 타입 *
                      </label>
                      <select
                        value={flight.segmentType}
                        onChange={(e) =>
                          updateFlight(index, "segmentType", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="outbound">가는편</option>
                        <option value="return">오는편</option>
                      </select>
                    </div>

                    {/* Flight Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        항공편명 *
                      </label>
                      <input
                        type="text"
                        value={flight.flightNumber}
                        onChange={(e) =>
                          updateFlight(index, "flightNumber", e.target.value)
                        }
                        placeholder="KE123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Airline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        항공사 *
                      </label>
                      <input
                        type="text"
                        value={flight.airline}
                        onChange={(e) =>
                          updateFlight(index, "airline", e.target.value)
                        }
                        placeholder="Korean Air"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Airline Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        항공사 코드
                      </label>
                      <input
                        type="text"
                        value={flight.airlineCode || ""}
                        onChange={(e) =>
                          updateFlight(index, "airlineCode", e.target.value)
                        }
                        placeholder="KE"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Departure Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      출발 정보
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          출발 공항 *
                        </label>
                        <input
                          type="text"
                          value={flight.departureAirport}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "departureAirport",
                              e.target.value
                            )
                          }
                          placeholder="Incheon International Airport"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          공항 코드 *
                        </label>
                        <input
                          type="text"
                          value={flight.departureCode}
                          onChange={(e) =>
                            updateFlight(index, "departureCode", e.target.value)
                          }
                          placeholder="ICN"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          도시
                        </label>
                        <input
                          type="text"
                          value={flight.departureCity || ""}
                          onChange={(e) =>
                            updateFlight(index, "departureCity", e.target.value)
                          }
                          placeholder="Seoul"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          국가
                        </label>
                        <input
                          type="text"
                          value={flight.departureCountry || ""}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "departureCountry",
                              e.target.value
                            )
                          }
                          placeholder="South Korea"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          출발 날짜 *
                        </label>
                        <input
                          type="date"
                          value={flight.departureDate}
                          onChange={(e) =>
                            updateFlight(index, "departureDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          출발 시간 *
                        </label>
                        <input
                          type="time"
                          value={flight.departureTime}
                          onChange={(e) =>
                            updateFlight(index, "departureTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          터미널
                        </label>
                        <input
                          type="text"
                          value={flight.departureTerminal || ""}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "departureTerminal",
                              e.target.value
                            )
                          }
                          placeholder="Terminal 1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arrival Section */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      도착 정보
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          도착 공항 *
                        </label>
                        <input
                          type="text"
                          value={flight.arrivalAirport}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "arrivalAirport",
                              e.target.value
                            )
                          }
                          placeholder="Miami International Airport"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          공항 코드 *
                        </label>
                        <input
                          type="text"
                          value={flight.arrivalCode}
                          onChange={(e) =>
                            updateFlight(index, "arrivalCode", e.target.value)
                          }
                          placeholder="MIA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          도시
                        </label>
                        <input
                          type="text"
                          value={flight.arrivalCity || ""}
                          onChange={(e) =>
                            updateFlight(index, "arrivalCity", e.target.value)
                          }
                          placeholder="Miami"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          국가
                        </label>
                        <input
                          type="text"
                          value={flight.arrivalCountry || ""}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "arrivalCountry",
                              e.target.value
                            )
                          }
                          placeholder="USA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          도착 날짜 *
                        </label>
                        <input
                          type="date"
                          value={flight.arrivalDate}
                          onChange={(e) =>
                            updateFlight(index, "arrivalDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          도착 시간 *
                        </label>
                        <input
                          type="time"
                          value={flight.arrivalTime}
                          onChange={(e) =>
                            updateFlight(index, "arrivalTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          터미널
                        </label>
                        <input
                          type="text"
                          value={flight.arrivalTerminal || ""}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "arrivalTerminal",
                              e.target.value
                            )
                          }
                          placeholder="Terminal 3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      비행 정보
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          비행 시간 (분)
                        </label>
                        <input
                          type="number"
                          value={flight.duration || ""}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "duration",
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          placeholder="915"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          기종
                        </label>
                        <input
                          type="text"
                          value={flight.aircraft || ""}
                          onChange={(e) =>
                            updateFlight(index, "aircraft", e.target.value)
                          }
                          placeholder="Boeing 777"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          좌석 등급
                        </label>
                        <select
                          value={flight.cabinClass || ""}
                          onChange={(e) =>
                            updateFlight(index, "cabinClass", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">선택</option>
                          <option value="economy">이코노미</option>
                          <option value="business">비즈니스</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          경유 횟수
                        </label>
                        <input
                          type="number"
                          value={flight.stops}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "stops",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          수하물 허용량
                        </label>
                        <input
                          type="text"
                          value={flight.baggageAllowance || ""}
                          onChange={(e) =>
                            updateFlight(
                              index,
                              "baggageAllowance",
                              e.target.value
                            )
                          }
                          placeholder="23kg x 2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={flight.mealService}
                          onChange={(e) =>
                            updateFlight(index, "mealService", e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          기내식 제공
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
