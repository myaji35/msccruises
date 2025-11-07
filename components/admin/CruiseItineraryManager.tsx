"use client";

import { useState } from "react";
import { Plus, Trash2, MapPin, Clock, Calendar } from "lucide-react";

interface CruiseItinerary {
  id?: string;
  day: number;
  portType: string;
  port: string;
  portCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  arrival?: string;
  departure?: string;
  durationHours?: number;
  activities?: string;
  description?: string;
  imageUrl?: string;
  order: number;
}

interface CruiseItineraryManagerProps {
  cruiseId: string;
  initialItineraries?: CruiseItinerary[];
  onChange?: (itineraries: CruiseItinerary[]) => void;
}

export default function CruiseItineraryManager({
  cruiseId,
  initialItineraries = [],
  onChange,
}: CruiseItineraryManagerProps) {
  const [itineraries, setItineraries] =
    useState<CruiseItinerary[]>(initialItineraries);
  const [isExpanded, setIsExpanded] = useState<number | null>(null);

  const addItinerary = () => {
    const newItinerary: CruiseItinerary = {
      day: itineraries.length + 1,
      portType: "port_of_call",
      port: "",
      order: itineraries.length,
    };
    const updated = [...itineraries, newItinerary];
    setItineraries(updated);
    onChange?.(updated);
    setIsExpanded(itineraries.length);
  };

  const updateItinerary = (index: number, field: string, value: any) => {
    const updated = itineraries.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItineraries(updated);
    onChange?.(updated);
  };

  const deleteItinerary = (index: number) => {
    const updated = itineraries.filter((_, i) => i !== index);
    // Re-order days
    const reordered = updated.map((item, i) => ({
      ...item,
      day: i + 1,
      order: i,
    }));
    setItineraries(reordered);
    onChange?.(reordered);
    setIsExpanded(null);
  };

  const getPortTypeLabel = (type: string) => {
    switch (type) {
      case "departure":
        return "출발";
      case "port_of_call":
        return "경유";
      case "arrival":
        return "도착";
      default:
        return type;
    }
  };

  const getPortTypeColor = (type: string) => {
    switch (type) {
      case "departure":
        return "bg-green-100 text-green-800 border-green-300";
      case "port_of_call":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "arrival":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">크루즈 항로</h3>
        <button
          type="button"
          onClick={addItinerary}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          항로 추가
        </button>
      </div>

      {itineraries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">항로가 없습니다. 항로를 추가해주세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {itineraries.map((itinerary, index) => (
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
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                    {itinerary.day}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${getPortTypeColor(
                          itinerary.portType
                        )}`}
                      >
                        {getPortTypeLabel(itinerary.portType)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {itinerary.port || "항구 미정"}
                      </span>
                      {itinerary.portCode && (
                        <span className="text-sm text-gray-500">
                          ({itinerary.portCode})
                        </span>
                      )}
                    </div>
                    {itinerary.country && (
                      <p className="text-sm text-gray-600 mt-1">
                        {itinerary.country}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {itinerary.arrival && (
                    <span className="text-sm text-gray-600">
                      도착: {itinerary.arrival}
                    </span>
                  )}
                  {itinerary.departure && (
                    <span className="text-sm text-gray-600">
                      출발: {itinerary.departure}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItinerary(index);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded === index && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Day */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        일차 (Day)
                      </label>
                      <input
                        type="number"
                        value={itinerary.day}
                        onChange={(e) =>
                          updateItinerary(
                            index,
                            "day",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Port Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        항구 타입
                      </label>
                      <select
                        value={itinerary.portType}
                        onChange={(e) =>
                          updateItinerary(index, "portType", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="departure">출발</option>
                        <option value="port_of_call">경유</option>
                        <option value="arrival">도착</option>
                      </select>
                    </div>

                    {/* Port Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        항구명 *
                      </label>
                      <input
                        type="text"
                        value={itinerary.port}
                        onChange={(e) =>
                          updateItinerary(index, "port", e.target.value)
                        }
                        placeholder="Miami"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Port Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        항구 코드 (IATA)
                      </label>
                      <input
                        type="text"
                        value={itinerary.portCode || ""}
                        onChange={(e) =>
                          updateItinerary(index, "portCode", e.target.value)
                        }
                        placeholder="MIA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        국가
                      </label>
                      <input
                        type="text"
                        value={itinerary.country || ""}
                        onChange={(e) =>
                          updateItinerary(index, "country", e.target.value)
                        }
                        placeholder="USA"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Arrival Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        도착 시간
                      </label>
                      <input
                        type="time"
                        value={itinerary.arrival || ""}
                        onChange={(e) =>
                          updateItinerary(index, "arrival", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Departure Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        출발 시간
                      </label>
                      <input
                        type="time"
                        value={itinerary.departure || ""}
                        onChange={(e) =>
                          updateItinerary(index, "departure", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Duration Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        체류 시간 (시간)
                      </label>
                      <input
                        type="number"
                        value={itinerary.durationHours || ""}
                        onChange={(e) =>
                          updateItinerary(
                            index,
                            "durationHours",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Latitude */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        위도 (Latitude)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={itinerary.latitude || ""}
                        onChange={(e) =>
                          updateItinerary(
                            index,
                            "latitude",
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        placeholder="25.7617"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Longitude */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        경도 (Longitude)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={itinerary.longitude || ""}
                        onChange={(e) =>
                          updateItinerary(
                            index,
                            "longitude",
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        placeholder="-80.1918"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      활동 (JSON 배열)
                    </label>
                    <textarea
                      value={itinerary.activities || ""}
                      onChange={(e) =>
                        updateItinerary(index, "activities", e.target.value)
                      }
                      placeholder='["Beach Tour", "City Sightseeing", "Shopping"]'
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설명
                    </label>
                    <textarea
                      value={itinerary.description || ""}
                      onChange={(e) =>
                        updateItinerary(index, "description", e.target.value)
                      }
                      placeholder="항구에 대한 설명을 입력하세요"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이미지 URL
                    </label>
                    <input
                      type="url"
                      value={itinerary.imageUrl || ""}
                      onChange={(e) =>
                        updateItinerary(index, "imageUrl", e.target.value)
                      }
                      placeholder="https://example.com/port-image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
